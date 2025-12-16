import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Copy, Settings, BookOpen, Tag, GitBranch, BarChart3, Code, CheckCircle2, XCircle, AlertCircle, Loader2, Globe, ExternalLink, Palette, Eye, Layout, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema, type Agent, ELEVENLABS_VOICES } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { KnowledgeSection } from "@/components/agent-sections/knowledge-section";
import { EventTagsSection } from "@/components/agent-sections/event-tags-section";
import { FlowsSection } from "@/components/agent-sections/flows-section";
import { AnalyticsSection } from "@/components/agent-sections/analytics-section";
import { WidgetPreviewSection } from "@/components/agent-sections/widget-preview-section";

const agentFormSchema = insertAgentSchema.extend({
  name: z.string().min(1, "Name is required"),
  autoStart: z.boolean().optional(),
  targetUrl: z.string().optional(),
  capturePageText: z.boolean().optional(),
  capturePageStructure: z.boolean().optional(),
  captureScreenshots: z.boolean().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const openaiVoiceOptions = [
  { value: "alloy", label: "Alloy" },
  { value: "ash", label: "Ash" },
  { value: "ballad", label: "Ballad" },
  { value: "coral", label: "Coral" },
  { value: "echo", label: "Echo" },
  { value: "sage", label: "Sage" },
  { value: "shimmer", label: "Shimmer" },
  { value: "verse", label: "Verse" },
];

const elevenLabsVoiceOptions = ELEVENLABS_VOICES.map((v) => ({
  value: v.id,
  label: `${v.name} - ${v.description}`,
}));

interface VerificationResult {
  verified: boolean;
  status: 'connected' | 'partial' | 'not_found' | 'error' | 'timeout';
  message: string;
}

function EmbedSection({ agentId }: { agentId: string }) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (url: string): Promise<VerificationResult> => {
      return await apiRequest("POST", `/api/agents/${agentId}/verify-installation`, { url });
    },
  });

  const apiBase = window.location.origin;
  const embedCode = `<script src="${apiBase}/embed.js" data-agent-id="${agentId}" async></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
    });
  };

  const handleVerify = () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a website URL to verify.",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(websiteUrl);
  };

  const getStatusIcon = () => {
    if (!verifyMutation.data) return null;
    
    switch (verifyMutation.data.status) {
      case 'connected':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (!verifyMutation.data) return "bg-muted";
    
    switch (verifyMutation.data.status) {
      case 'connected':
        return "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800";
      case 'partial':
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
      default:
        return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Embed Widget</CardTitle>
          <CardDescription>
            Add this code to your website to display the AI assistant widget.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 pr-24 rounded-lg text-xs overflow-x-auto font-mono">
              {`<script
  src="${apiBase}/embed.js"
  data-agent-id="${agentId}"
  async>
