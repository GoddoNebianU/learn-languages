import prisma from "@/lib/db";
import { UserCreateInput } from "../../../../generated/prisma/models";

export async function createUserIfNotExists(email: string, name?: string | null) {
    const user = await prisma.user.upsert({
        where: {
            email: email,
        },
        update: {},
        create: {
            email: email,
            name: name || "New User",
        } as UserCreateInput,
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
