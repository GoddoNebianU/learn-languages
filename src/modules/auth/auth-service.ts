import { auth } from "@/auth";
import { repoFindUserByUsername, repoFindUserById, repoDeleteUserCascade } from "./auth-repository";
import {
  ServiceInputGetUserProfileByUsername,
  ServiceInputGetUserProfileById,
  ServiceInputDeleteAccount,
  ServiceOutputUserProfile,
  ServiceOutputDeleteAccount,
} from "./auth-service-dto";
import { createLogger } from "@/lib/logger";

const log = createLogger("auth-service");

export async function serviceGetUserProfileByUsername(
  dto: ServiceInputGetUserProfileByUsername
): Promise<ServiceOutputUserProfile> {
  log.debug("Getting user profile by username", { username: dto.username });
  return await repoFindUserByUsername(dto);
}

export async function serviceGetUserProfileById(
  dto: ServiceInputGetUserProfileById
): Promise<ServiceOutputUserProfile> {
  log.debug("Getting user profile by id", { userId: dto.userId });
  return await repoFindUserById(dto);
}

export async function serviceDeleteAccount(
  dto: ServiceInputDeleteAccount
): Promise<ServiceOutputDeleteAccount> {
  log.info("Deleting account", { userId: dto.userId });
  return await repoDeleteUserCascade({ userId: dto.userId });
}
