"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { ValidateError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const log = createLogger("folder-action");
import {
  ActionInputCreatePair,
  ActionInputUpdatePairById,
  ActionOutputGetFoldersWithTotalPairsByUserId,
  ActionOutputGetPublicFolders,
  ActionOutputGetPublicFolderById,
  ActionOutputSetFolderVisibility,
  ActionOutputToggleFavorite,
  ActionOutputCheckFavorite,
  ActionOutputGetUserFavorites,
  ActionOutputUserFavorite,
  validateActionInputCreatePair,
  validateActionInputUpdatePairById,
} from "./folder-action-dto";
import {
  repoCreateFolder,
  repoCreatePair,
  repoDeleteFolderById,
  repoDeletePairById,
  repoGetFolderIdByPairId,
  repoGetFolderVisibility,
  repoGetFoldersByUserId,
  repoGetFoldersWithTotalPairsByUserId,
  repoGetPairsByFolderId,
  repoGetPublicFolders,
  repoGetPublicFolderById,
  repoGetUserIdByFolderId,
  repoRenameFolderById,
  repoSearchPublicFolders,
  repoUpdateFolderVisibility,
  repoUpdatePairById,
  repoToggleFavorite,
  repoCheckFavorite,
  repoGetUserFavorites,
} from "./folder-repository";
import { validate } from "@/utils/validate";
import z from "zod";
import { LENGTH_MAX_FOLDER_NAME, LENGTH_MIN_FOLDER_NAME } from "@/shared/constant";
import { Visibility } from "../../../generated/prisma/enums";

async function checkFolderOwnership(folderId: number): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;

  const folderOwnerId = await repoGetUserIdByFolderId(folderId);
  return folderOwnerId === session.user.id;
}

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
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionUpdatePairById(id: number, dto: ActionInputUpdatePairById) {
    try {
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
        log.error("Operation failed", { error: e });
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
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionGetFolderVisibility(folderId: number) {
    try {
        return {
            success: true,
            message: 'success',
            data: await repoGetFolderVisibility(folderId)
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionDeleteFolderById(folderId: number) {
    try {
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
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionDeletePairById(id: number) {
    try {
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
        log.error("Operation failed", { error: e });
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
        log.error("Operation failed", { error: e });
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
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionCreatePair(dto: ActionInputCreatePair) {
    try {
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
        log.error("Operation failed", { error: e });
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
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionRenameFolderById(id: number, newName: string) {
    try {
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
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
}

export async function actionSetFolderVisibility(
    folderId: number,
    visibility: "PRIVATE" | "PUBLIC",
): Promise<ActionOutputSetFolderVisibility> {
    try {
        const isOwner = await checkFolderOwnership(folderId);
        if (!isOwner) {
            return {
                success: false,
                message: 'You do not have permission to change this folder visibility.',
            };
        }

        await repoUpdateFolderVisibility({
            folderId,
            visibility: visibility as Visibility,
        });
        return {
            success: true,
            message: 'success',
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.',
        };
    }
}

export async function actionGetPublicFolders(): Promise<ActionOutputGetPublicFolders> {
    try {
        const data = await repoGetPublicFolders({});
        return {
            success: true,
            message: 'success',
            data: data.map((folder) => ({
                ...folder,
                visibility: folder.visibility as "PRIVATE" | "PUBLIC",
            })),
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.',
        };
    }
}

export async function actionSearchPublicFolders(query: string): Promise<ActionOutputGetPublicFolders> {
    try {
        const data = await repoSearchPublicFolders({ query, limit: 50 });
        return {
            success: true,
            message: 'success',
            data: data.map((folder) => ({
                ...folder,
                visibility: folder.visibility as "PRIVATE" | "PUBLIC",
            })),
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.',
        };
    }
}

export async function actionGetPublicFolderById(folderId: number): Promise<ActionOutputGetPublicFolderById> {
    try {
        const folder = await repoGetPublicFolderById(folderId);
        if (!folder) {
            return {
                success: false,
                message: 'Folder not found.',
            };
        }
        return {
            success: true,
            message: 'success',
            data: {
                ...folder,
                visibility: folder.visibility as "PRIVATE" | "PUBLIC",
            },
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.',
        };
    }
}

export async function actionToggleFavorite(
    folderId: number,
): Promise<ActionOutputToggleFavorite> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return {
                success: false,
                message: 'Unauthorized',
            };
        }

        const isFavorited = await repoToggleFavorite({
            folderId,
            userId: session.user.id,
        });

        const { favoriteCount } = await repoCheckFavorite({
            folderId,
            userId: session.user.id,
        });

        return {
            success: true,
            message: 'success',
            data: {
                isFavorited,
                favoriteCount,
            },
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.',
        };
    }
}

export async function actionCheckFavorite(
    folderId: number,
): Promise<ActionOutputCheckFavorite> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return {
                success: true,
                message: 'success',
                data: {
                    isFavorited: false,
                    favoriteCount: 0,
                },
            };
        }

        const { isFavorited, favoriteCount } = await repoCheckFavorite({
            folderId,
            userId: session.user.id,
        });

        return {
            success: true,
            message: 'success',
            data: {
                isFavorited,
                favoriteCount,
            },
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.',
        };
    }
}

export async function actionGetUserFavorites(): Promise<ActionOutputGetUserFavorites> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return {
                success: false,
                message: 'Unauthorized',
            };
        }

        const favorites = await repoGetUserFavorites({
            userId: session.user.id,
        });

        return {
            success: true,
            message: 'success',
            data: favorites.map((fav) => ({
                id: fav.id,
                folderId: fav.folderId,
                folderName: fav.folderName,
                folderCreatedAt: fav.folderCreatedAt,
                folderTotalPairs: fav.folderTotalPairs,
                folderOwnerId: fav.folderOwnerId,
                folderOwnerName: fav.folderOwnerName,
                folderOwnerUsername: fav.folderOwnerUsername,
                favoritedAt: fav.favoritedAt,
            })),
        };
    } catch (e) {
        log.error("Operation failed", { error: e });
        return {
            success: false,
            message: 'Unknown error occured.',
        };
    }
}
