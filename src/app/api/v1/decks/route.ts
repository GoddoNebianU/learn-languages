import { NextRequest, NextResponse } from "next/server";
import { getApiUserId } from "@/lib/api-auth";
import { serviceGetDecksByUserId, serviceCreateDeck, serviceGetDeckById } from "@/modules/deck/deck-service";

type Visibility = "PUBLIC" | "PRIVATE";

export async function GET(request: NextRequest) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await serviceGetDecksByUserId({ userId });
  if (!result.success || !result.data) return NextResponse.json({ error: result.message }, { status: 500 });

  return NextResponse.json({ decks: result.data });
}

export async function POST(request: NextRequest) {
  const userId = await getApiUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });

  const created = await serviceCreateDeck({
    name: body.name,
    desc: body.desc ?? "",
    userId,
    visibility: (body.visibility as Visibility) ?? "PRIVATE",
  });
  if (!created.success || !created.deckId) return NextResponse.json({ error: created.message }, { status: 500 });

  const full = await serviceGetDeckById({ deckId: created.deckId });
  return NextResponse.json({ deck: full.data }, { status: 201 });
}
