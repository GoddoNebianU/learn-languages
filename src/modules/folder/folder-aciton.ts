"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { ValidateError } from "@/lib/errors";
import { ActionInputCreatePair, ActionInputUpdatePairById, ActionOutputGetFoldersWithTotalPairsByUserId, validateActionInputCreatePair, validateActionInputUpdatePairById } from "./folder-action-dto";
import { repoCreateFolder, repoCreatePair, repoDeleteFolderById, repoDeletePairById, repoGetFolderIdByPairId, repoGetFoldersByUserId, repoGetFoldersWithTotalPairsByUserId, repoGetPairsByFolderId, repoGetUserIdByFolderId, repoRenameFolderById, repoUpdatePairById } from "./folder-repository";
import { validate } from "@/utils/validate";
import z from "zod";
import { LENGTH_MAX_FOLDER_NAME, LENGTH_MIN_FOLDER_NAME } from "@/shared/constant";

/**
 * Helper function to check if the current user is the owner of a folder
 */
async function checkFolderOwnership(folderId: number): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;

  const folderOwnerId = await repoGetUserIdByFolderId(folderId);
  return folderOwnerId === session.user.id;
}

/**
 * Helper function to check if the current user is the owner of a pair's folder
 */
async function checkPairOwnership(pairId: number): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;

  const folderId = await repoGetFolderIdByPairId(pairId);
  if (!folderId) return false;

  const folderOwnerId = await repoGetUserIdByFolderId(folderId);
  return folderOwnerId === session.user.id;
}

export async function actionGetPairsByFolderId(folderId: number) {
    try {
        return {
            success: true,
            message: 'success',
            data: await repoGetPairsByFolderId(folderId)
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionUpdatePairById(id: number, dto: ActionInputUpdatePairById) {
    try {
        // Check ownership
        const isOwner = await checkPairOwnership(id);
        if (!isOwner) {
            return {
                success: false,
                message: 'You do not have permission to update this item.',
            };
        }

        const validatedDto = validateActionInputUpdatePairById(dto);
        await repoUpdatePairById(id, validatedDto);
        return {
            success: true,
            message: 'success',
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionGetUserIdByFolderId(folderId: number) {
    try {
        return {
            success: true,
            message: 'success',
            data: await repoGetUserIdByFolderId(folderId)
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionDeleteFolderById(folderId: number) {
    try {
        // Check ownership
        const isOwner = await checkFolderOwnership(folderId);
        if (!isOwner) {
            return {
                success: false,
                message: 'You do not have permission to delete this folder.',
            };
        }

        await repoDeleteFolderById(folderId);
        return {
            success: true,
            message: 'success',
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionDeletePairById(id: number) {
    try {
        // Check ownership
        const isOwner = await checkPairOwnership(id);
        if (!isOwner) {
            return {
                success: false,
                message: 'You do not have permission to delete this item.',
            };
        }

        await repoDeletePairById(id);
        return {
            success: true,
            message: 'success'
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionGetFoldersWithTotalPairsByUserId(id: string): Promise<ActionOutputGetFoldersWithTotalPairsByUserId> {
    try {
        return {
            success: true,
            message: 'success',
            data: await repoGetFoldersWithTotalPairsByUserId(id)
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionGetFoldersByUserId(userId: string) {
    try {
        return {
            success: true,
            message: 'success',
            data: await repoGetFoldersByUserId(userId)
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionCreatePair(dto: ActionInputCreatePair) {
    try {
        // Check ownership
        const isOwner = await checkFolderOwnership(dto.folderId);
        if (!isOwner) {
            return {
                success: false,
                message: 'You do not have permission to add items to this folder.',
            };
        }

        const validatedDto = validateActionInputCreatePair(dto);
        await repoCreatePair(validatedDto);
        return {
            success: true,
            message: 'success'
        };
    } catch (e) {
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message
            };
        }
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionCreateFolder(userId: string, folderName: string) {
    try {
        const validatedFolderName = validate(folderName,
            z.string()
                .trim()
                .min(LENGTH_MIN_FOLDER_NAME)
                .max(LENGTH_MAX_FOLDER_NAME));
        await repoCreateFolder({
            name: validatedFolderName,
            userId: userId
        });
        return {
            success: true,
            message: 'success'
        };
    } catch (e) {
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message
            };
        }
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionRenameFolderById(id: number, newName: string) {
    try {
        // Check ownership
        const isOwner = await checkFolderOwnership(id);
        if (!isOwner) {
            return {
                success: false,
                message: 'You do not have permission to rename this folder.',
            };
        }

        const validatedNewName = validate(
            newName,
            z.string()
                .min(LENGTH_MIN_FOLDER_NAME)
                .max(LENGTH_MAX_FOLDER_NAME)
                .trim());
        await repoRenameFolderById(id, validatedNewName);
        return {
            success: true,
            message: 'success'
        };
    } catch (e) {
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message
            };
        }
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}
