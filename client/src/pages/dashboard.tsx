import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const agentFormSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  persona: z.string().optional(),
  elevenlabsVoiceId: z.string().default("EXAVITQu4vr4xnSDxMaL"),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const elevenlabsVoiceOptions = [
  { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah (Soft, Friendly)" },
  { value: "IKne3meq5aSn9XLyUdCD", label: "Charlie (Casual, Conversational)" },
  { value: "LcfcDJNUP1GQjkzn1xUU", label: "Emily (Calm, Pleasant)" },
  { value: "cgSgspJ2msm6clMCkdW9", label: "Jessica (Expressive, Warm)" },
  { value: "nPczCjzI2devNBz1zQrb", label: "Brian (Deep, Trustworthy)" },
  { value: "9BWtsMINqrJLrRacOk9x", label: "Aria (Expressive, Clear)" },
  { value: "CwhRBWXzGAHq8TQ4Fs17", label: "Roger (Confident, Professional)" },
  { value: "29vD33N1CtxCmqQRPOHJ", label: "Drew (Well-Rounded, Informative)" },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Fetch all agents
  const { data: agents, isLoading: isLoadingAgents } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  // Fetch selected agent
  const { data: selectedAgent, isLoading: isLoadingAgent } = useQuery<any>({
    queryKey: ["/api/agents", selectedAgentId],
    enabled: !!selectedAgentId,
  });

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: selectedAgent?.name || "",
      persona: selectedAgent?.persona || "",
      elevenlabsVoiceId: selectedAgent?.elevenlabsVoiceId || "EXAVITQu4vr4xnSDxMaL",
    },
  });

  // Reset form when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      form.reset({
        name: selectedAgent.name,
        persona: selectedAgent.persona || "",
        elevenlabsVoiceId: selectedAgent.elevenlabsVoiceId || "EXAVITQu4vr4xnSDxMaL",
      });
    }
  }, [selectedAgent, form]);

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: (data: AgentFormValues) => apiRequest("POST", "/api/agents", data),
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setSelectedAgentId(newAgent.id);
      toast({
        title: "Agent created",
        description: "Your AI agent has been created successfully.",
      });
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: (data: AgentFormValues) =>
      apiRequest("PUT", `/api/agents/${selectedAgentId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgentId] });
      toast({
        title: "Agent updated",
        description: "Your AI agent has been updated successfully.",
      });
    },
  });

  const onSubmit = (data: AgentFormValues) => {
    if (selectedAgentId) {
      updateAgentMutation.mutate(data);
    } else {
      createAgentMutation.mutate(data);
    }
  };

  const copyEmbedCode = () => {
    if (!selectedAgentId) return;
    const apiBase = window.location.origin;
    const embedCode = `<script src="https://cdn.narada.ai/embed.js" data-agent-id="${selectedAgentId}" data-api-base="${apiBase}" async></script>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
    });
  };

  if (isLoadingAgents) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your AI voice agents
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAgentId(null);
            form.reset({ name: "", persona: "", elevenlabsVoiceId: "EXAVITQu4vr4xnSDxMaL" });
          }}
          data-testid="button-create-agent"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>
      </div>

      {/* Agent selector */}
      {agents && agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAgentId || ""} onValueChange={setSelectedAgentId}>
              <SelectTrigger data-testid="select-agent">
                <SelectValue placeholder="Choose an agent to edit" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Configuration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>
                    {selectedAgentId ? "Edit Agent" : "Create New Agent"}
                  </CardTitle>
                  <CardDescription>
                    Configure your AI voice agent's personality and voice
                  </CardDescription>
                </div>
              </div>
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
                            placeholder="e.g., Auto Showroom Assistant"
                            {...field}
                            data-testid="input-agent-name"
                          />
                        </FormControl>
                        <FormDescription>
                          Give your agent a descriptive name
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
                            placeholder="You are a helpful car dealership assistant. Guide customers through our inventory, explain financing options, and help them book test drives."
                            className="min-h-32"
                            {...field}
                            data-testid="input-agent-persona"
                          />
                        </FormControl>
                        <FormDescription>
                          Define your agent's personality and role
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="elevenlabsVoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-voice-style">
                              <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {elevenlabsVoiceOptions.map((voice) => (
                              <SelectItem key={voice.value} value={voice.value}>
                                {voice.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the voice that represents your brand
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
                    data-testid="button-save-agent"
                  >
                    {selectedAgentId ? "Update Agent" : "Create Agent"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Embed Code & Preview */}
        <div className="space-y-6">
          {selectedAgentId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Embed Code</CardTitle>
                  <CardDescription>Copy and paste into your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono">
                      {`<script
  src="https://cdn.narada.ai/embed.js"
  data-agent-id="${selectedAgentId}"
  data-api-base="${window.location.origin}"
  async>
</script>`}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={copyEmbedCode}
                      data-testid="button-copy-embed"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Agent Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Voice Engine</span>
                    <Badge variant="secondary">OpenAI Realtime</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
