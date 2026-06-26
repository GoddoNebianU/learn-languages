import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { openApiSpec } from "./openapi-spec";
import { SwaggerUIClient } from "./SwaggerUIClient";

export default function ApiDocsPage() {
  return (
    <PageLayout>
      <PageHeader title="REST API" subtitle="Interactive API documentation — click Authorize to try requests" />
      <div className="max-w-4xl">
        <SwaggerUIClient spec={openApiSpec as object} />
      </div>
    </PageLayout>
  );
}
