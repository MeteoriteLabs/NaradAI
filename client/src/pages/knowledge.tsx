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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, BookOpen, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const knowledgeFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  agent_id: z.string().min(1, "Please select an agent"),
});

type KnowledgeFormValues = z.infer<typeof knowledgeFormSchema>;

export default function KnowledgePage() {
  const { toast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all agents
  const { data: agents } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  // Fetch knowledge items for selected agent
  const { data: knowledgeItems, isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents", selectedAgentId, "knowledge"],
    enabled: !!selectedAgentId,
  });

  const form = useForm<KnowledgeFormValues>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      agent_id: selectedAgentId,
    },
  });

  // Set agent_id when selected agent changes
  useEffect(() => {
    if (selectedAgentId) {
      form.setValue("agent_id", selectedAgentId);
    }
  }, [selectedAgentId, form]);

  // Create knowledge item mutation
  const createMutation = useMutation({
    mutationFn: (data: KnowledgeFormValues) =>
      apiRequest("POST", `/api/agents/${data.agent_id}/knowledge`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgentId, "knowledge"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Knowledge added",
        description: "Q&A pair has been added to the knowledge base.",
      });
    },
  });

  // Delete knowledge item mutation
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => apiRequest("DELETE", `/api/knowledge/${itemId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgentId, "knowledge"] });
      toast({
        title: "Knowledge deleted",
        description: "Q&A pair has been removed from the knowledge base.",
      });
    },
  });

  const onSubmit = (data: KnowledgeFormValues) => {
    createMutation.mutate(data);
  };

  const filteredItems = knowledgeItems?.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Build your agent's intelligence with Q&A pairs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedAgentId} data-testid="button-add-knowledge">
              <Plus className="w-4 h-4 mr-2" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Q&A Pair</DialogTitle>
              <DialogDescription>
                Teach your agent how to respond to specific questions
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What is your return policy?"
                          {...field}
                          data-testid="input-question"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="We offer a 30-day money-back guarantee on all purchases..."
                          className="min-h-32"
                          {...field}
                          data-testid="input-answer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-knowledge">
                  {createMutation.isPending ? "Adding..." : "Add to Knowledge Base"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agent Selector */}
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
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-knowledge"
            />
          </div>

          {/* Knowledge Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Knowledge Items</CardTitle>
                  <CardDescription>
                    {filteredItems?.length || 0} Q&A pairs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : filteredItems && filteredItems.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredItems.map((item, index) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger data-testid={`accordion-knowledge-${index}`}>
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="text-left">{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4 space-y-4">
                          <p className="text-sm text-muted-foreground">{item.answer}</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(item.id)}
                            data-testid={`button-delete-knowledge-${index}`}
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No knowledge items yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add Q&A pairs to teach your agent how to respond
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-knowledge">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Q&A
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
