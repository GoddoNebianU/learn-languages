import { repoFindUserByEmail as _repoFindUserByEmail } from "./auth-repository";
import {
  RepoInputFindUserByEmail,
  RepoOutputFindUserByEmail,
} from "./forgot-password-repository-dto";
import { createLogger } from "@/lib/logger";

const log = createLogger("forgot-password-repository");

export async function repoFindUserByEmail(
  dto: RepoInputFindUserByEmail
): Promise<RepoOutputFindUserByEmail> {
  log.debug("Finding user by email for password reset", { email: dto.email });
  const user = await _repoFindUserByEmail(dto);

  if (!user) return null;

  return { id: user.id };
}
