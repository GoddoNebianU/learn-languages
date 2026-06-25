"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/cn";

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 text-2xl font-bold text-gray-900">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-800">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 text-sm leading-relaxed text-gray-600">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-gray-600">{children}</ul>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} className="text-primary-500 underline hover:text-primary-600">{children}</a>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          {children}
        </code>
      );
    }
    return <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-primary-600">{children}</code>;
  },
  pre: ({ children }: { children?: React.ReactNode }) => <pre className="mb-4">{children}</pre>,
  table: ({ children }: { children?: React.ReactNode }) => (
    <table className="mb-4 w-full border-collapse text-sm">{children}</table>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => <thead>{children}</thead>,
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-gray-100">{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="py-2 pr-4 text-left font-semibold text-gray-700">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="py-2 pr-4 text-gray-600">{children}</td>
  ),
};

export function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn(className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
