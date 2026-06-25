import { promises as fs } from "fs";
import path from "path";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { MarkdownRenderer } from "./MarkdownRenderer";

export default async function ApiDocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "api-reference.md");
  const content = await fs.readFile(mdPath, "utf-8");

  return (
    <PageLayout>
      <PageHeader title="REST API" subtitle="Deck and card management via HTTP" />
      <div className="max-w-3xl">
        <MarkdownRenderer content={content} />
      </div>
    </PageLayout>
  );
}
