import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";

export default function Loading() {
  return (
    <VStack gap={8} align="center" className="mx-auto w-full max-w-2xl p-4 py-12">
      <Skeleton className="h-8 w-48" />
      <Skeleton variant="rectangular" className="h-64 w-full max-w-md" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </VStack>
  );
}
