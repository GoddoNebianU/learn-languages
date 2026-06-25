import { NextRequest, NextResponse } from "next/server";
import { getApiUserId } from "@/lib/api-auth";
import {
  serviceGetDeckById,
  serviceUpdateDeck,
  serviceDeleteDeck,
  serviceCheckOwnership,
} from "@/modules/deck/deck-service";

type Visibility = "PUBLIC" | "PRIVATE";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deckId = parseInt(id, 10);
  if (isNaN(deckId)) return NextResponse.json({ error: "Invalid deck ID" }, { status: 400 });

  const result = await serviceGetDeckById({ deckId });
  if (!result.success || !result.data) return NextResponse.json({ error: "Deck not found" }, { status: 404 });

  const isOwner = await serviceCheckOwnership({ deckId, userId });
  if (!isOwner && result.data.visibility !== "PUBLIC") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ deck: result.data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deckId = parseInt(id, 10);
  if (isNaN(deckId)) return NextResponse.json({ error: "Invalid deck ID" }, { status: 400 });

  const isOwner = await serviceCheckOwnership({ deckId, userId });
  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const result = await serviceUpdateDeck({
    deckId,
    name: body.name,
    desc: body.desc,
    visibility: body.visibility as Visibility | undefined,
  });
  if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });

  const full = await serviceGetDeckById({ deckId });
  return NextResponse.json({ deck: full.data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deckId = parseInt(id, 10);
  if (isNaN(deckId)) return NextResponse.json({ error: "Invalid deck ID" }, { status: 400 });

  const isOwner = await serviceCheckOwnership({ deckId, userId });
  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await serviceDeleteDeck({ deckId });
  if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
