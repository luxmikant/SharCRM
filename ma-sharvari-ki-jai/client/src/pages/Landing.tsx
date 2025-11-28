/**
 * SharCRM Landing Page - Modern Marketing Site
 * @version 2.0.0
 */
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import { Typewriter } from '../components/ui/Typewriter'
import { 
  Users, 
  Target, 
  BarChart3, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Shield,
  TrendingUp,
  MessageSquare,
  Heart,
  ChevronDown,
  Globe,
  Clock,
  Award,
  Layers,
  MousePointer,
  Bot
} from 'lucide-react'
import { useAuth } from '../state/AuthContext'
import { apiFetch } from '../api'

// Floating Orb Component
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
      animate={{
        x: [0, 100, 50, 0],
        y: [0, -50, 100, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  )
}

// Animated Background Grid
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
    </div>
  )
}

// Feature Card with Interactive Demo
function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group ${feature.span || ''}`}
    >
      <motion.div
        className={`
          relative h-full p-8 rounded-3xl bg-white border border-gray-100 
          overflow-hidden transition-all duration-500
          ${isHovered ? 'shadow-2xl shadow-brand-500/10 border-brand-200' : 'shadow-lg'}
        `}
        whileHover={{ y: -8 }}
      >
        {/* Gradient Background on Hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500`}
          animate={{ opacity: isHovered ? 0.05 : 0 }}
        />
        
        {/* Icon */}
        <motion.div
          className={`
            relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6
            bg-gradient-to-br ${feature.gradient} shadow-lg
          `}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <feature.icon className="w-7 h-7 text-white" />
        </motion.div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
          <p className="text-gray-600 leading-relaxed">{feature.description}</p>
        </div>
        
        {/* Decorative Elements */}
        <motion.div
          className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-gray-100 to-gray-50"
          animate={{ scale: isHovered ? 1.2 : 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </motion.div>
  )
}

