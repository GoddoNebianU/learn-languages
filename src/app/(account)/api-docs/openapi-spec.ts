export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Learn Languages REST API",
    version: "1.0.0",
    description: "Deck and card management via HTTP. Requires an API key (Settings → API Keys).",
  },
  servers: [{ url: "/api/v1", description: "API base path" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", description: "API key prefixed with `ll_`" },
    },
    schemas: {
      Deck: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Spanish Vocab" },
          desc: { type: "string", example: "" },
          userId: { type: "string", example: "abc-123" },
          visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PRIVATE" },
          cardCount: { type: "integer", example: 42 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "desc", "userId", "visibility", "createdAt", "updatedAt"],
      },
      Meaning: {
        type: "object",
        properties: {
          partOfSpeech: { type: "string", nullable: true, example: "noun" },
          definition: { type: "string", example: "a greeting" },
          examples: {
            type: "array",
            items: {
              type: "object",
              properties: {
                example: { type: "string", example: "Hello, world!" },
                translation: { type: "string", nullable: true, example: "你好，世界！" },
              },
              required: ["example"],
            },
          },
        },
        required: ["definition"],
      },
      Card: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          deckId: { type: "integer", example: 10 },
          word: { type: "string", example: "hello" },
          ipa: { type: "string", nullable: true, example: "həˈloʊ" },
          queryLang: { type: "string", example: "English" },
          cardType: { type: "string", enum: ["WORD", "PHRASE", "SENTENCE"], example: "WORD" },
          hidden: { type: "boolean", example: false },
          meanings: { type: "array", items: { $ref: "#/components/schemas/Meaning" } },
        },
        required: ["id", "deckId", "word", "ipa", "queryLang", "cardType", "hidden", "meanings"],
      },
      Error: {
        type: "object",
        properties: { error: { type: "string", example: "Unauthorized" } },
        required: ["error"],
      },
      CreateDeckRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "My Deck" },
          desc: { type: "string", example: "Vocabulary" },
          visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"], example: "PRIVATE" },
        },
        required: ["name"],
      },
      CreateCardRequest: {
        type: "object",
        properties: {
          word: { type: "string", example: "hello" },
          ipa: { type: "string", example: "həˈloʊ" },
          queryLang: { type: "string", example: "English" },
          cardType: { type: "string", enum: ["WORD", "PHRASE", "SENTENCE"], example: "WORD" },
          meanings: { type: "array", items: { $ref: "#/components/schemas/Meaning" } },
        },
        required: ["word"],
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Decks", description: "Deck CRUD operations" },
    { name: "Cards", description: "Card CRUD operations" },
  ],
  paths: {
    "/decks": {
      get: {
        tags: ["Decks"],
        summary: "List decks",
        description: "Returns all decks owned by the authenticated user.",
        responses: {
          "200": { description: "List of decks", content: { "application/json": { schema: { type: "object", properties: { decks: { type: "array", items: { $ref: "#/components/schemas/Deck" } } } } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Decks"],
        summary: "Create deck",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateDeckRequest" } } } },
        responses: {
          "201": { description: "Created deck", content: { "application/json": { schema: { type: "object", properties: { deck: { $ref: "#/components/schemas/Deck" } } } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/decks/{id}": {
      get: {
        tags: ["Decks"],
        summary: "Get deck",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Deck details", content: { "application/json": { schema: { type: "object", properties: { deck: { $ref: "#/components/schemas/Deck" } } } } } },
          "403": { description: "Forbidden (not owner, deck is private)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Decks"],
        summary: "Update deck",
        description: "Owner only. All fields optional.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateDeckRequest" } } } },
        responses: {
          "200": { description: "Updated deck", content: { "application/json": { schema: { type: "object", properties: { deck: { $ref: "#/components/schemas/Deck" } } } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Decks"],
        summary: "Delete deck",
        description: "Owner only. Deletes deck and all its cards.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Deleted" },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/decks/{id}/cards": {
      get: {
        tags: ["Cards"],
        summary: "List cards",
        description: "Owners see hidden cards; others don't.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "List of cards", content: { "application/json": { schema: { type: "object", properties: { cards: { type: "array", items: { $ref: "#/components/schemas/Card" } } } } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Cards"],
        summary: "Create card",
        description: "Owner only.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCardRequest" } } } },
        responses: {
          "201": { description: "Created card", content: { "application/json": { schema: { type: "object", properties: { card: { $ref: "#/components/schemas/Card" } } } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/cards/{id}": {
      put: {
        tags: ["Cards"],
        summary: "Update card",
        description: "Owner only. All fields optional.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCardRequest" } } } },
        responses: {
          "200": { description: "Updated card", content: { "application/json": { schema: { type: "object", properties: { card: { $ref: "#/components/schemas/Card" } } } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Cards"],
        summary: "Delete card",
        description: "Owner only.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Deleted" },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
