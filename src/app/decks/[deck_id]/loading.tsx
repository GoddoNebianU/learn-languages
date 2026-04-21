import { Container } from "@/design-system/layout/container";
import { Skeleton } from "@/design-system/feedback/skeleton";

export default function DeckDetailLoading() {
  return (
    <Container size="md">
      <div className="space-y-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </Container>
  );
}