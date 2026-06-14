import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";

export default function Loading() {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-2xl p-4 py-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton variant="rectangular" className="h-40 w-full" />
    </VStack>
  );
}
