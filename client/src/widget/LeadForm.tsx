import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  onClose: () => void;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export function LeadForm({ onSubmit, onClose }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="fixed bottom-24 right-6 w-96 shadow-2xl z-40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Get in Touch</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-lead-form"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            placeholder="John Doe"
            data-testid="input-lead-name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            placeholder="john@example.com"
            data-testid="input-lead-email"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+1 (555) 123-4567"
            data-testid="input-lead-phone"
          />
        </div>

        <div>
          <Label htmlFor="notes">Message</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="How can we help you?"
            rows={3}
            data-testid="input-lead-notes"
          />
        </div>

        <Button type="submit" className="w-full" data-testid="button-submit-lead">
          Submit
        </Button>
      </form>
    </Card>
  );
}
