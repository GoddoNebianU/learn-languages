# REST API Reference

## Authentication

All requests require an API key in the `Authorization` header:

```
Authorization: Bearer ll_your_api_key
```

Create and manage API keys at **Settings → API Keys**. Keys are shown only once at creation. Revoked or expired keys return `401`.

## Decks

### List Decks

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/decks` |

Returns all decks owned by the authenticated user.

**Response `200`**

```json
{
  "decks": [
    {
      "id": 1,
      "name": "Spanish Vocab",
      "desc": "",
      "userId": "abc123",
      "visibility": "PRIVATE",
      "cardCount": 42,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T08:00:00Z"
    }
  ]
}
```

### Create Deck

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/v1/decks` |

| Field | Type | Required | Default |
|---|---|---|---|
| `name` | string | Yes | |
| `desc` | string | No | `""` |
| `visibility` | `"PUBLIC"` \| `"PRIVATE"` | No | `"PRIVATE"` |

**Response `201`** — the created deck object.

### Get Deck

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/decks/{id}` |

Public decks are accessible by any authenticated user. Private decks require ownership.

**Response `200`** — the deck object. **`404`** if not found.

### Update Deck

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/api/v1/decks/{id}` |

Owner only. All body fields are optional — only provided fields are updated.

### Delete Deck

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/api/v1/decks/{id}` |

Owner only. Deletes the deck and all its cards. Returns `204 No Content`.

## Cards

### List Cards

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/decks/{id}/cards` |

Owners see hidden cards; others don't.

**Response `200`**

```json
{
  "cards": [
    {
      "id": 1,
      "deckId": 10,
      "word": "hello",
      "ipa": "həˈloʊ",
      "queryLang": "English",
      "cardType": "WORD",
      "hidden": false,
      "meanings": [
        {
          "partOfSpeech": "noun",
          "definition": "a greeting",
          "examples": [
            {
              "example": "Hello, world!",
              "translation": null
            }
          ]
        }
      ]
    }
  ]
}
```

### Create Card

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/v1/decks/{id}/cards` |

Owner only.

| Field | Type | Required | Default |
|---|---|---|---|
| `word` | string | Yes | |
| `ipa` | string | No | |
| `queryLang` | string | No | `"English"` |
| `cardType` | `"WORD"` \| `"PHRASE"` \| `"SENTENCE"` | No | `"WORD"` |
| `meanings` | array | No | `[]` |

Each meaning: `{ partOfSpeech?: string, definition: string, examples: [{ example: string, translation?: string | null }] }`

**Response `201`** — the created card object.

### Update Card

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/api/v1/cards/{id}` |

Owner only. All fields optional.

### Delete Card

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/api/v1/cards/{id}` |

Owner only. Returns `204 No Content`.

## Errors

| Status | Meaning |
|---|---|
| `401` | Missing or invalid API key |
| `403` | Authenticated but not the owner |
| `404` | Deck or card not found |
| `500` | Server error |

All errors return `{ "error": "message" }`.
