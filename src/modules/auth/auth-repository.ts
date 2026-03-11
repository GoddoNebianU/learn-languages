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

export async function repoFindUserByUsername(dto: RepoInputFindUserByUsername): Promise<RepoOutputUserProfile> {
    const user = await prisma.user.findUnique({
        where: { username: dto.username },
        select: {
            id: true,
            email: true,
            emailVerified: true,
            username: true,
            displayUsername: true,
            image: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return user;
}

export async function repoFindUserById(dto: RepoInputFindUserById): Promise<RepoOutputUserProfile> {
    const user = await prisma.user.findUnique({
        where: { id: dto.id },
        select: {
            id: true,
            email: true,
            emailVerified: true,
            username: true,
            displayUsername: true,
            image: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return user;
}

export async function repoFindUserByEmail(dto: RepoInputFindUserByEmail): Promise<RepoOutputUserProfile> {
    const user = await prisma.user.findUnique({
        where: { email: dto.email },
        select: {
            id: true,
            email: true,
            emailVerified: true,
            username: true,
            displayUsername: true,
            image: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return user;
}

export async function repoDeleteUserCascade(dto: RepoInputDeleteUserCascade): Promise<RepoOutputDeleteUserCascade> {
    const { userId } = dto;

    log.info("Starting cascade delete for user", { userId });

    await prisma.$transaction(async (tx) => {
        await tx.revlog.deleteMany({
            where: { card: { note: { userId } } }
        });

        await tx.card.deleteMany({
            where: { note: { userId } }
        });

        await tx.note.deleteMany({
            where: { userId }
        });

        await tx.noteType.deleteMany({
            where: { userId }
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

        await tx.dictionaryLookUp.deleteMany({
            where: { userId }
        });

        await tx.translationHistory.deleteMany({
            where: { userId }
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
