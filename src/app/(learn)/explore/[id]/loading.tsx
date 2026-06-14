import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";

export default function Loading() {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-3xl p-4 py-8">
      <Skeleton className="h-9 w-64" />
      <Skeleton variant="rectangular" className="h-32 w-full" />
      <VStack gap={3} className="w-full">
        <Skeleton variant="rectangular" className="h-20 w-full" />
        <Skeleton variant="rectangular" className="h-20 w-full" />
        <Skeleton variant="rectangular" className="h-20 w-full" />
      </VStack>
    </VStack>
  );
}
