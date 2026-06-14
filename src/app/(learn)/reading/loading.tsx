import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";

export default function Loading() {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-3xl p-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </VStack>
  );
}
