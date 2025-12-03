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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, BookOpen, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const knowledgeFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

type KnowledgeFormValues = z.infer<typeof knowledgeFormSchema>;

interface KnowledgeSectionProps {
  agentId: string;
}

export function KnowledgeSection({ agentId }: KnowledgeSectionProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: knowledgeItems, isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents", agentId, "knowledge"],
    enabled: !!agentId,
  });

  const form = useForm<KnowledgeFormValues>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: KnowledgeFormValues) =>
      apiRequest("POST", `/api/agents/${agentId}/knowledge`, { ...data, agent_id: agentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId, "knowledge"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Knowledge added",
        description: "Q&A pair has been added to the knowledge base.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => apiRequest("DELETE", `/api/knowledge/${itemId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId, "knowledge"] });
      toast({
        title: "Knowledge deleted",
        description: "Q&A pair has been removed.",
      });
    },
  });

  const filteredItems = knowledgeItems?.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-knowledge"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-knowledge">
              <Plus className="w-4 h-4 mr-2" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Q&A Pair</DialogTitle>
              <DialogDescription>
                Teach your agent how to respond to specific questions
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
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
                          placeholder="We offer a 30-day money-back guarantee..."
                          className="min-h-32"
                          {...field}
                          data-testid="input-answer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-knowledge">
                    {createMutation.isPending ? "Adding..." : "Add Knowledge"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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
                    <span className="text-left pr-4">{item.question}</span>
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
    </div>
  );
}
