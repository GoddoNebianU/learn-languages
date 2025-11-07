import { UserController } from "@/lib/db";
import { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const { slug } = params;
  if (slug.length !== 1) {
    return new Response("Invalid slug", { status: 400 });
  }
  
  if (req.method === "GET") {
    return UserController.getUsers();
  } else if (req.method === "POST") {
    return UserController.createUser(await req.json());
  } else {
    return new Response("Method not allowed", { status: 405 });
  }
}

export { handler as GET, handler as POST };