// Testimonial Card
function TestimonialCard({ testimonial, index }: { testimonial: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -8 }}
      className="flex-shrink-0 w-[400px]"
    >
      <Card variant="glass" className="h-full backdrop-blur-sm bg-white/80 border-white/20">
        <CardContent className="p-8">
          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </motion.div>
            ))}
          </div>
          
          {/* Quote */}
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            "{testimonial.text}"
          </p>
          
          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-gray-900 font-bold text-lg">
              {testimonial.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Browser Mockup for Demo
function BrowserMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/20 border border-gray-200">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 mx-4 px-4 py-1.5 bg-white rounded-lg text-sm text-gray-500 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          <span>sharcrm.app/dashboard</span>
        </div>
      </div>
      {/* Content */}
      <div className="bg-gray-50">
        {children}
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [metrics, setMetrics] = useState<any>(null)
  const heroRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => {
      // @ts-ignore
      window.google?.accounts.id.initialize({
        client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        callback: async (response: any) => {
          try {
            const idToken = response.credential
            const data = await apiFetch<{ token?: string }>(`/api/auth/google`, {
              method: 'POST',
              body: JSON.stringify({ idToken }),
            })
            if (data?.token) {
              setToken(data.token)
              navigate('/dashboard')
            }
          } catch (e) {}
        },
      })
      // @ts-ignore
      window.google?.accounts.id.renderButton(document.getElementById('google-btn'), { theme: 'outline', size: 'large' })
    }
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [setToken])

  useEffect(() => {
    apiFetch<any>('/api/public/metrics').then(setMetrics).catch(() => {})
  }, [])

  const features = [
    { 
      icon: Bot, 
      title: 'AI-Powered Insights', 
      description: 'Predictive analytics that forecast customer behavior and recommend next best actions automatically.',
      gradient: 'from-brand-400 to-brand-600',
      span: 'md:col-span-2'
    },
    { 
      icon: Target, 
      title: 'Smart Segmentation', 
      description: 'Create dynamic customer segments with our intuitive drag-and-drop builder.',
      gradient: 'from-accent-400 to-accent-600'
    },
    { 
      icon: MessageSquare, 
      title: 'Email Campaigns', 
      description: 'Design beautiful campaigns with SendGrid integration and real-time tracking.',
      gradient: 'from-brand-500 to-brand-700'
    },
    { 
      icon: Heart, 
      title: 'Health Scoring', 
      description: 'Track customer health with AI-powered scoring and churn prediction alerts.',
      gradient: 'from-accent-500 to-accent-700',
      span: 'md:row-span-2'
    },
    { 
      icon: BarChart3, 
      title: 'Advanced Analytics', 
      description: 'Real-time insights with beautiful visualizations and comprehensive reports.',
      gradient: 'from-brand-400 to-accent-500'
    },
    { 
      icon: Zap, 
      title: 'Automation', 
      description: 'Automate workflows and save valuable time with intelligent triggers.',
      gradient: 'from-accent-400 to-brand-500'
    },
  ]

  const stats = [
    { label: 'Active Users', value: 10000, suffix: '+', icon: Users },
    { label: 'Customer Satisfaction', value: 98, suffix: '%', icon: Heart },
    { label: 'Messages Sent', value: 1000000, suffix: '+', icon: MessageSquare },
    { label: 'Time Saved', value: 40, suffix: 'hrs/wk', icon: Clock },
  ]

  const testimonials = [
    { name: 'Sarah Johnson', role: 'VP of Sales', company: 'TechStart Inc', text: 'This CRM transformed how we manage our customer relationships. The AI insights are game-changing!' },
    { name: 'Mike Chen', role: 'Marketing Director', company: 'Growth Co', text: "The campaign builder is so intuitive. We've doubled our email engagement rates since switching." },
    { name: 'Lisa Rodriguez', role: 'CEO', company: 'Scale Solutions', text: 'Best CRM for growing businesses. The health scoring helped us reduce churn by 35%.' },
    { name: 'David Park', role: 'CTO', company: 'Innovation Labs', text: 'The API and integrations are top-notch. Seamlessly fits into our existing workflow.' },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-brand-300/30">
                <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <rect width="50" height="50" rx="10" fill="#CCFF00"/>
                  <rect x="5" y="5" width="40" height="40" rx="8" stroke="#000" strokeWidth="2.5" fill="none"/>
                  <path d="M5 25 Q25 8 45 25 Q25 42 5 25" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                SHARCRM
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
            </div>
            
            <div className="flex items-center gap-3">
              <div id="google-btn" className="hidden sm:flex" />
              <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
              <Button onClick={() => navigate('/login')}>
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <GridBackground />
        
        {/* Floating Orbs */}
        <FloatingOrb className="w-96 h-96 bg-brand-200 top-20 -left-48" />
        <FloatingOrb className="w-80 h-80 bg-blue-300 top-40 right-20" delay={5} />
        <FloatingOrb className="w-64 h-64 bg-pink-300 bottom-20 left-1/3" delay={10} />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-6 px-4 py-2 bg-brand-100 text-brand-700 border-brand-300">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Now with AI-Powered Health Scores
                </Badge>
              </motion.div>
              
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="text-gray-900">
                  The Future of
                </span>
                <br />
                <span className="bg-gradient-to-r from-brand-500 via-brand-400 to-accent-500 bg-clip-text text-transparent">
                  <Typewriter 
                    words={['Customer Success', 'Sales Growth', 'Team Productivity', 'Business Intelligence']}
                    typingSpeed={80}
                  />
                </span>
              </motion.h1>
              
              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                AI-powered CRM that predicts customer needs, automates workflows, 
                and grows with your business. Join 10,000+ companies already transforming their relationships.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button size="xl" onClick={() => navigate('/login')}>
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="xl">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div
                className="flex flex-wrap gap-6 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SOC 2 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>GDPR Compliant</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right - Dashboard Preview */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
                style={{ perspective: 1000 }}
              >
                <BrowserMockup>
                  <div className="p-6 min-h-[500px] bg-gradient-to-br from-gray-50 to-white">
                    {/* Mini Dashboard Preview */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { label: 'Revenue', value: '$124K', change: '+12%', color: 'green' },
                        { label: 'Customers', value: '2,847', change: '+8%', color: 'blue' },
                        { label: 'Health Score', value: '94%', change: '+3%', color: 'purple' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                        >
                          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                          <p className={`text-xs text-${stat.color}-600`}>{stat.change}</p>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Chart Placeholder */}
                    <motion.div
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-48 flex items-end gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {[40, 65, 50, 80, 60, 90, 75, 85, 70, 95, 80, 88].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-md"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.9 + i * 0.05, duration: 0.5 }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </BrowserMockup>
              </motion.div>
              
              {/* Floating Cards */}
              <motion.div
                className="absolute -left-16 top-20 bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">+127%</p>
                    <p className="text-xs text-gray-500">Engagement</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute -right-8 bottom-32 bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">98%</p>
                    <p className="text-xs text-gray-500">Satisfaction</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-brand-400 via-brand-300 to-accent-400">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center text-gray-900"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 opacity-80" />
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <AnimatedCounter value={stat.value} />
                  {stat.suffix}
                </div>
                <div className="text-gray-800">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-brand-100 text-brand-700">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                delight customers
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools designed to help you understand your customers better 
              and create experiences that convert.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-24 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-brand-100 text-brand-700">Live Demo</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See it in action
            </h2>
            <p className="text-xl text-gray-600">
              Experience the power of SharCRM with our interactive demo
            </p>
          </motion.div>
          
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <BrowserMockup>
              <div className="p-8 min-h-[600px] bg-gradient-to-br from-gray-50 to-white">
                {/* Dashboard Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Revenue', value: '$1.2M', change: '+18%', color: 'from-green-500 to-emerald-500' },
                    { label: 'Active Customers', value: '12,847', change: '+12%', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Conversion Rate', value: '24.8%', change: '+5%', color: 'from-brand-400 to-brand-600' },
                    { label: 'Health Score', value: '92%', change: '+3%', color: 'from-orange-500 to-red-500' },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                    >
                      <p className="text-sm text-gray-500 mb-2">{card.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                      <div className={`inline-flex items-center gap-1 text-sm bg-gradient-to-r ${card.color} bg-clip-text text-transparent font-medium`}>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        {card.change}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  {/* Chart */}
                  <motion.div
                    className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                      <div className="flex gap-2">
                        {['1W', '1M', '3M', '1Y'].map((period) => (
                          <button key={period} className="px-3 py-1 text-xs rounded-lg hover:bg-gray-100">
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-48 flex items-end gap-2">
                      {[30, 45, 38, 52, 48, 60, 55, 70, 65, 78, 72, 85].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Recent Activity */}
                  <motion.div
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {[
                        { action: 'New signup', name: 'John D.', time: '2m ago' },
                        { action: 'Deal won', name: '$12,500', time: '15m ago' },
                        { action: 'Campaign sent', name: '2.4K emails', time: '1h ago' },
                      ].map((activity, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.name}</p>
                          </div>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </BrowserMockup>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 overflow-hidden">
        <div className="container mx-auto px-6 mb-12">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-green-100 text-green-700">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                thousands
              </span>{' '}
              of businesses
            </h2>
          </motion.div>
        </div>
        
        {/* Scrolling Testimonials */}
        <div className="relative">
          <motion.div 
            className="flex gap-6 px-6"
            animate={{ x: [0, -1600] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...testimonials, ...testimonials].map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} index={idx % testimonials.length} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <FloatingOrb className="w-96 h-96 bg-brand-300 top-0 -left-48 opacity-30" />
        <FloatingOrb className="w-80 h-80 bg-accent-400 bottom-0 right-0 opacity-30" delay={5} />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to transform your business?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of businesses using SharCRM to grow faster. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" onClick={() => navigate('/login')}>
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="glass" size="xl">
                Schedule Demo
              </Button>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect width="50" height="50" rx="10" fill="#CCFF00"/>
                    <rect x="5" y="5" width="40" height="40" rx="8" stroke="#000" strokeWidth="2.5" fill="none"/>
                    <path d="M5 25 Q25 8 45 25 Q25 42 5 25" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight">SHARCRM</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-sm">
                The modern CRM platform for growing businesses. AI-powered, intuitive, and built to scale.
              </p>
              <div className="flex gap-4">
                {['twitter', 'linkedin', 'github'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support', links: ['Help Center', 'Documentation', 'Community', 'Status'] },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400">&copy; 2025 SharCRM. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
