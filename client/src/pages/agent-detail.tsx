import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Copy, Settings, BookOpen, Tag, GitBranch, BarChart3, Code } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema, type Agent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { KnowledgeSection } from "@/components/agent-sections/knowledge-section";
import { EventTagsSection } from "@/components/agent-sections/event-tags-section";
import { FlowsSection } from "@/components/agent-sections/flows-section";
import { AnalyticsSection } from "@/components/agent-sections/analytics-section";

const agentFormSchema = insertAgentSchema.extend({
  name: z.string().min(1, "Name is required"),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const voiceOptions = [
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "nova", label: "Nova" },
  { value: "shimmer", label: "Shimmer" },
];

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
      voiceStyle: "alloy",
    },
    values: agent ? {
      name: agent.name,
      persona: agent.persona || "",
      voiceStyle: agent.voiceStyle || "alloy",
    } : undefined,
  });

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
    const embedCode = `<script src="https://cdn.narada.ai/embed.js" data-agent-id="${agentId}" data-api-base="${apiBase}" async></script>`;
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
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
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
                            {voiceOptions.map((voice) => (
                              <SelectItem key={voice.value} value={voice.value}>
                                {voice.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the voice style for your agent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Widget</CardTitle>
              <CardDescription>
                Add this code to your website to display the AI assistant widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono">
                  {`<script
  src="https://cdn.narada.ai/embed.js"
  data-agent-id="${agentId}"
  data-api-base="${window.location.origin}"
  async>
</script>`}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={copyEmbedCode}
                  data-testid="button-copy-embed-code"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copy the code snippet above</li>
                  <li>Paste it before the closing <code>&lt;/body&gt;</code> tag</li>
                  <li>The widget will appear in the bottom-right corner</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
