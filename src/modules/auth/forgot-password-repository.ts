import { repoFindUserByEmail as _repoFindUserByEmail } from "./auth-repository";
import {
    RepoInputFindUserByEmail,
    RepoOutputFindUserByEmail
} from "./forgot-password-repository-dto";

export async function repoFindUserByEmail(dto: RepoInputFindUserByEmail): Promise<RepoOutputFindUserByEmail> {
    const user = await _repoFindUserByEmail(dto);

    if (!user) return null;

    return { id: user.id };
}
