import { auth } from "@/auth";
import { repoFindUserByUsername, repoFindUserById, repoDeleteUserCascade } from "./auth-repository";
import {
  ServiceInputGetUserProfileByUsername,
  ServiceInputGetUserProfileById,
  ServiceInputDeleteAccount,
  ServiceOutputUserProfile,
  ServiceOutputDeleteAccount,
} from "./auth-service-dto";

export async function serviceGetUserProfileByUsername(
  dto: ServiceInputGetUserProfileByUsername
): Promise<ServiceOutputUserProfile> {
  return await repoFindUserByUsername(dto);
}

export async function serviceGetUserProfileById(
  dto: ServiceInputGetUserProfileById
): Promise<ServiceOutputUserProfile> {
  return await repoFindUserById(dto);
}

export async function serviceDeleteAccount(
  dto: ServiceInputDeleteAccount
): Promise<ServiceOutputDeleteAccount> {
  return await repoDeleteUserCascade({ userId: dto.userId });
}
