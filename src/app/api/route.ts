import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.url;
  return NextResponse.json({
    message: "Hello World",
    url: url
  }, { status: 200 });
}
