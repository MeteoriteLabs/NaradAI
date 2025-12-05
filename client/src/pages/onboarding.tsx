import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sparkles, ArrowRight, Building2, User, Target } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

const onboardingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  role: z.string().min(1, "Please select your role"),
  useCase: z.string().min(1, "Please tell us about your use case"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const roleOptions = [
  { value: "founder", label: "Founder / CEO" },
  { value: "marketing", label: "Marketing" },
  { value: "product", label: "Product Manager" },
  { value: "engineering", label: "Engineering" },
  { value: "customer_success", label: "Customer Success" },
  { value: "sales", label: "Sales" },
  { value: "other", label: "Other" },
];

const useCaseOptions = [
  { value: "customer_support", label: "Customer support automation" },
  { value: "product_tours", label: "Product tours & onboarding" },
  { value: "lead_generation", label: "Lead generation & qualification" },
  { value: "knowledge_base", label: "Knowledge base / FAQ" },
  { value: "sales_assistant", label: "Sales assistant" },
  { value: "other", label: "Something else" },
];

interface OnboardingProps {
  user: UserType;
}

export default function OnboardingPage({ user }: OnboardingProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: "",
      companyWebsite: "",
      role: "",
      useCase: "",
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: (data: OnboardingFormValues) =>
      apiRequest("POST", "/api/auth/onboarding", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Narada!",
        description: "Your account is all set up. Let's create your first AI agent.",
      });
      navigate("/agents");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingFormValues) => {
    console.log("Form submitted with data:", data);
    onboardingMutation.mutate(data);
  };

  // Debug: Log form errors
  const formErrors = form.formState.errors;
  if (Object.keys(formErrors).length > 0) {
    console.log("Form validation errors:", formErrors);
  }

  const nextStep = () => {
    if (step === 1) {
      const companyValid = form.getValues("companyName").length > 0;
      if (companyValid) {
        setStep(2);
      } else {
        form.trigger("companyName");
      }
    } else if (step === 2) {
      const roleValid = form.getValues("role").length > 0;
      if (roleValid) {
        setStep(3);
      } else {
        form.trigger("role");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome, {user.firstName || "there"}!</h1>
          <p className="text-muted-foreground mt-2">Let's personalize your experience</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-1.5 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {step === 1 && (
                <>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Tell us about your company</CardTitle>
                    <CardDescription>
                      This helps us customize the AI for your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Acme Inc."
                              {...field}
                              data-testid="input-company-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company website (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://acme.com"
                              {...field}
                              data-testid="input-company-website"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full gap-2"
                      data-testid="button-onboarding-next-1"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>What's your role?</CardTitle>
                    <CardDescription>
                      This helps us show you the most relevant features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your role *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                        data-testid="button-onboarding-back-2"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 gap-2"
                        data-testid="button-onboarding-next-2"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>What will you use Narada for?</CardTitle>
                    <CardDescription>
                      We'll set up templates to help you get started faster
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="useCase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary use case *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-use-case">
                                <SelectValue placeholder="Select your main use case" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {useCaseOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1"
                        data-testid="button-onboarding-back-3"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 gap-2"
                        disabled={onboardingMutation.isPending}
                        data-testid="button-onboarding-complete"
                      >
                        {onboardingMutation.isPending ? "Setting up..." : "Complete Setup"}
                        {!onboardingMutation.isPending && <Sparkles className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </form>
          </Form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can always change these settings later
        </p>
      </div>
    </div>
  );
}
