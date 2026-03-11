import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import {
    RepoInputFindUserByEmail,
    RepoOutputFindUserByEmail
} from "./forgot-password-repository-dto";

const log = createLogger("forgot-password-repository");

export async function repoFindUserByEmail(dto: RepoInputFindUserByEmail): Promise<RepoOutputFindUserByEmail> {
    log.debug("Finding user by email", { email: dto.email });

    const user = await prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true },
    });

    return user;
}
