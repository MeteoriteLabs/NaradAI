import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Bot, Mic, MoreVertical, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { useState } from "react";
import { z } from "zod";

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

export default function AgentsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      persona: "",
      voiceStyle: "alloy",
    },
  });

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const createAgentMutation = useMutation({
    mutationFn: (data: AgentFormValues) =>
      apiRequest<Agent>("POST", "/api/agents", data),
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Agent created",
        description: "Your AI agent has been created successfully.",
      });
      navigate(`/agents/${newAgent.id}`);
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent deleted",
        description: "The agent has been removed.",
      });
    },
  });

  const onSubmit = (data: AgentFormValues) => {
    createAgentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your AI voice agents
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-agent">
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Set up your AI voice agent with a name and personality.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          placeholder="Describe the agent's personality..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-agent-persona"
                        />
                      </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAgentMutation.isPending}
                    data-testid="button-submit-create-agent"
                  >
                    {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {agents && agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Create your first AI voice agent to start engaging with your website visitors.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {agents?.map((agent) => (
            <Card
              key={agent.id}
              className="group cursor-pointer hover-elevate transition-all"
              onClick={() => navigate(`/agents/${agent.id}`)}
              data-testid={`card-agent-${agent.id}`}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{agent.name}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <Mic className="w-3 h-3 mr-1" />
                        {agent.voiceStyle || "alloy"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-agent-menu-${agent.id}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAgentMutation.mutate(agent.id);
                      }}
                      data-testid={`button-delete-agent-${agent.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                  {agent.persona || "No persona defined"}
                </CardDescription>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <Badge variant="default" className="text-xs">Active</Badge>
                  <span className="text-xs text-muted-foreground">
                    Click to manage
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
