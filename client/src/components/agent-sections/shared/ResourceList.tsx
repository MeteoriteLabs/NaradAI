import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ResourceListProps<T> {
  items: T[] | undefined;
  isLoading: boolean;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  addButtonText: string;
  onAddClick: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  gridCols?: 1 | 2 | 3;
  skeletonCount?: number;
}

export function ResourceList<T>({
  items,
  isLoading,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  addButtonText,
  onAddClick,
  renderItem,
  gridCols = 1,
  skeletonCount = 3,
}: ResourceListProps<T>) {
  if (isLoading) {
    return (
      <div
        className={`grid gap-4 ${
          gridCols === 3
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : gridCols === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1"
        }`}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <EmptyIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">{emptyTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4">{emptyDescription}</p>
          <Button onClick={onAddClick} data-testid="button-add-first-item">
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={`grid gap-4 ${
        gridCols === 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : gridCols === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
      }`}
    >
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}
