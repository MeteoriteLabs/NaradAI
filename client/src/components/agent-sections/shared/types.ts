import { LucideIcon } from "lucide-react";

export interface ResourceItem {
  id: string;
  [key: string]: unknown;
}

export interface ResourceListConfig<T extends ResourceItem> {
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  addButtonText: string;
  renderItem: (item: T, index: number, onDelete: (id: string) => void) => React.ReactNode;
}

export interface DialogFormConfig {
  title: string;
  description: string;
  submitText: string;
  submitLoadingText: string;
}
