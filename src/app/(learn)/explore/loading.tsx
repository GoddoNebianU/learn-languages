import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";

export default function Loading() {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-4xl p-4 py-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-full rounded-md" />
      <VStack gap={3} className="w-full">
        <Skeleton variant="rectangular" className="h-24 w-full" />
        <Skeleton variant="rectangular" className="h-24 w-full" />
        <Skeleton variant="rectangular" className="h-24 w-full" />
        <Skeleton variant="rectangular" className="h-24 w-full" />
      </VStack>
    </VStack>
  );
}
