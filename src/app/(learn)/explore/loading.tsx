import { Container } from "@/design-system/container";
import { Skeleton } from "@/design-system/skeleton";

export default function ExploreLoading() {
  return (
    <Container size="md">
      <div className="space-y-6 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </Container>
  );
}