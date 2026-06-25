import { NextRequest, NextResponse } from "next/server";
import { getApiUserId } from "@/lib/api-auth";
import { serviceCheckOwnership } from "@/modules/deck/deck-service";
import {
  serviceGetCardById,
  serviceUpdateCard,
  serviceDeleteCard,
} from "@/modules/card/card-service";

async function getCardDeckId(cardId: number): Promise<number | null> {
  const card = await serviceGetCardById(cardId);
  return card?.deckId ?? null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });

  const deckId = await getCardDeckId(cardId);
  if (!deckId) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const isOwner = await serviceCheckOwnership({ deckId, userId });
  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const result = await serviceUpdateCard({
    cardId,
    word: body.word,
    ipa: body.ipa,
    hidden: body.hidden,
    meanings: body.meanings,
  });
  if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });

  const card = await serviceGetCardById(cardId);
  if (!card) return NextResponse.json({ error: "Failed to fetch updated card" }, { status: 500 });

  return NextResponse.json({
    card: {
      id: card.id, deckId: card.deckId, word: card.word, ipa: card.ipa,
      queryLang: card.queryLang, cardType: card.cardType, hidden: card.hidden,
      meanings: (card.meanings ?? []).map((m) => ({ partOfSpeech: m.partOfSpeech, definition: m.definition, example: m.example })),
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });

  const deckId = await getCardDeckId(cardId);
  if (!deckId) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const isOwner = await serviceCheckOwnership({ deckId, userId });
  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await serviceDeleteCard({ cardId });
  if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
