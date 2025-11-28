const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const Account = require('../models/Account');
const Product = require('../models/Product');
const SalesTeam = require('../models/SalesTeam');
const SalesPipeline = require('../models/SalesPipeline');
const asyncHandler = require('../utils/asyncHandler');

// Helper to read and parse CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Normalize product names (fix inconsistencies like "GTXPro" -> "GTX Pro")
function normalizeProductName(name) {
  if (!name) return name;
  return name
    .replace(/GTXPro/gi, 'GTX Pro')
    .replace(/GTXBasic/gi, 'GTX Basic')
    .replace(/GTXPlus/gi, 'GTX Plus')
    .trim();
}

// Import all sales data from CSV files
exports.importData = asyncHandler(async (req, res) => {
  const dataDir = req.body.dataDir || path.join(__dirname, '../../../../data');
  
  if (!fs.existsSync(dataDir)) {
    return res.status(400).json({ 
      error: 'Data directory not found',
      path: dataDir,
      hint: 'Pass dataDir in request body or place CSV files in /data folder'
    });
  }

  const results = {
    accounts: 0,
    products: 0,
    salesTeams: 0,
    pipeline: 0,
    errors: []
  };

  try {
    // 1. Import Accounts
    const accountsPath = path.join(dataDir, 'accounts.csv');
    if (fs.existsSync(accountsPath)) {
      const accountsData = parseCSV(accountsPath);
      await Account.deleteMany({});
      
      const accounts = accountsData.map(row => ({
        name: row.account,
        sector: row.sector,
        yearEstablished: row.year_established ? parseInt(row.year_established) : null,
        revenue: row.revenue ? parseFloat(row.revenue) : 0,
        employees: row.employees ? parseInt(row.employees) : 0,
        officeLocation: row.office_location,
        subsidiaryOf: row.subsidiary_of || null
      }));
      
      await Account.insertMany(accounts, { ordered: false });
      results.accounts = accounts.length;
    }

    // 2. Import Products
    const productsPath = path.join(dataDir, 'products.csv');
    if (fs.existsSync(productsPath)) {
      const productsData = parseCSV(productsPath);
      await Product.deleteMany({});
      
      const products = productsData.map(row => ({
        name: normalizeProductName(row.product),
        series: row.series,
        salesPrice: row.sales_price ? parseInt(row.sales_price) : 0
      }));
      
      await Product.insertMany(products, { ordered: false });
      results.products = products.length;
    }

    // 3. Import Sales Teams
    const teamsPath = path.join(dataDir, 'sales_teams.csv');
    if (fs.existsSync(teamsPath)) {
      const teamsData = parseCSV(teamsPath);
      await SalesTeam.deleteMany({});
      
      const teams = teamsData.map(row => ({
        name: row.sales_agent,
        manager: row.manager,
        regionalOffice: row.regional_office
      }));
      
      await SalesTeam.insertMany(teams, { ordered: false });
      results.salesTeams = teams.length;
    }

    // 4. Import Sales Pipeline
    const pipelinePath = path.join(dataDir, 'sales_pipeline.csv');
    if (fs.existsSync(pipelinePath)) {
      const pipelineData = parseCSV(pipelinePath);
      await SalesPipeline.deleteMany({});
      
      // Process in batches for large datasets
      const batchSize = 1000;
      for (let i = 0; i < pipelineData.length; i += batchSize) {
        const batch = pipelineData.slice(i, i + batchSize);
        
        const deals = batch.map(row => {
          const engageDate = row.engage_date ? new Date(row.engage_date) : null;
          const closeDate = row.close_date ? new Date(row.close_date) : null;
          
          let daysToClose = null;
          if (engageDate && closeDate) {
            daysToClose = Math.ceil(Math.abs(closeDate - engageDate) / (1000 * 60 * 60 * 24));
          }
          
          let quarter = null;
          if (closeDate) {
            const year = closeDate.getFullYear();
            const month = closeDate.getMonth();
            const q = Math.floor(month / 3) + 1;
            quarter = `${year}-Q${q}`;
          }
          
          return {
            opportunityId: row.opportunity_id,
            salesAgent: row.sales_agent,
            product: normalizeProductName(row.product),
            account: row.account || null,
            dealStage: row.deal_stage,
            engageDate,
            closeDate,
            closeValue: row.close_value ? parseInt(row.close_value) : 0,
            daysToClose,
            quarter
          };
        });
        
        await SalesPipeline.insertMany(deals, { ordered: false });
        results.pipeline += deals.length;
      }
    }

    // 5. Update computed metrics
    await updateComputedMetrics();

    res.json({
      success: true,
      message: 'Data imported successfully',
      results
    });

  } catch (error) {
    results.errors.push(error.message);
    res.status(500).json({
      success: false,
      message: 'Import failed',
      results,
      error: error.message
    });
  }
});

