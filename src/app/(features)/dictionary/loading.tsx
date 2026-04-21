import { Container } from "@/design-system/layout/container";
import { Skeleton } from "@/design-system/feedback/skeleton";

export default function DictionaryLoading() {
  return (
    <Container size="md">
      <div className="space-y-8 py-8">
        <Skeleton className="h-12 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="bg-white/20 rounded-lg p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="py-12">
          <Skeleton className="h-8 w-8 mx-auto mb-3" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </Container>
  );
}