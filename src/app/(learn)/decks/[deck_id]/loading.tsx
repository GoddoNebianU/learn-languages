import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";

export default function Loading() {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-2xl p-4 py-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <VStack gap={3} className="w-full">
        <Skeleton variant="rectangular" className="h-20 w-full" />
        <Skeleton variant="rectangular" className="h-20 w-full" />
        <Skeleton variant="rectangular" className="h-20 w-full" />
        <Skeleton variant="rectangular" className="h-20 w-full" />
      </VStack>
    </VStack>
  );
}
