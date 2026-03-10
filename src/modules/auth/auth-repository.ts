import { prisma } from "@/lib/db";
import {
    RepoInputFindUserByEmail,
    RepoInputFindUserById,
    RepoInputFindUserByUsername,
    RepoOutputUserProfile
} from "./auth-repository-dto";

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
