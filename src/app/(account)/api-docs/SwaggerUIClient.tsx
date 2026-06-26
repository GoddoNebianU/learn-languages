"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <p className="text-gray-500">Loading API docs...</p>,
});

export function SwaggerUIClient({ spec }: { spec: object }) {
  return <SwaggerUI spec={spec} />;
}