// Update computed metrics for accounts, products, and sales teams
async function updateComputedMetrics() {
  // Update Account metrics
  const accountStats = await SalesPipeline.aggregate([
    { $match: { account: { $ne: null } } },
    {
      $group: {
        _id: '$account',
        totalDeals: { $sum: 1 },
        wonDeals: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, 1, 0] } },
        lifetimeValue: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, '$closeValue', 0] } }
      }
    }
  ]);

  for (const stat of accountStats) {
    await Account.updateOne(
      { name: stat._id },
      { totalDeals: stat.totalDeals, wonDeals: stat.wonDeals, lifetimeValue: stat.lifetimeValue }
    );
  }

  // Update Product metrics
  const productStats = await SalesPipeline.aggregate([
    {
      $group: {
        _id: '$product',
        totalDeals: { $sum: 1 },
        wonDeals: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, 1, 0] } },
        lostDeals: { $sum: { $cond: [{ $eq: ['$dealStage', 'Lost'] }, 1, 0] } },
        totalRevenue: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, '$closeValue', 0] } }
      }
    }
  ]);

  for (const stat of productStats) {
    const closed = stat.wonDeals + stat.lostDeals;
    const winRate = closed > 0 ? (stat.wonDeals / closed) * 100 : 0;
    await Product.updateOne(
      { name: stat._id },
      { totalSold: stat.wonDeals, totalRevenue: stat.totalRevenue, winRate }
    );
  }

  // Update Sales Team metrics
  const agentStats = await SalesPipeline.aggregate([
    {
      $group: {
        _id: '$salesAgent',
        totalDeals: { $sum: 1 },
        wonDeals: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, 1, 0] } },
        lostDeals: { $sum: { $cond: [{ $eq: ['$dealStage', 'Lost'] }, 1, 0] } },
        totalRevenue: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, '$closeValue', 0] } }
      }
    }
  ]);

  for (const stat of agentStats) {
    const closed = stat.wonDeals + stat.lostDeals;
    const winRate = closed > 0 ? (stat.wonDeals / closed) * 100 : 0;
    const avgDealSize = stat.wonDeals > 0 ? stat.totalRevenue / stat.wonDeals : 0;
    
    await SalesTeam.updateOne(
      { name: stat._id },
      { 
        totalDeals: stat.totalDeals, 
        wonDeals: stat.wonDeals, 
        lostDeals: stat.lostDeals,
        totalRevenue: stat.totalRevenue, 
        winRate,
        avgDealSize
      }
    );
  }
}

// Get pipeline statistics
exports.getPipelineStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, product, region } = req.query;
  
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.closeDate = {};
    if (startDate) matchStage.closeDate.$gte = new Date(startDate);
    if (endDate) matchStage.closeDate.$lte = new Date(endDate);
  }
  if (product) matchStage.product = product;

  // If region filter, get agents in that region first
  let agentFilter = null;
  if (region) {
    const agents = await SalesTeam.find({ regionalOffice: region }).select('name');
    agentFilter = agents.map(a => a.name);
    if (agentFilter.length) matchStage.salesAgent = { $in: agentFilter };
  }

  // Stage distribution
  const stageStats = await SalesPipeline.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$dealStage',
        count: { $sum: 1 },
        totalValue: { $sum: '$closeValue' }
      }
    }
  ]);

  // Overall stats
  const overallStats = await SalesPipeline.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDeals: { $sum: 1 },
        wonDeals: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, 1, 0] } },
        lostDeals: { $sum: { $cond: [{ $eq: ['$dealStage', 'Lost'] }, 1, 0] } },
        totalRevenue: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, '$closeValue', 0] } },
        avgDaysToClose: { $avg: '$daysToClose' }
      }
    }
  ]);

  const stats = overallStats[0] || { totalDeals: 0, wonDeals: 0, lostDeals: 0, totalRevenue: 0 };
  const closedDeals = stats.wonDeals + stats.lostDeals;
  const winRate = closedDeals > 0 ? (stats.wonDeals / closedDeals) * 100 : 0;
  const avgDealSize = stats.wonDeals > 0 ? stats.totalRevenue / stats.wonDeals : 0;

  // Monthly trend
  const monthlyTrend = await SalesPipeline.aggregate([
    { $match: { ...matchStage, closeDate: { $ne: null } } },
    {
      $group: {
        _id: { 
          year: { $year: '$closeDate' }, 
          month: { $month: '$closeDate' } 
        },
        won: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ['$dealStage', 'Lost'] }, 1, 0] } },
        revenue: { $sum: { $cond: [{ $eq: ['$dealStage', 'Won'] }, '$closeValue', 0] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    stages: stageStats.reduce((acc, s) => {
      acc[s._id] = { count: s.count, value: s.totalValue };
      return acc;
    }, {}),
    summary: {
      totalDeals: stats.totalDeals,
      wonDeals: stats.wonDeals,
      lostDeals: stats.lostDeals,
      openDeals: stats.totalDeals - stats.wonDeals - stats.lostDeals,
      totalRevenue: stats.totalRevenue,
      winRate: Math.round(winRate * 10) / 10,
      avgDealSize: Math.round(avgDealSize),
      avgDaysToClose: Math.round(stats.avgDaysToClose || 0)
    },
    monthlyTrend: monthlyTrend.map(m => ({
      period: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      won: m.won,
      lost: m.lost,
      revenue: m.revenue
    }))
  });
});

