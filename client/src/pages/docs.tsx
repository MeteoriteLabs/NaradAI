import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Copy, Check, ChevronRight, Bot, BookOpen, Tag, GitBranch, Code, Zap, Settings, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted p-4 pr-20 rounded-lg text-xs overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-2 right-2 gap-1"
        onClick={handleCopy}
        data-testid="button-copy-code"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3" />
            <span data-testid="text-copied">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </Button>
    </div>
  );
}

interface DocSection {
  id: string;
  title: string;
  icon: any;
  content: {
    title: string;
    description: string;
    steps?: string[];
    code?: string;
    tips?: string[];
  }[];
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    content: [
      {
        title: "What is Narada AI?",
        description: "Narada AI is a voice-based website guide that understands user behavior, listens to speech, reads page context, and guides visitors through digital journeys using contextual AI, UI highlights, and voice narration. It's embeddable with a single script tag.",
      },
      {
        title: "Quick Start",
        description: "Get started with Narada AI in just 3 simple steps:",
        steps: [
          "Create an AI agent in the Agents dashboard",
          "Configure your agent's persona and voice style",
          "Copy the embed code and add it to your website"
        ],
      },
      {
        title: "Prerequisites",
        description: "Before you begin, make sure you have:",
        steps: [
          "A Narada AI account with access to the dashboard",
          "A website where you want to embed the AI assistant",
          "Basic understanding of HTML (for embedding the script)"
        ],
      },
      {
        title: "Your First Agent",
        description: "Create your first AI agent by navigating to the Agents page and clicking 'New Agent'. Fill in the required details:",
        steps: [
          "Agent Name: A descriptive name for your assistant (e.g., 'Product Guide')",
          "Persona: Describe how your agent should behave and respond",
          "Voice Style: Choose from available voice options"
        ],
      }
    ]
  },
  {
    id: "creating-agents",
    title: "Creating Agents",
    icon: Bot,
    content: [
      {
        title: "Agent Configuration",
        description: "Each agent represents a unique AI assistant with its own personality and voice. Configure your agent with the following settings:",
        steps: [
          "Name: The display name shown to users",
          "Persona: A detailed description of behavior, tone, and expertise",
          "Voice Style: Select from Alloy, Echo, Fable, Onyx, Nova, or Shimmer"
        ],
      },
      {
        title: "Writing Effective Personas",
        description: "A good persona helps the AI understand how to interact with visitors. Include:",
        tips: [
          "Define the agent's role (e.g., 'You are a friendly product specialist')",
          "Specify the tone (formal, casual, enthusiastic, professional)",
          "List key topics the agent should be knowledgeable about",
          "Set boundaries for what the agent should and shouldn't discuss"
        ],
        code: `Example Persona:

You are a friendly and helpful customer support agent for 
TechStore. You specialize in helping customers find the 
right products, explaining technical specifications in 
simple terms, and guiding them through the purchasing 
process. Always be patient, clear, and professional. 
If you don't know something, offer to connect the 
customer with a human agent.`
      },
      {
        title: "Voice Styles",
        description: "Choose the right voice for your brand:",
        tips: [
          "Alloy - Neutral and balanced, suitable for most use cases",
          "Echo - Clear and articulate, great for professional settings",
          "Fable - Warm and engaging, ideal for storytelling",
          "Onyx - Deep and authoritative, good for serious topics",
          "Nova - Bright and energetic, perfect for engaging experiences",
          "Shimmer - Soft and calming, excellent for support contexts"
        ]
      },
      {
        title: "Managing Agents",
        description: "From the agent detail page, you can:",
        steps: [
          "Update agent settings at any time",
          "Add knowledge base Q&A pairs",
          "Create event tracking tags",
          "Build guided flow journeys",
          "View analytics and conversations",
          "Copy the embed code for your website"
        ]
      }
    ]
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base",
    icon: BookOpen,
    content: [
      {
        title: "What is the Knowledge Base?",
        description: "The knowledge base is a collection of Q&A pairs that help your AI agent answer specific questions accurately. When a visitor asks a question that matches or is similar to one in your knowledge base, the agent can provide the exact answer you've configured.",
      },
      {
        title: "Adding Knowledge Items",
        description: "Navigate to your agent's Knowledge tab and click 'Add Knowledge'. For each item:",
        steps: [
          "Enter the question as visitors might ask it",
          "Provide a clear, helpful answer",
          "Add variations of the same question if needed"
        ],
      },
      {
        title: "Best Practices for Knowledge Base",
        description: "Optimize your knowledge base for better responses:",
        tips: [
          "Use natural language - phrase questions as real users would ask them",
          "Keep answers concise but complete",
          "Include multiple variations of common questions",
          "Update regularly based on actual user queries",
          "Organize by topic for easier management",
          "Include links or references when helpful"
        ],
      },
      {
        title: "Example Q&A Pairs",
        description: "Here are some example knowledge base entries:",
        code: `Question: What is your return policy?
Answer: We offer a 30-day money-back guarantee on all 
purchases. Items must be in original condition with tags 
attached. To initiate a return, contact our support team 
or visit the Returns page on our website.

Question: How long does shipping take?
Answer: Standard shipping takes 5-7 business days. 
Express shipping (2-3 days) is available for an 
additional fee. Free shipping on orders over $50.

Question: Do you offer international shipping?
Answer: Yes! We ship to over 50 countries. International 
shipping typically takes 10-14 business days. Customs 
fees may apply depending on your location.`
      }
    ]
  },
  {
    id: "event-tags",
    title: "Event Tags",
    icon: Tag,
    content: [
      {
        title: "Understanding Event Tags",
        description: "Event tags allow you to track user interactions on your website. When visitors interact with tagged elements, the AI agent receives contextual information about what they're viewing or clicking, enabling more relevant responses.",
      },
      {
        title: "Event Types",
        description: "Choose the appropriate event type for each tag:",
        tips: [
          "View - Triggers when the element becomes visible in the viewport",
          "Click - Triggers when the user clicks on the element",
          "Scroll - Triggers when the user scrolls to the element",
          "Custom - Triggers programmatically via your own code"
        ],
      },
      {
        title: "Creating Event Tags",
        description: "Navigate to your agent's Tags tab and click 'Add Event Tag':",
        steps: [
          "Label: A descriptive name (e.g., 'Pricing Section')",
          "CSS Selector: The element to track (e.g., '#pricing', '.hero-section')",
          "Event Type: When to trigger the event",
          "Page Pattern (optional): Limit tracking to specific pages"
        ],
      },
      {
        title: "CSS Selector Examples",
        description: "Common CSS selectors for tracking elements:",
        code: `ID Selector:
#pricing-section
#contact-form
#product-gallery

Class Selector:
.hero-section
.product-card
.testimonial-block

Attribute Selector:
[data-section="features"]
[data-product-id="123"]

Combined Selectors:
.products .card
header nav .menu-item
#main-content .pricing-tier`
      },
      {
        title: "Page Patterns",
        description: "Limit event tracking to specific pages:",
        tips: [
          "/pricing - Only on the pricing page",
          "/products/* - Any page under /products/",
          "/blog/* - All blog posts",
          "Leave empty to track on all pages"
        ]
      }
    ]
  },
  {
    id: "flows",
    title: "Flows & Journeys",
    icon: GitBranch,
    content: [
      {
        title: "What are Flows?",
        description: "Flows are guided tours that highlight specific elements on your page and provide step-by-step guidance to visitors. They combine visual UI highlights with voice narration to create an interactive onboarding or educational experience.",
      },
      {
        title: "Creating a Flow",
        description: "Navigate to your agent's Flows tab:",
        steps: [
          "Click 'New Flow' to create a new journey",
          "Enter a descriptive name (e.g., 'Product Tour')",
          "Optionally specify a page URL where the flow applies",
          "Add steps to define the journey sequence"
        ],
      },
      {
        title: "Adding Flow Steps",
        description: "Each step in a flow includes:",
        steps: [
          "Title: The step name shown to users",
          "CSS Selector: The element to highlight",
          "Tooltip Text: Instructions displayed in the tooltip",
          "Voice Script: What the AI will say during this step"
        ],
      },
      {
        title: "Step Configuration Example",
        description: "Here's how to configure effective flow steps:",
        code: `Step 1: Welcome
Selector: #welcome-banner
Tooltip: "Welcome to our product! Let me show you around."
Voice: "Hello! Welcome to our platform. I'm going to give 
you a quick tour of the main features. Let's get started!"

Step 2: Navigation
Selector: nav.main-menu
Tooltip: "This is the main navigation menu"
Voice: "Here's your main navigation. You can access all 
major sections of the site from this menu."

Step 3: Feature Highlight
Selector: #key-feature
Tooltip: "This is our most popular feature"
Voice: "This is where the magic happens. Our AI-powered 
feature helps you automate your workflow in seconds."`
      },
      {
        title: "Flow Best Practices",
        description: "Create engaging and effective guided tours:",
        tips: [
          "Keep flows to 5-7 steps for optimal engagement",
          "Use clear, conversational language in voice scripts",
          "Highlight actionable elements users should interact with",
          "Test flows on different screen sizes",
          "Provide an option to skip or exit the tour"
        ]
      }
    ]
  },
  {
    id: "integration",
    title: "Integration",
    icon: Code,
    content: [
      {
        title: "Embedding the Widget",
        description: "Add the Narada AI widget to your website with a single script tag. Copy this code and paste it before the closing </body> tag on your website:",
        code: `<script 
  src="https://cdn.narada.ai/embed.js" 
  data-agent-id="your-agent-id" 
  data-api-base="https://your-api-url.com"
  async>
</script>`
      },
      {
        title: "Configuration Attributes",
        description: "Customize the widget behavior with data attributes:",
        tips: [
          "data-agent-id (required) - Your unique agent identifier",
          "data-api-base (required) - The API server URL",
          "data-position - Widget position: 'bottom-right' (default) or 'bottom-left'",
          "data-theme - Color theme: 'light', 'dark', or 'auto'",
          "data-language - Interface language code (e.g., 'en', 'es', 'fr')"
        ],
      },
      {
        title: "Finding Your Agent ID",
        description: "Get your agent ID from the dashboard:",
        steps: [
          "Navigate to the Agents page",
          "Click on your agent to open the detail page",
          "Go to the 'Embed' tab",
          "Copy the complete embed code or just the agent ID"
        ],
      },
      {
        title: "Testing the Integration",
        description: "Verify your widget is working correctly:",
        steps: [
          "Add the embed code to your website",
          "Reload the page - the widget should appear in the corner",
          "Click the widget to open the chat interface",
          "Test voice input and responses",
          "Check that event tags are triggering correctly"
        ],
      },
      {
        title: "Troubleshooting",
        description: "Common issues and solutions:",
        tips: [
          "Widget not appearing? Check that the script is loading (browser console)",
          "No voice? Ensure microphone permissions are granted",
          "Connection issues? Verify the data-api-base URL is correct",
          "CORS errors? Make sure your domain is whitelisted",
          "Styling conflicts? The widget uses Shadow DOM for isolation"
        ]
      }
    ]
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: Settings,
    content: [
      {
        title: "REST API Overview",
        description: "The Narada AI API provides RESTful endpoints for managing agents, knowledge, tags, flows, and analytics. All requests should include appropriate headers and authentication.",
      },
      {
        title: "Agent Endpoints",
        description: "Manage your AI agents:",
        code: `# List all agents
GET /api/agents

# Create a new agent
POST /api/agents
Content-Type: application/json
{
  "name": "Support Bot",
  "persona": "A helpful customer support agent",
  "voiceStyle": "alloy"
}

# Get a specific agent
GET /api/agents/:id

# Update an agent
PUT /api/agents/:id
Content-Type: application/json
{
  "name": "Updated Name",
  "persona": "Updated persona"
}

# Delete an agent
DELETE /api/agents/:id`
      },
      {
        title: "Knowledge Endpoints",
        description: "Manage knowledge base Q&A pairs:",
        code: `# List knowledge items for an agent
GET /api/agents/:agentId/knowledge

# Add a knowledge item
POST /api/agents/:agentId/knowledge
Content-Type: application/json
{
  "question": "What is your return policy?",
  "answer": "30-day money-back guarantee..."
}

# Delete a knowledge item
DELETE /api/knowledge/:id`
      },
      {
        title: "Event Tag Endpoints",
        description: "Manage event tracking tags:",
        code: `# List tags for an agent
GET /api/agents/:agentId/tags

# Create a new tag
POST /api/agents/:agentId/tags
Content-Type: application/json
{
  "label": "Pricing Section",
  "selector": "#pricing",
  "event_type": "view",
  "page_pattern": "/pricing"
}

# Delete a tag
DELETE /api/tags/:id`
      },
      {
        title: "Flow Endpoints",
        description: "Manage guided flows and steps:",
        code: `# List flows for an agent
GET /api/agents/:agentId/flows

# Create a new flow
POST /api/agents/:agentId/flows
Content-Type: application/json
{
  "name": "Product Tour",
  "page_url": "/products"
}

# List steps in a flow
GET /api/flows/:flowId/steps

# Add a step to a flow
POST /api/flows/:flowId/steps
Content-Type: application/json
{
  "title": "Welcome",
  "selector": "#welcome",
  "tooltip_text": "Welcome message",
  "voice_script": "Hello and welcome!",
  "order": 1
}

# Delete a step
DELETE /api/steps/:id`
      },
      {
        title: "WebSocket Connection",
        description: "Real-time voice communication uses WebSocket:",
        code: `WebSocket URL:
ws://your-api-url.com/ws/agents/:agentId/sessions/:sessionId

Message Types:
- audio_input: Send audio data for transcription
- text_input: Send text message
- context_update: Send page context information
- flow_trigger: Trigger a guided flow

Example Connection:
const ws = new WebSocket(
  \`wss://api.narada.ai/ws/agents/\${agentId}/sessions/\${sessionId}\`
);

ws.onopen = () => {
  // Send context
  ws.send(JSON.stringify({
    type: 'context_update',
    data: {
      url: window.location.href,
      title: document.title
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle response
};`
      }
    ]
  },
  {
    id: "best-practices",
    title: "Best Practices",
    icon: Lightbulb,
    content: [
      {
        title: "Creating Effective AI Agents",
        description: "Tips for building agents that provide great user experiences:",
        tips: [
          "Write detailed, specific personas - the more context, the better",
          "Test your agent with various question types before deploying",
          "Regularly review conversations to identify knowledge gaps",
          "Keep your knowledge base updated with new FAQs",
          "Use appropriate voice styles that match your brand"
        ],
      },
      {
        title: "Optimizing Knowledge Base",
        description: "Make your knowledge base more effective:",
        tips: [
          "Add question variations for the same topic",
          "Use natural, conversational language",
          "Keep answers concise but comprehensive",
          "Include links and references when helpful",
          "Organize by categories for easier maintenance",
          "Review and update based on user feedback"
        ],
      },
      {
        title: "Event Tag Strategy",
        description: "Strategic use of event tags enhances context:",
        tips: [
          "Tag key conversion points (pricing, signup, checkout)",
          "Track content consumption (article sections, videos)",
          "Monitor navigation patterns (menu clicks, page transitions)",
          "Use page patterns to avoid tracking irrelevant pages",
          "Don't over-tag - focus on meaningful interactions"
        ],
      },
      {
        title: "Flow Design Principles",
        description: "Create flows that engage without overwhelming:",
        tips: [
          "Keep tours to 5-7 steps maximum",
          "Start with a warm welcome and context setting",
          "Progress logically through the interface",
          "End with a clear call-to-action",
          "Always provide a skip option",
          "Test on mobile devices"
        ],
      },
      {
        title: "Performance Optimization",
        description: "Ensure smooth performance:",
        tips: [
          "Load the widget asynchronously (async attribute)",
          "Use specific CSS selectors for faster element matching",
          "Limit the number of active event tags per page",
          "Test on slower connections and devices",
          "Monitor analytics for performance issues"
        ],
      },
      {
        title: "Accessibility Considerations",
        description: "Make your AI assistant accessible to all users:",
        tips: [
          "Ensure the widget is keyboard navigable",
          "Provide text alternatives for voice interactions",
          "Use sufficient color contrast in any custom styling",
          "Test with screen readers",
          "Support both voice and text input methods"
        ]
      }
    ]
  }
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("getting-started");
  const [expandedMobileToc, setExpandedMobileToc] = useState(false);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return docSections;
    
    const query = searchQuery.toLowerCase();
    return docSections.map(section => ({
      ...section,
      content: section.content.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.steps?.some(step => step.toLowerCase().includes(query)) ||
        item.tips?.some(tip => tip.toLowerCase().includes(query)) ||
        item.code?.toLowerCase().includes(query)
      )
    })).filter(section => section.content.length > 0);
  }, [searchQuery]);

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    setExpandedMobileToc(false);
  };

  const currentSection = filteredSections.find(s => s.id === activeTab) || filteredSections[0];

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Mobile TOC Accordion */}
      <div className="lg:hidden border-b p-4">
        <Accordion type="single" collapsible value={expandedMobileToc ? "toc" : ""}>
          <AccordionItem value="toc" className="border-none">
            <AccordionTrigger 
              onClick={() => setExpandedMobileToc(!expandedMobileToc)}
              className="py-2"
              data-testid="button-toggle-mobile-toc"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Table of Contents</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <nav className="space-y-1 pt-2">
                {docSections.map((section) => {
                  const Icon = section.icon;
                  const isFiltered = filteredSections.some(s => s.id === section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      disabled={!isFiltered}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                        activeTab === section.id
                          ? "bg-primary text-primary-foreground"
                          : isFiltered
                          ? "hover:bg-muted"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                      data-testid={`toc-mobile-${section.id}`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop Sidebar TOC */}
      <aside className="hidden lg:block w-64 border-r flex-shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col z-50 bg-background">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Documentation</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-1">
              {docSections.map((section) => {
                const Icon = section.icon;
                const isFiltered = filteredSections.some(s => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    disabled={!isFiltered}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      activeTab === section.id
                        ? "bg-primary text-primary-foreground"
                        : isFiltered
                        ? "hover:bg-muted"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                    data-testid={`toc-${section.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.title}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-docs"
            />
          </div>

          {/* Tab Navigation for Desktop */}
          <div className="hidden lg:block mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1">
                {filteredSections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="gap-1.5"
                    data-testid={`tab-${section.id}`}
                  >
                    <section.icon className="w-3.5 h-3.5" />
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          {filteredSections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query
                </p>
              </CardContent>
            </Card>
          ) : currentSection ? (
            <div
              ref={(el) => { contentRefs.current[currentSection.id] = el; }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <currentSection.icon className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{currentSection.title}</h1>
              </div>

              {currentSection.content.map((item, index) => (
                <Card key={index} className="overflow-hidden" data-testid={`card-content-${currentSection.id}-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid={`text-title-${currentSection.id}-${index}`}>{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.steps && (
                      <ol className="space-y-2" data-testid={`list-steps-${currentSection.id}-${index}`}>
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-3">
                            <Badge variant="secondary" className="mt-0.5 flex-shrink-0" data-testid={`badge-step-${stepIndex + 1}`}>
                              {stepIndex + 1}
                            </Badge>
                            <span className="text-sm" data-testid={`text-step-${currentSection.id}-${index}-${stepIndex}`}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {item.tips && (
                      <ul className="space-y-2" data-testid={`list-tips-${currentSection.id}-${index}`}>
                        {item.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm" data-testid={`item-tip-${currentSection.id}-${index}-${tipIndex}`}>
                            <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {item.code && (
                      <CodeBlock code={item.code} />
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                {filteredSections.findIndex(s => s.id === activeTab) > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = filteredSections.findIndex(s => s.id === activeTab);
                      if (currentIndex > 0) {
                        scrollToSection(filteredSections[currentIndex - 1].id);
                      }
                    }}
                    data-testid="button-prev-section"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
                    Previous
                  </Button>
                )}
                <div className="flex-1" />
                {filteredSections.findIndex(s => s.id === activeTab) < filteredSections.length - 1 && (
                  <Button
                    onClick={() => {
                      const currentIndex = filteredSections.findIndex(s => s.id === activeTab);
                      if (currentIndex < filteredSections.length - 1) {
                        scrollToSection(filteredSections[currentIndex + 1].id);
                      }
                    }}
                    data-testid="button-next-section"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
