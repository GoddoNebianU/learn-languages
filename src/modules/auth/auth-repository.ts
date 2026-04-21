import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import {
    RepoInputFindUserByEmail,
    RepoInputFindUserById,
    RepoInputFindUserByUsername,
    RepoInputDeleteUserCascade,
    RepoOutputUserProfile,
    RepoOutputDeleteUserCascade
} from "./auth-repository-dto";

const log = createLogger("auth-repository");

const USER_PUBLIC_SELECT = {
    id: true,
    email: true,
    emailVerified: true,
    username: true,
    displayUsername: true,
    image: true,
    bio: true,
    createdAt: true,
    updatedAt: true,
} as const;

export async function repoFindUserByUsername(dto: RepoInputFindUserByUsername): Promise<RepoOutputUserProfile> {
    const user = await prisma.user.findUnique({
        where: { username: dto.username },
        select: USER_PUBLIC_SELECT,
    });

    return user;
}

export async function repoFindUserById(dto: RepoInputFindUserById): Promise<RepoOutputUserProfile> {
    const user = await prisma.user.findUnique({
        where: { id: dto.id },
        select: USER_PUBLIC_SELECT,
    });

    return user;
}

export async function repoFindUserByEmail(dto: RepoInputFindUserByEmail): Promise<RepoOutputUserProfile> {
    const user = await prisma.user.findUnique({
        where: { email: dto.email },
        select: USER_PUBLIC_SELECT,
    });

    return user;
}

export async function repoDeleteUserCascade(dto: RepoInputDeleteUserCascade): Promise<RepoOutputDeleteUserCascade> {
    const { userId } = dto;

    log.info("Starting cascade delete for user", { userId });

    await prisma.$transaction(async (tx) => {
        await tx.card.deleteMany({
            where: { deck: { userId } }
        });

        await tx.deckFavorite.deleteMany({
            where: { userId }
        });

        await tx.deck.deleteMany({
            where: { userId }
        });

        await tx.follow.deleteMany({
            where: {
                OR: [
                    { followerId: userId },
                    { followingId: userId }
                ]
            }
        });

        await tx.session.deleteMany({
            where: { userId }
        });

        await tx.account.deleteMany({
            where: { userId }
        });

        await tx.user.delete({
            where: { id: userId }
        });
    });

    log.info("Cascade delete completed for user", { userId });

    return { success: true };
}
