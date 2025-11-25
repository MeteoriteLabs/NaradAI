import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GitBranch, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const flowFormSchema = z.object({
  name: z.string().min(1, "Flow name is required"),
  page_url: z.string().optional(),
  agent_id: z.string().min(1, "Please select an agent"),
});

const stepFormSchema = z.object({
  selector: z.string().min(1, "CSS selector is required"),
  title: z.string().min(1, "Title is required"),
  tooltip_text: z.string().optional(),
  voice_script: z.string().optional(),
  order: z.coerce.number().min(1),
  flow_id: z.string().min(1),
});

type FlowFormValues = z.infer<typeof flowFormSchema>;
type StepFormValues = z.infer<typeof stepFormSchema>;

export default function FlowsPage() {
  const { toast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedFlowId, setSelectedFlowId] = useState<string>("");
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);

  const { data: agents } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  const { data: flows } = useQuery<any[]>({
    queryKey: ["/api/agents", selectedAgentId, "flows"],
    enabled: !!selectedAgentId,
  });

  const { data: steps } = useQuery<any[]>({
    queryKey: ["/api/flows", selectedFlowId, "steps"],
    enabled: !!selectedFlowId,
  });

  const flowForm = useForm<FlowFormValues>({
    resolver: zodResolver(flowFormSchema),
    defaultValues: {
      name: "",
      page_url: "",
      agent_id: selectedAgentId,
    },
  });

  const stepForm = useForm<StepFormValues>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      selector: "",
      title: "",
      tooltip_text: "",
      voice_script: "",
      order: (steps?.length || 0) + 1,
      flow_id: selectedFlowId,
    },
  });

  const createFlowMutation = useMutation({
    mutationFn: (data: FlowFormValues) =>
      apiRequest("POST", `/api/agents/${data.agent_id}/flows`, data),
    onSuccess: (newFlow) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgentId, "flows"] });
      setSelectedFlowId(newFlow.id);
      setIsFlowDialogOpen(false);
      flowForm.reset();
      toast({
        title: "Flow created",
        description: "New journey flow has been created.",
      });
    },
  });

  const createStepMutation = useMutation({
    mutationFn: (data: StepFormValues) =>
      apiRequest("POST", `/api/flows/${data.flow_id}/steps`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flows", selectedFlowId, "steps"] });
      setIsStepDialogOpen(false);
      stepForm.reset();
      toast({
        title: "Step added",
        description: "New step has been added to the flow.",
      });
    },
  });

  const deleteFlowMutation = useMutation({
    mutationFn: (flowId: string) => apiRequest("DELETE", `/api/flows/${flowId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgentId, "flows"] });
      setSelectedFlowId("");
      toast({
        title: "Flow deleted",
        description: "Journey flow has been removed.",
      });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: (stepId: string) => apiRequest("DELETE", `/api/steps/${stepId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flows", selectedFlowId, "steps"] });
      toast({
        title: "Step deleted",
        description: "Step has been removed from the flow.",
      });
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flows & Journeys</h1>
          <p className="text-muted-foreground mt-1">
            Create guided tours with step-by-step UI highlights
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
            <SelectTrigger data-testid="select-agent">
              <SelectValue placeholder="Choose an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents?.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAgentId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flows List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Flows</h2>
              <Dialog open={isFlowDialogOpen} onOpenChange={setIsFlowDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-flow">
                    <Plus className="w-4 h-4 mr-2" />
                    New Flow
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Flow</DialogTitle>
                    <DialogDescription>
                      Define a guided journey for your website visitors
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...flowForm}>
                    <form onSubmit={flowForm.handleSubmit((data) => createFlowMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={flowForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Flow Name</FormLabel>
                            <FormControl>
                              <Input placeholder="EMI Calculator Guide" {...field} data-testid="input-flow-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={flowForm.control}
                        name="page_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="/pricing" {...field} data-testid="input-flow-url" />
                            </FormControl>
                            <FormDescription>
                              Specify which page this flow applies to
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={createFlowMutation.isPending} data-testid="button-save-flow">
                        Create Flow
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {flows && flows.length > 0 ? (
                flows.map((flow, index) => (
                  <Card
                    key={flow.id}
                    className={`cursor-pointer hover-elevate ${selectedFlowId === flow.id ? "border-primary" : ""}`}
                    onClick={() => setSelectedFlowId(flow.id)}
                    data-testid={`card-flow-${index}`}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-4 h-4 text-primary" />
                          <div>
                            <CardTitle className="text-sm">{flow.name}</CardTitle>
                            {flow.page_url && (
                              <p className="text-xs text-muted-foreground font-mono">{flow.page_url}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No flows yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Steps Builder */}
          <div className="lg:col-span-2">
            {selectedFlowId ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Flow Steps</CardTitle>
                      <CardDescription>
                        Define the sequence of UI highlights and voice narration
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" data-testid="button-add-step">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Step
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add Step</DialogTitle>
                            <DialogDescription>
                              Create a new step in the guided journey
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...stepForm}>
                            <form onSubmit={stepForm.handleSubmit((data) => createStepMutation.mutate(data))} className="space-y-4">
                              <FormField
                                control={stepForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Step Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="EMI Calculator" {...field} data-testid="input-step-title" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={stepForm.control}
                                name="selector"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CSS Selector</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="#emi-calculator"
                                        {...field}
                                        className="font-mono text-sm"
                                        data-testid="input-step-selector"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Element to highlight during this step
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={stepForm.control}
                                name="tooltip_text"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tooltip Text (Optional)</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="This calculator helps you estimate monthly payments"
                                        {...field}
                                        data-testid="input-step-tooltip"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={stepForm.control}
                                name="voice_script"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Voice Script (Optional)</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Let me show you how our EMI calculator works..."
                                        {...field}
                                        data-testid="input-step-voice"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      What the AI will say during this step
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" disabled={createStepMutation.isPending} data-testid="button-save-step">
                                Add Step
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFlowMutation.mutate(selectedFlowId)}
                        data-testid="button-delete-flow"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Flow
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {steps && steps.length > 0 ? (
                    steps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-4">
                        <Badge variant="secondary" className="mt-1">{step.order}</Badge>
                        <div className="flex-1">
                          <Card>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">{step.title}</CardTitle>
                                  <code className="text-xs text-muted-foreground font-mono">
                                    {step.selector}
                                  </code>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteStepMutation.mutate(step.id)}
                                  data-testid={`button-delete-step-${index}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            {(step.tooltip_text || step.voice_script) && (
                              <CardContent className="pt-0 space-y-2">
                                {step.tooltip_text && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Tooltip</p>
                                    <p className="text-sm">{step.tooltip_text}</p>
                                  </div>
                                )}
                                {step.voice_script && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Voice</p>
                                    <p className="text-sm italic">{step.voice_script}</p>
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        </div>
                        {index < steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-6" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No steps added yet</p>
                      <Button onClick={() => setIsStepDialogOpen(true)} data-testid="button-add-first-step">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Step
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-24">
                  <GitBranch className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No flow selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a flow from the left or create a new one
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
