import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Tag, Eye, MousePointer, Scroll, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const eventTagFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  selector: z.string().min(1, "CSS selector is required"),
  event_type: z.enum(["view", "click", "scroll", "custom"]),
  page_pattern: z.string().optional(),
  agent_id: z.string().min(1, "Please select an agent"),
});

type EventTagFormValues = z.infer<typeof eventTagFormSchema>;

const eventTypeIcons = {
  view: Eye,
  click: MousePointer,
  scroll: Scroll,
  custom: Zap,
};

const eventTypeColors = {
  view: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  click: "bg-green-500/10 text-green-700 dark:text-green-400",
  scroll: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  custom: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export default function EventTagsPage() {
  const { toast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: agents } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  const { data: eventTags, isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents", selectedAgentId, "tags"],
    enabled: !!selectedAgentId,
  });

  const form = useForm<EventTagFormValues>({
    resolver: zodResolver(eventTagFormSchema),
    defaultValues: {
      label: "",
      selector: "",
      event_type: "view",
      page_pattern: "",
      agent_id: selectedAgentId,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: EventTagFormValues) =>
      apiRequest("POST", `/api/agents/${data.agent_id}/tags`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgentId, "tags"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Event tag created",
        description: "New event tag has been added successfully.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tagId: string) => apiRequest("DELETE", `/api/tags/${tagId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgentId, "tags"] });
      toast({
        title: "Event tag deleted",
        description: "Event tag has been removed.",
      });
    },
  });

  const onSubmit = (data: EventTagFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Tags</h1>
          <p className="text-muted-foreground mt-1">
            Track user interactions on embedded websites
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedAgentId} data-testid="button-add-tag">
              <Plus className="w-4 h-4 mr-2" />
              Add Event Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Event Tag</DialogTitle>
              <DialogDescription>
                Define which page elements to track for context-aware responses
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Pricing Section" {...field} data-testid="input-tag-label" />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this tag
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CSS Selector</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="#pricing, .hero-section, [data-id='cta']"
                          {...field}
                          data-testid="input-tag-selector"
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>
                        CSS selector to identify the element on the page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="view">View (Element becomes visible)</SelectItem>
                          <SelectItem value="click">Click (User clicks element)</SelectItem>
                          <SelectItem value="scroll">Scroll (User scrolls to element)</SelectItem>
                          <SelectItem value="custom">Custom (Manual trigger)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How this event should be tracked
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="page_pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Pattern (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="/pricing, /product/*"
                          {...field}
                          data-testid="input-page-pattern"
                        />
                      </FormControl>
                      <FormDescription>
                        Only track this event on specific pages (leave empty for all pages)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-tag">
                  {createMutation.isPending ? "Creating..." : "Create Event Tag"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTags && eventTags.length > 0 ? (
            eventTags.map((tag, index) => {
              const Icon = eventTypeIcons[tag.event_type as keyof typeof eventTypeIcons];
              return (
                <Card key={tag.id} className="hover-elevate" data-testid={`card-tag-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${eventTypeColors[tag.event_type as keyof typeof eventTypeColors]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{tag.label}</CardTitle>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(tag.id)}
                        data-testid={`button-delete-tag-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Selector</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {tag.selector}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {tag.event_type}
                      </Badge>
                      {tag.page_pattern && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {tag.page_pattern}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No event tags yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create event tags to track user interactions and provide context to your AI agent
                </p>
                <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-tag">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Tag
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
