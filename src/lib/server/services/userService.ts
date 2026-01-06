import prisma from "@/lib/db";
import { randomUUID } from "crypto";

export async function createUserIfNotExists(email: string, name?: string | null) {
    const user = await prisma.user.upsert({
        where: {
            email: email,
        },
        update: {},
        create: {
            id: randomUUID(),
            email: email,
            name: name || "New User",
        },
    });
    return user;
}

export async function getUserIdByEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
        select: {
            id: true,
        },
    });
    return user ? user.id : null;
}
