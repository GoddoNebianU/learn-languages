import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";

export default function Loading() {
  return (
    <VStack gap={6} className="mx-auto w-full max-w-4xl p-4 py-8">
      <Skeleton variant="rectangular" className="h-40 w-full" />
      <Skeleton variant="rectangular" className="h-48 w-full" />
      <Skeleton variant="rectangular" className="h-48 w-full" />
    </VStack>
  );
}
