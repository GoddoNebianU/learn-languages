declare module "swagger-ui-react" {
  import * as React from "react";
  interface SwaggerUIProps {
    spec?: object;
    url?: string;
    docExpansion?: string;
    defaultModelsExpandDepth?: number;
  }
  const SwaggerUI: React.FC<SwaggerUIProps>;
  export default SwaggerUI;
}