// Get team leaderboard
exports.getTeamLeaderboard = asyncHandler(async (req, res) => {
  const { sortBy = 'totalRevenue', region, manager } = req.query;
  
  const filter = {};
  if (region) filter.regionalOffice = region;
  if (manager) filter.manager = manager;

  const sortField = ['totalRevenue', 'winRate', 'totalDeals', 'wonDeals'].includes(sortBy) 
    ? sortBy : 'totalRevenue';

  const agents = await SalesTeam.find(filter)
    .sort({ [sortField]: -1 })
    .lean();

  // Get unique managers and regions for filters
  const managers = await SalesTeam.distinct('manager');
  const regions = await SalesTeam.distinct('regionalOffice');

  // Manager rollup
  const managerStats = await SalesTeam.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$manager',
        teamSize: { $sum: 1 },
        totalRevenue: { $sum: '$totalRevenue' },
        totalDeals: { $sum: '$totalDeals' },
        wonDeals: { $sum: '$wonDeals' },
        avgWinRate: { $avg: '$winRate' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  res.json({
    agents,
    managers: managerStats,
    filters: { managers, regions }
  });
});

// Get product analytics
exports.getProductAnalytics = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ totalRevenue: -1 }).lean();

  // Get series-level stats
  const seriesStats = await Product.aggregate([
    {
      $group: {
        _id: '$series',
        productCount: { $sum: 1 },
        totalRevenue: { $sum: '$totalRevenue' },
        totalSold: { $sum: '$totalSold' },
        avgPrice: { $avg: '$salesPrice' },
        avgWinRate: { $avg: '$winRate' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  // Product by deal stage
  const productStages = await SalesPipeline.aggregate([
    {
      $group: {
        _id: { product: '$product', stage: '$dealStage' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Transform to product -> stages mapping
  const stagesByProduct = {};
  for (const ps of productStages) {
    if (!stagesByProduct[ps._id.product]) {
      stagesByProduct[ps._id.product] = {};
    }
    stagesByProduct[ps._id.product][ps._id.stage] = ps.count;
  }

  res.json({
    products,
    seriesStats,
    stagesByProduct
  });
});

// Get account details with deal history
exports.getAccountDetails = asyncHandler(async (req, res) => {
  const { name } = req.params;
  
  const account = await Account.findOne({ name }).lean();
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  // Get all deals for this account
  const deals = await SalesPipeline.find({ account: name })
    .sort({ closeDate: -1 })
    .lean();

  // Get subsidiaries
  const subsidiaries = await Account.find({ subsidiaryOf: name })
    .select('name sector revenue employees')
    .lean();

  // Get parent company if exists
  let parent = null;
  if (account.subsidiaryOf) {
    parent = await Account.findOne({ name: account.subsidiaryOf })
      .select('name sector revenue employees')
      .lean();
  }

  res.json({
    account,
    deals,
    subsidiaries,
    parent,
    stats: {
      totalDeals: deals.length,
      wonDeals: deals.filter(d => d.dealStage === 'Won').length,
      lostDeals: deals.filter(d => d.dealStage === 'Lost').length,
      openDeals: deals.filter(d => !['Won', 'Lost'].includes(d.dealStage)).length,
      totalValue: deals.filter(d => d.dealStage === 'Won').reduce((sum, d) => sum + d.closeValue, 0)
    }
  });
});

// List all accounts with pagination and filters
exports.getAccounts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sector, location, sortBy = 'lifetimeValue' } = req.query;
  
  const filter = {};
  if (sector) filter.sector = sector;
  if (location) filter.officeLocation = location;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [accounts, total, sectors, locations] = await Promise.all([
    Account.find(filter)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Account.countDocuments(filter),
    Account.distinct('sector'),
    Account.distinct('officeLocation')
  ]);

  res.json({
    accounts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    filters: { sectors, locations }
  });
});

// Get deals list with filters
exports.getDeals = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    stage, 
    product, 
    agent,
    account,
    sortBy = 'closeDate'
  } = req.query;
  
  const filter = {};
  if (stage) filter.dealStage = stage;
  if (product) filter.product = product;
  if (agent) filter.salesAgent = agent;
  if (account) filter.account = { $regex: account, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [deals, total] = await Promise.all([
    SalesPipeline.find(filter)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    SalesPipeline.countDocuments(filter)
  ]);

  res.json({
    deals,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});
