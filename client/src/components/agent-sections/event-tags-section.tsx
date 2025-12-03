import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface EventTagsSectionProps {
  agentId: string;
}

export function EventTagsSection({ agentId }: EventTagsSectionProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: eventTags, isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents", agentId, "tags"],
    enabled: !!agentId,
  });

  const form = useForm<EventTagFormValues>({
    resolver: zodResolver(eventTagFormSchema),
    defaultValues: {
      label: "",
      selector: "",
      event_type: "view",
      page_pattern: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: EventTagFormValues) =>
      apiRequest("POST", `/api/agents/${agentId}/tags`, { ...data, agent_id: agentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId, "tags"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Event tag created",
        description: "New event tag has been added.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tagId: string) => apiRequest("DELETE", `/api/tags/${tagId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId, "tags"] });
      toast({
        title: "Event tag deleted",
        description: "Event tag has been removed.",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tag">
              <Plus className="w-4 h-4 mr-2" />
              Add Event Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Event Tag</DialogTitle>
              <DialogDescription>
                Define which page elements to track for context-aware responses
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Pricing Section" {...field} data-testid="input-tag-label" />
                      </FormControl>
                      <FormDescription>A descriptive name for this tag</FormDescription>
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
                          placeholder="#pricing, .hero-section"
                          {...field}
                          data-testid="input-tag-selector"
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>CSS selector to identify the element</FormDescription>
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
                        <Input placeholder="/pricing, /product/*" {...field} data-testid="input-page-pattern" />
                      </FormControl>
                      <FormDescription>Only track on specific pages</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-tag">
                    {createMutation.isPending ? "Creating..." : "Create Tag"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : eventTags && eventTags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTags.map((tag, index) => {
            const Icon = eventTypeIcons[tag.event_type as keyof typeof eventTypeIcons];
            return (
              <Card key={tag.id} className="hover-elevate" data-testid={`card-tag-${index}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${eventTypeColors[tag.event_type as keyof typeof eventTypeColors]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <CardTitle className="text-base">{tag.label}</CardTitle>
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
                    <code className="text-xs bg-muted px-2 py-1 rounded">{tag.selector}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{tag.event_type}</Badge>
                    {tag.page_pattern && (
                      <Badge variant="outline" className="text-xs font-mono">{tag.page_pattern}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No event tags yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create event tags to track user interactions
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-tag">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tag
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
