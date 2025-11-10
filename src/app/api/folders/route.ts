import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { FolderController } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session) {
    return new NextResponse(
      JSON.stringify(
        await FolderController.getFoldersByOwner(session.user!.name as string),
      ),
    );
  } else {
    return new NextResponse("Unauthorized");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session) {
    const body = await req.json();

    return new NextResponse(
      JSON.stringify(
        await FolderController.createFolder(
          body.name,
          session.user!.name as string,
        ),
      ),
    );
  } else {
    return new NextResponse("Unauthorized");
  }
}
