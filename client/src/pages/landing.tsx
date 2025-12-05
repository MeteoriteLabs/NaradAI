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
  Shield
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
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-pricing">Pricing</a>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1" data-testid="link-nav-docs">
              <BookOpen className="w-4 h-4" />
              Documentation
            </Link>
          </motion.nav>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="outline" onClick={handleDemoLogin} data-testid="button-header-demo">
              <Play className="w-4 h-4 mr-2" />
              Demo
            </Button>
            <Button onClick={handleLogin} data-testid="button-header-login">
              Get Started
            </Button>
          </motion.div>
        </div>
      </header>

      <main>
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
                Guide visitors with
                <motion.span 
                  className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, delay: prefersReducedMotion ? 0 : 0.3 }}
                >
                  AI voice assistant
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                variants={variants.fadeInUp}
              >
                Narada understands your website, listens to visitors, and guides them through 
                digital journeys using voice AI, contextual highlights, and smart navigation.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                variants={variants.fadeInUp}
              >
                <Button size="lg" onClick={handleLogin} className="gap-2 text-base px-8 shadow-lg shadow-primary/25" data-testid="button-hero-signup">
                  <ArrowRight className="w-4 h-4" />
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" onClick={handleDemoLogin} className="gap-2 text-base px-8" data-testid="button-hero-demo">
                  <Play className="w-4 h-4" />
                  Try Demo
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
                    <span className="text-xs text-muted-foreground">dashboard.narada.ai</span>
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
                    <p className="text-lg font-medium">AI-Powered Dashboard</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Create agents, train knowledge bases, and deploy voice guides in minutes
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

        <section id="features" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to guide visitors</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A complete platform for creating intelligent, voice-powered website experiences
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

        <section id="how-it-works" className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">Get started in 3 steps</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Deploy your AI voice guide in minutes, not weeks
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
                        {["1 AI Agent", "100 conversations/month", "Basic analytics", "Email support"].map((item) => (
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
                        {["Unlimited AI Agents", "Unlimited conversations", "Advanced analytics", "Custom voice styles", "Priority support"].map((item) => (
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
                Ready to transform your website experience?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of businesses using Narada to guide visitors, capture leads, and boost conversions.
              </p>
              <motion.div
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
                Voice-powered website guide that transforms how visitors experience your site.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors" data-testid="link-footer-pricing">Pricing</a></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-about">About</a></li>
                <li><a href="mailto:support@narada.ai" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</a></li>
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
          
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Narada AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-bottom-privacy">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-bottom-terms">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
