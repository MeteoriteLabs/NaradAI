import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";
import { 
  Mic, 
  MessageSquare, 
  MousePointer, 
  Sparkles, 
  BarChart3, 
  Code2,
  ArrowRight,
  Check,
  Play,
  BookOpen,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  UserPlus,
  Headphones,
  Globe,
  Laptop,
  MessageCircle,
  ChevronRight,
  Star,
  Award,
  PieChart
} from "lucide-react";
import { Link } from "wouter";

const createAnimationVariants = (prefersReducedMotion: boolean | null) => ({
  fadeInUp: {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0.2 : 0.5 }
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  },
  scaleIn: {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: prefersReducedMotion ? 0.2 : 0.5 }
  }
});

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const variants = createAnimationVariants(prefersReducedMotion);
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleDemoLogin = () => {
    window.location.href = "/api/demo-login";
  };

  const features = [
    {
      icon: Mic,
      title: "Voice AI Assistant",
      description: "Natural voice conversations powered by OpenAI. Visitors speak and get instant, helpful responses."
    },
    {
      icon: MessageSquare,
      title: "Knowledge Base",
      description: "Train your AI with Q&A pairs and FAQs. It learns your business and answers accurately."
    },
    {
      icon: MousePointer,
      title: "Guided Tours",
      description: "Create interactive walkthroughs with highlights and tooltips. Guide users step-by-step."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track conversations, understand visitor intent, and optimize your customer journey."
    },
    {
      icon: Sparkles,
      title: "Lead Capture",
      description: "Automatically capture visitor information during conversations. Turn chats into leads."
    },
    {
      icon: Code2,
      title: "Easy Integration",
      description: "One line of code to embed. Works with any website - Shopify, WordPress, or custom."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Create Your Agent",
      description: "Define your AI's personality, voice style, and add knowledge from your existing content."
    },
    {
      number: 2,
      title: "Set Up Flows",
      description: "Create guided tours, event tracking, and automated responses for common questions."
    },
    {
      number: 3,
      title: "Embed & Launch",
      description: "Copy one line of code to your website. Your AI guide is live instantly."
    }
  ];

  const leadBenefits = [
    {
      icon: UserPlus,
      title: "Automatic Lead Capture",
      description: "Every conversation is an opportunity. Narada intelligently collects contact info, preferences, and intent without interrupting the natural flow."
    },
    {
      icon: Target,
      title: "Qualified Leads Only",
      description: "AI pre-qualifies visitors by understanding their needs. Your sales team receives leads that are ready to convert."
    },
    {
      icon: Clock,
      title: "24/7 Lead Generation",
      description: "Never miss a potential customer. Your AI assistant works around the clock capturing leads even when you're offline."
    },
    {
      icon: PieChart,
      title: "Lead Scoring",
      description: "Automatically rank leads based on engagement, intent signals, and conversation depth. Focus on what matters."
    }
  ];

  const salesBenefits = [
    {
      icon: TrendingUp,
      stat: "3x",
      label: "Faster Sales Cycle",
      description: "Instant answers eliminate delays. Customers get information immediately and move faster to purchase."
    },
    {
      icon: DollarSign,
      stat: "40%",
      label: "Higher Conversion",
      description: "Guided experiences reduce confusion. Visitors find what they need and complete purchases."
    },
    {
      icon: Users,
      stat: "60%",
      label: "Less Support Load",
      description: "AI handles common questions automatically, freeing your team for high-value interactions."
    },
    {
      icon: Clock,
      stat: "24/7",
      label: "Always Available",
      description: "Your virtual salesperson never sleeps. Capture sales opportunities any time of day."
    }
  ];

  const customerBenefits = [
    {
      icon: Headphones,
      title: "Instant Help, Anytime",
      description: "No waiting for support. Customers get immediate answers through natural voice conversation."
    },
    {
      icon: MousePointer,
      title: "Guided Navigation",
      description: "Visual highlights show exactly where to click. No more getting lost on complex websites."
    },
    {
      icon: MessageCircle,
      title: "Personalized Experience",
      description: "AI remembers preferences and context, providing tailored recommendations and assistance."
    },
    {
      icon: Globe,
      title: "Accessibility First",
      description: "Voice interface makes your site accessible to everyone, including those who prefer not to type."
    }
  ];

  const widgetStyles = [
    {
      name: "Voice Bar",
      description: "Clean, minimal bar at the bottom of the screen",
      position: "bottom"
    },
    {
      name: "Floating Bubble",
      description: "Friendly chat bubble in the corner",
      position: "corner"
    },
    {
      name: "Corner Card",
      description: "Elegant card with avatar and quick actions",
      position: "corner-large"
    }
  ];

  const testimonials = [
    {
      quote: "Our sales team loves Narada. Leads come in pre-qualified and ready to buy.",
      author: "Sarah Chen",
      role: "Head of Sales, TechFlow",
      rating: 5
    },
    {
      quote: "Setup took 10 minutes. We saw 35% more engagement in the first week.",
      author: "Marcus Johnson",
      role: "E-commerce Director, StyleHub",
      rating: 5
    },
    {
      quote: "The voice AI feels natural. Our customers actually enjoy using it.",
      author: "Emily Rodriguez",
      role: "Product Manager, HealthFirst",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Narada AI</span>
          </motion.div>
          <motion.nav 
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-features">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-how-it-works">How it Works</a>
            <a href="#leads" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-leads">Lead Capture</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-pricing">Pricing</a>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1" data-testid="link-nav-docs">
              <BookOpen className="w-4 h-4" />
              Docs
            </Link>
          </motion.nav>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" onClick={handleLogin} data-testid="button-header-signin">
              Sign In
            </Button>
            <Button onClick={handleLogin} data-testid="button-header-getstarted">
              Get Started
            </Button>
          </motion.div>
        </div>
      </header>

      <main>
        {/* Section 1: Hero */}
        <section className="pt-32 pb-20 px-6 overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-6"
              initial="initial"
              animate="animate"
              variants={variants.staggerContainer}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                variants={variants.fadeInUp}
              >
                <Sparkles className="w-4 h-4" />
                Voice-Powered Website Guide
              </motion.div>
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                variants={variants.fadeInUp}
              >
                Turn visitors into
                <motion.span 
                  className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, delay: prefersReducedMotion ? 0 : 0.3 }}
                >
                  customers instantly
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                variants={variants.fadeInUp}
              >
                Narada is your AI sales assistant that guides website visitors, answers questions 
                instantly, and captures qualified leads - all through natural voice conversation.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                variants={variants.fadeInUp}
              >
                <Button size="lg" onClick={handleLogin} className="gap-2 text-base px-8 shadow-lg shadow-primary/25" data-testid="button-hero-signup">
                  <ArrowRight className="w-4 h-4" />
                  Get Started Free
                </Button>
              </motion.div>
              <motion.p 
                className="text-sm text-muted-foreground pt-2"
                variants={variants.fadeInUp}
              >
                Free to start. No credit card required.
              </motion.p>
            </motion.div>

            <motion.div 
              className="mt-16 relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-3xl opacity-50" />
              <div className="relative rounded-2xl border bg-card shadow-2xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground">yourwebsite.com</span>
                  </div>
                </div>
                <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center relative">
                  <motion.div 
                    className="text-center space-y-4 p-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-lg shadow-primary/30"
                      animate={{ 
                        boxShadow: [
                          "0 0 20px rgba(var(--primary-rgb), 0.3)",
                          "0 0 40px rgba(var(--primary-rgb), 0.4)",
                          "0 0 20px rgba(var(--primary-rgb), 0.3)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Mic className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <p className="text-lg font-medium">"How can I help you today?"</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Voice AI ready to guide your customers to exactly what they need
                    </p>
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg border shadow-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm">Voice assistant active</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Trust Bar */}
        <section className="py-12 px-6 border-y bg-muted/20">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Instant Setup</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">24/7 AI Support</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Real-time Analytics</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: Core Features */}
        <section id="features" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to convert visitors</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A complete platform for creating intelligent, voice-powered website experiences that sell
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={variants.staggerContainer}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={variants.scaleIn}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
                >
                  <Card className="hover-elevate h-full group">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Section 4: Lead Capture Benefits */}
        <section id="leads" className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                <UserPlus className="w-4 h-4" />
                Smart Lead Generation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Capture more leads, automatically</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every conversation is a chance to connect. Narada captures visitor information naturally, 
                without annoying forms or pop-ups.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {leadBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-16 p-8 rounded-2xl bg-card border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">85%</div>
                  <p className="text-sm text-muted-foreground">Higher lead capture rate vs. traditional forms</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">3x</div>
                  <p className="text-sm text-muted-foreground">More qualified leads per month</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">2min</div>
                  <p className="text-sm text-muted-foreground">Average time to first lead after install</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 5: Sales & Revenue Impact */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Boost Your Sales
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Drive instant sales on your website</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your AI sales assistant works 24/7 to guide visitors, answer questions, and close deals - 
                without adding to your team.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {salesBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover-elevate">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                        <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-1">{benefit.stat}</div>
                      <h3 className="font-semibold mb-2">{benefit.label}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Customer Experience */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium">
                  <Headphones className="w-4 h-4" />
                  Better Customer Experience
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Guide your customers to success</h2>
                <p className="text-lg text-muted-foreground">
                  Happy customers buy more and come back. Narada ensures every visitor gets the help 
                  they need, exactly when they need it.
                </p>
                <div className="space-y-4">
                  {customerBenefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <benefit.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl opacity-50" />
                <div className="relative rounded-2xl border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Narada Assistant</p>
                      <p className="text-xs text-muted-foreground">Active and listening</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">"I'm looking for a gift under $50"</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3 max-w-[80%] ml-auto">
                      <p className="text-sm">Great! I found 12 perfect options. Let me show you our top-rated gifts in that range.</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">"Show me something for my mom"</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3 max-w-[80%] ml-auto">
                      <p className="text-sm">Perfect! Here are our most popular gifts for moms. I'll highlight the bestsellers for you.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 7: For Sales Teams */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium">
                <Award className="w-4 h-4" />
                For Sales Teams
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Empower your sales team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Give your team superpowers. Narada handles initial engagement so salespeople 
                can focus on closing deals with qualified prospects.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full hover-elevate">
                  <CardContent className="pt-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Pre-Qualified Leads</h3>
                    <p className="text-muted-foreground">
                      Every lead comes with context - what they're looking for, their budget, 
                      timeline, and specific needs. No more cold outreach.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Conversation transcripts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Intent scoring</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Product interests</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full hover-elevate">
                  <CardContent className="pt-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Save Hours Daily</h3>
                    <p className="text-muted-foreground">
                      Stop answering the same questions. Narada handles FAQs, product info, 
                      and initial discovery automatically.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Automated responses</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>24/7 availability</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>No training needed</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full hover-elevate">
                  <CardContent className="pt-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Performance Insights</h3>
                    <p className="text-muted-foreground">
                      Know what customers ask, what they care about, and where they 
                      drop off. Data-driven selling.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Conversation analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Lead source tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>ROI dashboard</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 8: How It Works */}
        <section id="how-it-works" className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Get started in 3 simple steps</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Deploy your AI sales assistant in minutes, not weeks
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.number}
                  className="text-center space-y-4 relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                  )}
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto relative z-10 shadow-lg shadow-primary/25"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 9: Widget Styles */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Choose your style</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three beautiful widget designs to match your brand
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {widgetStyles.map((style, index) => (
                <motion.div
                  key={style.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover-elevate overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted/20 relative">
                      <div className="absolute inset-0 flex items-end justify-center p-4">
                        {style.position === "bottom" && (
                          <div className="w-full h-14 bg-card border rounded-lg flex items-center justify-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Mic className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="text-sm text-muted-foreground">Tap to speak...</span>
                          </div>
                        )}
                        {style.position === "corner" && (
                          <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <MessageCircle className="w-6 h-6 text-primary-foreground" />
                          </div>
                        )}
                        {style.position === "corner-large" && (
                          <div className="absolute bottom-4 right-4 w-48 bg-card border rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary-foreground" />
                              </div>
                              <span className="text-sm font-medium">Need help?</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Click to start a voice conversation</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold mb-1">{style.name}</h3>
                      <p className="text-sm text-muted-foreground">{style.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 10: Testimonials */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Loved by businesses</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See what our customers say about Narada
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 11: Pricing */}
        <section id="pricing" className="py-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div 
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground">
                Start free, upgrade when you're ready
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={variants.staggerContainer}
            >
              <motion.div variants={variants.scaleIn}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Free</h3>
                      <div className="text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                      <p className="text-muted-foreground">Perfect for trying out Narada</p>
                      <ul className="space-y-3">
                        {["1 AI Agent", "100 conversations/month", "Basic lead capture", "Email support"].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" className="w-full" onClick={handleLogin} data-testid="button-pricing-free">
                        Get Started Free
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={variants.scaleIn}>
                <Card className="border-primary relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <CardContent className="pt-6 relative">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="text-2xl font-bold">Pro</h3>
                        <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">Popular</span>
                      </div>
                      <div className="text-4xl font-bold">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                      <p className="text-muted-foreground">For growing businesses</p>
                      <ul className="space-y-3">
                        {["Unlimited AI Agents", "Unlimited conversations", "Advanced lead scoring", "Custom voice styles", "Priority support"].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full shadow-lg shadow-primary/25" onClick={handleLogin} data-testid="button-pricing-pro">
                        Start Free Trial
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 12: Final CTA */}
        <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to boost your sales?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of businesses using Narada to guide visitors, capture leads, 
                and convert more customers every day.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button size="lg" onClick={handleLogin} className="gap-2 text-base px-8 shadow-lg shadow-primary/25" data-testid="button-cta-signup">
                  <ArrowRight className="w-4 h-4" />
                  Get Started Free
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-6 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Narada AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Voice-powered sales assistant that turns website visitors into customers.
              </p>
              <Button variant="outline" onClick={handleDemoLogin} className="gap-2" data-testid="button-footer-demo">
                <Play className="w-4 h-4" />
                Try Demo
              </Button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="#leads" className="hover:text-foreground transition-colors" data-testid="link-footer-leads">Lead Capture</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors" data-testid="link-footer-pricing">Pricing</a></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-about">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-blog">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-careers">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Narada AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
