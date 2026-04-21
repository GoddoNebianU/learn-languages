import { Container } from "@/design-system/layout/container";
import { Skeleton } from "@/design-system/feedback/skeleton";

export default function DecksLoading() {
  return (
    <Container size="md">
      <div className="space-y-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </Container>
  );
}