</script>`}
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 gap-1"
              onClick={copyEmbedCode}
              data-testid="button-copy-embed-code"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Instructions:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy the code snippet above</li>
              <li>Paste it before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag</li>
              <li>The widget will appear in the bottom-right corner</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Verify Installation
          </CardTitle>
          <CardDescription>
            Test if the widget is properly installed on your website. Enter your website URL and we'll check if the embed code is detected.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="pr-10"
                data-testid="input-website-url"
              />
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <Button
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
              className="sm:w-auto"
              data-testid="button-verify-installation"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Verify Installation"
              )}
            </Button>
          </div>

          {verifyMutation.data && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${getStatusColor()}`}
              data-testid="verification-result"
            >
              {getStatusIcon()}
              <div className="flex-1">
                <p className="font-medium" data-testid="text-verification-status">
                  {verifyMutation.data.verified ? "Connected" : "Not Connected"}
                </p>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-verification-message">
                  {verifyMutation.data.message}
                </p>
              </div>
            </div>
          )}

          {verifyMutation.error && (
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800">
              <XCircle className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">Verification Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(verifyMutation.error as Error).message || "An error occurred while verifying the installation."}
                </p>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">How verification works:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>We fetch your website and check for the Narada embed script</li>
              <li>We verify the script is configured with this agent's ID</li>
              <li>Your website must be publicly accessible for verification</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const agentId = params.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: agent, isLoading } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      persona: "",
      voiceProvider: "openai",
      voiceStyle: "alloy",
      elevenLabsVoiceId: "",
      autoStart: false,
      targetUrl: "",
      capturePageText: false,
      capturePageStructure: false,
      captureScreenshots: false,
    },
    values: agent ? {
      name: agent.name,
      persona: agent.persona || "",
      voiceProvider: agent.voiceProvider || "openai",
      voiceStyle: agent.voiceStyle || "alloy",
      elevenLabsVoiceId: agent.elevenLabsVoiceId || "",
      autoStart: agent.autoStart || false,
      targetUrl: agent.targetUrl || "",
      capturePageText: agent.capturePageText || false,
      capturePageStructure: agent.capturePageStructure || false,
      captureScreenshots: agent.captureScreenshots || false,
    } : undefined,
  });

  const watchVoiceProvider = form.watch("voiceProvider");

  const updateAgentMutation = useMutation({
    mutationFn: (data: AgentFormValues) =>
      apiRequest("PUT", `/api/agents/${agentId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId] });
      toast({
        title: "Agent updated",
        description: "Your agent settings have been saved.",
      });
    },
  });

  const copyEmbedCode = () => {
    if (!agentId) return;
    const apiBase = window.location.origin;
    const embedCode = `<script src="${apiBase}/embed.js" data-agent-id="${agentId}" async></script>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
    });
  };

  const onSubmit = (data: AgentFormValues) => {
    updateAgentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Agent not found</h2>
          <p className="text-muted-foreground mb-4">
            The agent you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/agents")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/agents")}
            data-testid="button-back-to-agents"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{agent.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">Active</Badge>
              <span className="text-sm text-muted-foreground">
                Voice: {agent.voiceStyle || "alloy"}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={copyEmbedCode} data-testid="button-copy-embed">
          <Code className="w-4 h-4 mr-2" />
          Copy Embed Code
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 h-auto">
          <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
            <Settings className="w-4 h-4 hidden sm:block" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2" data-testid="tab-knowledge">
            <BookOpen className="w-4 h-4 hidden sm:block" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2" data-testid="tab-tags">
            <Tag className="w-4 h-4 hidden sm:block" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="flows" className="gap-2" data-testid="tab-flows">
            <GitBranch className="w-4 h-4 hidden sm:block" />
            Flows
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
            <BarChart3 className="w-4 h-4 hidden sm:block" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="widget" className="gap-2" data-testid="tab-widget">
            <Palette className="w-4 h-4 hidden sm:block" />
            Widget
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-2" data-testid="tab-embed">
            <Code className="w-4 h-4 hidden sm:block" />
            Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
              <CardDescription>
                Configure your agent's name, personality, and voice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Support Bot"
                            {...field}
                            data-testid="input-agent-name"
                          />
                        </FormControl>
                        <FormDescription>
                          This name will be displayed to users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="persona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how your agent should behave..."
                            className="min-h-[120px]"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-agent-persona"
                          />
                        </FormControl>
                        <FormDescription>
                          Define the personality and behavior of your AI agent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="voiceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Provider</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "openai") {
                              form.setValue("voiceStyle", "alloy");
                              form.setValue("elevenLabsVoiceId", "");
                            } else {
                              form.setValue("voiceStyle", "");
                              form.setValue("elevenLabsVoiceId", elevenLabsVoiceOptions[0]?.value || "");
                            }
                          }}
                          value={field.value || "openai"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-voice-provider">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI Realtime</SelectItem>
                            <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the voice synthesis provider
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchVoiceProvider === "openai" && (
                    <FormField
                      control={form.control}
                      name="voiceStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voice Style</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "alloy"}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-voice-style">
                                <SelectValue placeholder="Select voice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {openaiVoiceOptions.map((voice) => (
                                <SelectItem key={voice.value} value={voice.value}>
                                  {voice.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the OpenAI voice style
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchVoiceProvider === "elevenlabs" && (
                    <FormField
                      control={form.control}
                      name="elevenLabsVoiceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ElevenLabs Voice</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || elevenLabsVoiceOptions[0]?.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-elevenlabs-voice">
                                <SelectValue placeholder="Select voice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {elevenLabsVoiceOptions.map((voice) => (
                                <SelectItem key={voice.value} value={voice.value}>
                                  {voice.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose an ElevenLabs voice
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="autoStart"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-Start Voice</FormLabel>
                          <FormDescription>
                            When enabled, the voice bot will start speaking automatically when a user opens the widget. When disabled, users must click the microphone to begin.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                            data-testid="switch-auto-start"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Browser Context Awareness
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enable your AI to see and understand what users are looking at on your website. This gives the agent contextual awareness to provide better guidance.
                    </p>

                    <FormField
                      control={form.control}
                      name="targetUrl"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Target Website URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourwebsite.com"
                              {...field}
                              value={field.value || ""}
                              data-testid="input-target-url"
                            />
                          </FormControl>
                          <FormDescription>
                            The website URL where the widget is deployed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="capturePageText"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="flex items-start gap-3">
                              <Eye className="w-5 h-5 mt-0.5 text-muted-foreground" />
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Capture Page Text</FormLabel>
                                <FormDescription>
                                  Let the AI read headings, paragraphs, and visible text content on the page
                                </FormDescription>
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                data-testid="switch-capture-text"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="capturePageStructure"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="flex items-start gap-3">
                              <Layout className="w-5 h-5 mt-0.5 text-muted-foreground" />
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Capture Page Structure</FormLabel>
                                <FormDescription>
                                  Let the AI understand buttons, forms, navigation, and interactive elements
                                </FormDescription>
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                data-testid="switch-capture-structure"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="captureScreenshots"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="flex items-start gap-3">
                              <Camera className="w-5 h-5 mt-0.5 text-muted-foreground" />
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Capture Screenshots</FormLabel>
                                <FormDescription>
                                  Take screenshots for visual AI understanding (uses GPT-4 Vision, may increase costs)
                                </FormDescription>
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                data-testid="switch-capture-screenshots"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateAgentMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    {updateAgentMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeSection agentId={agentId} />
        </TabsContent>

        <TabsContent value="tags">
          <EventTagsSection agentId={agentId} />
        </TabsContent>

        <TabsContent value="flows">
          <FlowsSection agentId={agentId} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsSection agentId={agentId} />
        </TabsContent>

        <TabsContent value="widget">
          <WidgetPreviewSection agentId={agentId} agentName={agent?.name} />
        </TabsContent>

        <TabsContent value="embed">
          <EmbedSection agentId={agentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
