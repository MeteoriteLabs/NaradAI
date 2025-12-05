import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  MessageSquare, 
  MousePointer, 
  Sparkles, 
  BarChart3, 
  Code2,
  ArrowRight,
  Check,
  Play
} from "lucide-react";
import { SiGoogle } from "react-icons/si";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Narada AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <Button onClick={handleLogin} data-testid="button-header-login">
            Get Started
          </Button>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Voice-Powered Website Guide
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Guide visitors with
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  AI voice assistant
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Narada understands your website, listens to visitors, and guides them through 
                digital journeys using voice AI, contextual highlights, and smart navigation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" onClick={handleLogin} className="gap-2 text-base px-8" data-testid="button-hero-signup">
                  <SiGoogle className="w-4 h-4" />
                  Sign up with Google
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base px-8" data-testid="button-hero-demo">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-2">
                Free to start. No credit card required.
              </p>
            </div>

            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
              <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
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
                <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                      <Mic className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <p className="text-lg font-medium">AI-Powered Dashboard</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Create agents, train knowledge bases, and deploy voice guides in minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to guide visitors</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A complete platform for creating intelligent, voice-powered website experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Voice AI Assistant</h3>
                  <p className="text-muted-foreground">
                    Natural voice conversations powered by OpenAI. Visitors can speak and get instant, helpful responses.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
                  <p className="text-muted-foreground">
                    Train your AI with Q&A pairs, documents, and FAQs. It learns your business and answers accurately.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <MousePointer className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Guided Tours</h3>
                  <p className="text-muted-foreground">
                    Create interactive walkthroughs with highlights and tooltips. Guide users step-by-step.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analytics & Insights</h3>
                  <p className="text-muted-foreground">
                    Track conversations, understand visitor intent, and optimize your customer journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Lead Capture</h3>
                  <p className="text-muted-foreground">
                    Automatically capture visitor information during conversations. Turn chats into qualified leads.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Code2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
                  <p className="text-muted-foreground">
                    One line of code to embed. Works with any website - Shopify, WordPress, React, or custom builds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Get started in 3 steps</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Deploy your AI voice guide in minutes, not weeks
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto">
                  1
                </div>
                <h3 className="text-xl font-semibold">Create Your Agent</h3>
                <p className="text-muted-foreground">
                  Define your AI's personality, voice style, and add knowledge from your existing content.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto">
                  2
                </div>
                <h3 className="text-xl font-semibold">Set Up Flows</h3>
                <p className="text-muted-foreground">
                  Create guided tours, event tracking, and automated responses for common questions.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto">
                  3
                </div>
                <h3 className="text-xl font-semibold">Embed & Launch</h3>
                <p className="text-muted-foreground">
                  Copy one line of code to your website. Your AI guide is live instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground">
                Start free, upgrade when you're ready
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Free</h3>
                    <div className="text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                    <p className="text-muted-foreground">Perfect for trying out Narada</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>1 AI Agent</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>100 conversations/month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Basic analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Email support</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full" onClick={handleLogin} data-testid="button-pricing-free">
                      Get Started Free
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Pro</h3>
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">Popular</span>
                    </div>
                    <div className="text-4xl font-bold">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                    <p className="text-muted-foreground">For growing businesses</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Unlimited AI Agents</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Unlimited conversations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Custom voice styles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <Button className="w-full" onClick={handleLogin} data-testid="button-pricing-pro">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to transform your website experience?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of businesses using Narada to guide visitors, capture leads, and boost conversions.
              </p>
              <Button size="lg" onClick={handleLogin} className="gap-2 text-base px-8" data-testid="button-cta-signup">
                <SiGoogle className="w-4 h-4" />
                Sign up with Google - It's free
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Narada AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Narada AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
