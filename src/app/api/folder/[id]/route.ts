import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { WordPairController } from "@/lib/db";

export async function GET({ params }: { params: { slug: number } }) {
  const session = await getServerSession(authOptions);
  if (session) {
    const id = params.slug;
    return new NextResponse(
      JSON.stringify(
        await WordPairController.getWordPairsByFolderId(id),
      ),
    );
  } else {
    return new NextResponse("Unauthorized");
  }
}
