import { UserController } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const users = await UserController.getUsers();
  return NextResponse.json(users, { status: 200 });
}
