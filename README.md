<p align="center">
  <img src="https://raw.githubusercontent.com/luxmikant/MSKJ_crm/main/ma-sharvari-ki-jai/client/public/logo.svg" alt="SharCRM Logo" width="200"/>
</p>

<h1 align="center">SharCRM</h1>

<p align="center">
  <strong>🚀 A Next-Generation AI-Powered CRM Platform</strong>
</p>

<p align="center">
  Live at <a href="https://www.sharcrm.app/">https://www.sharcrm.app/</a> • Updated Nov 2025
</p>

<p align="center">
  <a href="#motivation">Motivation</a> •
  <a href="#features">Features</a> •
  <a href="#ai-capabilities">AI</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss" alt="Tailwind"/>
</p>

---

## 💡 Motivation

Modern businesses struggle with fragmented customer data, inefficient campaign management, and lack of actionable insights. SharCRM was born from the need to:

- **Unify customer data** across touchpoints into a single source of truth
- **Democratize AI** by making intelligent insights accessible without data science expertise
- **Accelerate campaigns** from days to minutes with smart segmentation and AI-generated content
- **Visualize health scores** to proactively identify at-risk customers before churn
- **Scale personalization** without scaling headcount

> *"We built SharCRM because we believe every business deserves enterprise-grade CRM intelligence, not just Fortune 500 companies."*

---

## ✨ Features

### 📊 **Intelligent Dashboard**
Real-time KPIs with animated counters, sparkline trends, and AI-powered anomaly detection. Glass-morphic design with smooth Framer Motion animations.

### 👥 **Smart Customer Segmentation**
- Drag-and-drop segment builder with AND/OR logic
- AI-generated segment suggestions based on behavior patterns
- Real-time preview with audience size estimates
- Health score tracking (0-100) with predictive churn indicators

### 📢 **Campaign Management**
- Multi-channel campaigns (Email, SMS, Push)
- Template library with variable interpolation
- A/B testing with statistical significance tracking
- Delivery status monitoring with retry logic

### 🔍 **Customer 360° View**
Complete customer profiles with purchase history, communication timeline, health trends, and predicted lifetime value.

### 📈 **Sales Pipeline**
Kanban-style deal tracking, revenue forecasting, and team performance analytics.

---

## 🤖 AI Capabilities

SharCRM integrates AI throughout the platform using **Google Gemini** with graceful fallbacks:

| Feature | Endpoint | Description |
|---------|----------|-------------|
| **Message Suggestions** | `/api/ai/suggest-message` | Generate 3 campaign message variants with tone/channel awareness |
| **Segment Generation** | `/api/segments/ai/generate` | AI-proposed segments based on business goals |
| **Email Composer** | `/api/ai/generate-email` | Full email generation (subject, preheader, body) |
| **Smart Insights** | Dashboard widgets | Anomaly detection and trend analysis |

### AI Architecture
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Frontend UI    │────▶│  API Layer   │────▶│  AI Service     │
│  (React + Vite) │     │  (Express)   │     │  (Gemini/GPT)   │
└─────────────────┘     └──────────────┘     └─────────────────┘
                              │                      │
                              ▼                      ▼
                        ┌──────────┐          ┌───────────────┐
                        │ MongoDB  │          │ Fallback Gen  │
                        └──────────┘          └───────────────┘
```

### Configuration
```env
# AI Provider (Google Gemini recommended)
GOOGLE_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# Fallback: OpenAI
OPENAI_API_KEY=your-openai-key
```

**Key Design Decisions:**
- Lazy-load AI SDKs to prevent cold-start crashes
- All AI responses annotated with `usedAI: true` flag
- 10-second timeout with automatic fallback
- Rate limiting (100 req/15min) to prevent abuse

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| Vite | Build Tool | 5.x |
| TypeScript | Type Safety | 5.x |
| Tailwind CSS | Styling | 3.x |
| Framer Motion | Animations | 10.x |
| Recharts | Data Visualization | 2.x |
| React Router | Navigation | 6.x |
| CVA | Variant Management | 0.7.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Express | API Framework | 5.x |
| MongoDB | Database | 7.x |
| Mongoose | ODM | 8.x |
| JWT | Authentication | - |
| Sentry | Error Tracking | - |
| Helmet | Security | - |

### Infrastructure
- **Hosting**: Render (Web Service + Static Site)
- **Database**: MongoDB Atlas
- **CDN**: Render Edge
- **Monitoring**: Sentry + Custom Logging

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud API Key (for AI features)

### Local Development

```bash
# Clone repository
git clone https://github.com/luxmikant/MSKJ_crm.git
cd MSKJ_crm

