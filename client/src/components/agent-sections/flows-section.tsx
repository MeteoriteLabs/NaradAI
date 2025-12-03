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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GitBranch, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const flowFormSchema = z.object({
  name: z.string().min(1, "Flow name is required"),
  page_url: z.string().optional(),
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

interface FlowsSectionProps {
  agentId: string;
}

export function FlowsSection({ agentId }: FlowsSectionProps) {
  const { toast } = useToast();
  const [selectedFlowId, setSelectedFlowId] = useState<string>("");
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);

  const { data: flows } = useQuery<any[]>({
    queryKey: ["/api/agents", agentId, "flows"],
    enabled: !!agentId,
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
    },
  });

  const stepForm = useForm<StepFormValues>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      selector: "",
      title: "",
      tooltip_text: "",
      voice_script: "",
      order: 1,
      flow_id: "",
    },
  });

  useEffect(() => {
    if (selectedFlowId) {
      stepForm.setValue("flow_id", selectedFlowId);
      stepForm.setValue("order", (steps?.length || 0) + 1);
    }
  }, [selectedFlowId, steps, stepForm]);

  const createFlowMutation = useMutation({
    mutationFn: (data: FlowFormValues) =>
      apiRequest("POST", `/api/agents/${agentId}/flows`, { ...data, agent_id: agentId }),
    onSuccess: (newFlow) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId, "flows"] });
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
      stepForm.reset({
        selector: "",
        title: "",
        tooltip_text: "",
        voice_script: "",
        order: (steps?.length || 0) + 2,
        flow_id: selectedFlowId,
      });
      toast({
        title: "Step added",
        description: "New step has been added.",
      });
    },
  });

  const deleteFlowMutation = useMutation({
    mutationFn: (flowId: string) => apiRequest("DELETE", `/api/flows/${flowId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId, "flows"] });
      setSelectedFlowId("");
      toast({
        title: "Flow deleted",
        description: "Flow has been removed.",
      });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: (stepId: string) => apiRequest("DELETE", `/api/steps/${stepId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flows", selectedFlowId, "steps"] });
      toast({
        title: "Step deleted",
        description: "Step has been removed.",
      });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Flows</h3>
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
                <DialogDescription>Define a guided journey for your website visitors</DialogDescription>
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
                          <Input placeholder="Product Tour" {...field} data-testid="input-flow-name" />
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
                        <FormDescription>Specify which page this flow applies to</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsFlowDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createFlowMutation.isPending} data-testid="button-save-flow">
                      Create Flow
                    </Button>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <div>
                      <CardTitle className="text-sm">{flow.name}</CardTitle>
                      {flow.page_url && (
                        <p className="text-xs text-muted-foreground font-mono">{flow.page_url}</p>
                      )}
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

      <div className="lg:col-span-2">
        {selectedFlowId ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Flow Steps</CardTitle>
                  <CardDescription>Define the sequence of UI highlights</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-step">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Step</DialogTitle>
                        <DialogDescription>Create a new step in the journey</DialogDescription>
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
                                  <Input placeholder="Welcome" {...field} data-testid="input-step-title" />
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
                                  <Input placeholder="#welcome-button" {...field} className="font-mono text-sm" data-testid="input-step-selector" />
                                </FormControl>
                                <FormDescription>Element to highlight</FormDescription>
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
                                  <Textarea placeholder="Click here to get started..." {...field} data-testid="input-step-tooltip" />
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
                                  <Textarea placeholder="Let me show you how to..." {...field} data-testid="input-step-voice" />
                                </FormControl>
                                <FormDescription>What the AI will say</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsStepDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createStepMutation.isPending} data-testid="button-save-step">
                              Add Step
                            </Button>
                          </div>
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
                    Delete
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
                              <code className="text-xs text-muted-foreground font-mono">{step.selector}</code>
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
                      <ArrowRight className="w-4 h-4 text-muted-foreground mt-6 hidden sm:block" />
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
  );
}
