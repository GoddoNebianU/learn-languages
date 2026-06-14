"use client";

import { useEffect } from "react";
import { Button } from "@/design-system/button";
import { Container } from "@/design-system/container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="md">
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="text-gray-600">An unexpected error occurred while processing your request.</p>
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </Container>
  );
}