# Install dependencies
cd ma-sharvari-ki-jai/server && npm install
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
# Edit .env with your MONGO_URI, JWT_SECRET, GOOGLE_API_KEY

# Start development servers
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend  
cd client
npm run dev
```

### Environment Variables

**Server (.env)**
```env
MONGO_URI=mongodb://localhost:27017/sharcrm
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
GOOGLE_API_KEY=your-gemini-key
```

**Client (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-oauth-client-id
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SharCRM Platform                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Landing Page  │  │   Dashboard     │  │   Campaigns     │  │
│  │   (Public)      │  │   (Protected)   │  │   (Protected)   │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│           ▼                    ▼                    ▼           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Router (v6)                      │   │
│  │              + Auth Context + Toast Provider              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     API Layer (api.ts)                    │   │
│  │                  Fetch wrapper + Error handling           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Express Backend (5.x)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │   Auth     │  │  Segments  │  │  Campaigns │  │    AI     │  │
│  │  Routes    │  │   Routes   │  │   Routes   │  │  Service  │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘  │
│        │               │               │               │        │
│        ▼               ▼               ▼               ▼        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Mongoose ODM (v8)                      │   │
│  │              Models: Customer, Segment, Campaign          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   MongoDB Atlas     │
                    │   (Cloud Database)  │
                    └─────────────────────┘
```

---

## 📋 Technical Considerations

### Performance Optimizations
- **Code Splitting**: React lazy loading for route-based chunks
- **Virtual Scrolling**: Large customer lists use windowing
- **Debounced Search**: 300ms debounce on filter inputs
- **Skeleton Loading**: Perceived performance with loading states
- **Image Optimization**: WebP with fallbacks, lazy loading

### Security Measures
- **Helmet.js**: HTTP security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: HttpOnly cookies, short expiry
- **Input Validation**: Mongoose schema validation + sanitization
- **CORS**: Strict origin whitelisting
- **XSS Prevention**: React's built-in escaping + CSP headers

### Scalability
- **Horizontal Scaling**: Stateless API design
- **Database Indexing**: Compound indexes on frequently queried fields
- **Connection Pooling**: Mongoose connection optimization
- **Caching Strategy**: (Planned) Redis for session and query caching

---

## 🗺 Roadmap

### ✅ Completed (v2.0)
- [x] Modern UI with lime/yellow branding
- [x] AI-powered message suggestions
- [x] Customer health scoring
- [x] Sales pipeline management
- [x] Animated cursor effects
- [x] Glass-morphic design system

### 🔄 In Progress (v2.1)
- [ ] Real-time collaboration
- [ ] Webhook integrations
- [ ] Advanced analytics dashboard
- [ ] Mobile-responsive improvements

### 📅 Planned (v3.0)
- [ ] **Predictive Analytics**: ML-powered churn prediction
- [ ] **Workflow Automation**: Visual automation builder
- [ ] **Multi-tenant SaaS**: Organization management
- [ ] **Native Mobile Apps**: React Native iOS/Android
- [ ] **GraphQL API**: Flexible data fetching
- [ ] **Plugin Ecosystem**: Third-party integrations

### 🌟 Future Vision
- **Conversational AI**: Chat-based CRM interactions
- **Voice Commands**: Hands-free data entry
- **AR Customer Insights**: Spatial data visualization
- **Blockchain Audit Trail**: Immutable activity logs

---

## 🚢 Deployment

### Render (Recommended)

1. Push to GitHub
2. Create Blueprint from `render.yaml`
3. Configure environment variables:
   - `MONGO_URI` (MongoDB Atlas)
   - `VITE_GOOGLE_CLIENT_ID` (OAuth)
   - `GOOGLE_API_KEY` (AI features)

### Docker (Alternative)

```dockerfile
# Build
docker build -t sharcrm-server ./server
docker build -t sharcrm-client ./client

# Run
docker-compose up -d
```

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT © 2025 SharCRM Team

---

<p align="center">
  <strong>Built with ❤️ for modern businesses</strong>
</p>

<p align="center">
  <a href="https://github.com/luxmikant/MSKJ_crm">⭐ Star us on GitHub</a>
</p>
