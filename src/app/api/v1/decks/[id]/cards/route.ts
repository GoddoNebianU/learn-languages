import { NextRequest, NextResponse } from "next/server";
import { getApiUserId } from "@/lib/api-auth";
import { serviceCheckOwnership } from "@/modules/deck/deck-service";
import {
  serviceGetCardsByDeckId,
  serviceCreateCard,
  serviceGetCardById,
} from "@/modules/card/card-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deckId = parseInt(id, 10);
  if (isNaN(deckId)) return NextResponse.json({ error: "Invalid deck ID" }, { status: 400 });

  const isOwner = await serviceCheckOwnership({ deckId, userId });
  const cards = await serviceGetCardsByDeckId({ deckId, includeHidden: isOwner });

  return NextResponse.json({
    cards: cards.map((c) => ({
      id: c.id,
      deckId: c.deckId,
      word: c.word,
      ipa: c.ipa,
      queryLang: c.queryLang,
      cardType: c.cardType,
      hidden: c.hidden,
      meanings: (c.meanings ?? []).map((m) => ({
        partOfSpeech: m.partOfSpeech,
        definition: m.definition,
        example: m.example,
      })),
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deckId = parseInt(id, 10);
  if (isNaN(deckId)) return NextResponse.json({ error: "Invalid deck ID" }, { status: 400 });

  const isOwner = await serviceCheckOwnership({ deckId, userId });
  if (!isOwner) return NextResponse.json({ error: "Forbidden — not deck owner" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.word) return NextResponse.json({ error: "Missing required field: word" }, { status: 400 });

  const created = await serviceCreateCard({
    deckId,
    word: body.word,
    ipa: body.ipa ?? null,
    queryLang: body.queryLang ?? "English",
    cardType: body.cardType ?? "WORD",
    meanings: body.meanings ?? [],
  });
  if (!created.success || !created.cardId) return NextResponse.json({ error: created.message }, { status: 500 });

  const card = await serviceGetCardById(created.cardId);
  if (!card) return NextResponse.json({ error: "Created but failed to fetch" }, { status: 500 });

  return NextResponse.json({
    card: {
      id: card.id, deckId: card.deckId, word: card.word, ipa: card.ipa,
      queryLang: card.queryLang, cardType: card.cardType, hidden: card.hidden,
      meanings: (card.meanings ?? []).map((m) => ({ partOfSpeech: m.partOfSpeech, definition: m.definition, example: m.example })),
    },
  }, { status: 201 });
}
