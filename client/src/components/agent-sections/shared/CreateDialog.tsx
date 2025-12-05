import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateDialogProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  triggerText: string;
  submitText: string;
  submitLoadingText: string;
  isSubmitting: boolean;
  schema: z.ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void;
  onSuccess?: () => void;
  children: (form: UseFormReturn<T>) => React.ReactNode;
}

export function CreateDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  triggerText,
  submitText,
  submitLoadingText,
  isSubmitting,
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  children,
}: CreateDialogProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (data: T) => {
    onSubmit(data);
    if (onSuccess) {
      form.reset();
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-item">
          <Plus className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {children(form)}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
                {isSubmitting ? submitLoadingText : submitText}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
