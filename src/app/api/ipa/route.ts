import { getIPA } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const text = searchParams.get('text');
    if (!text) return NextResponse.json({ 'error': 400 }, { status: 400 });

    const r = await getIPA(text);
    if (r === null) return NextResponse.json({ 'error': 424 }, { status: 424 });

    return NextResponse.json({ r }, { status: 200 });
}
