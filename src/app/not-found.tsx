import { Button } from "@/design-system/button";
import { Container } from "@/design-system/container";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container size="md">
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
        <p className="text-gray-600">The page you are looking for does not exist.</p>
        <Button variant="primary">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </Container>
  );
}