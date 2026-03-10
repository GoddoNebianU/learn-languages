"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import {
  ActionInputCreateNoteType,
  ActionInputUpdateNoteType,
  ActionInputDeleteNoteType,
  ActionOutputCreateNoteType,
  ActionOutputUpdateNoteType,
  ActionOutputGetNoteTypeById,
  ActionOutputGetNoteTypesByUserId,
  ActionOutputDeleteNoteType,
  validateActionInputCreateNoteType,
  validateActionInputUpdateNoteType,
  validateActionInputDeleteNoteType,
} from "./note-type-action-dto";
import {
  serviceCreateNoteType,
  serviceUpdateNoteType,
  serviceGetNoteTypeById,
  serviceGetNoteTypesByUserId,
  serviceDeleteNoteType,
} from "./note-type-service";
import {
  DEFAULT_BASIC_NOTE_TYPE_FIELDS,
  DEFAULT_BASIC_NOTE_TYPE_TEMPLATES,
  DEFAULT_BASIC_NOTE_TYPE_CSS,
  DEFAULT_CLOZE_NOTE_TYPE_FIELDS,
  DEFAULT_CLOZE_NOTE_TYPE_TEMPLATES,
  DEFAULT_CLOZE_NOTE_TYPE_CSS,
} from "./note-type-repository-dto";

const log = createLogger("note-type-action");

export async function actionCreateNoteType(
  input: ActionInputCreateNoteType,
): Promise<ActionOutputCreateNoteType> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const validated = validateActionInputCreateNoteType(input);

    const id = await serviceCreateNoteType({
      name: validated.name,
      kind: validated.kind,
      css: validated.css,
      fields: validated.fields,
      templates: validated.templates,
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Note type created successfully",
      data: { id },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return {
        success: false,
        message: e.message,
      };
    }
    log.error("Create note type failed", { error: e });
    return {
      success: false,
      message: "Failed to create note type",
    };
  }
}

export async function actionUpdateNoteType(
  input: ActionInputUpdateNoteType,
): Promise<ActionOutputUpdateNoteType> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const validated = validateActionInputUpdateNoteType(input);

    await serviceUpdateNoteType({
      id: validated.id,
      name: validated.name,
      kind: validated.kind,
      css: validated.css,
      fields: validated.fields,
      templates: validated.templates,
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Note type updated successfully",
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return {
        success: false,
        message: e.message,
      };
    }
    log.error("Update note type failed", { error: e });
    return {
      success: false,
      message: "Failed to update note type",
    };
  }
}

export async function actionGetNoteTypeById(
  id: number,
): Promise<ActionOutputGetNoteTypeById> {
  try {
    const noteType = await serviceGetNoteTypeById({ id });

    if (!noteType) {
      return {
        success: false,
        message: "Note type not found",
      };
    }

    return {
      success: true,
      message: "Note type retrieved successfully",
      data: noteType,
    };
  } catch (e) {
    log.error("Get note type failed", { error: e });
    return {
      success: false,
      message: "Failed to retrieve note type",
    };
  }
}

export async function actionGetNoteTypesByUserId(): Promise<ActionOutputGetNoteTypesByUserId> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const noteTypes = await serviceGetNoteTypesByUserId({
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Note types retrieved successfully",
      data: noteTypes,
    };
  } catch (e) {
    log.error("Get note types failed", { error: e });
    return {
      success: false,
      message: "Failed to retrieve note types",
    };
  }
}

export async function actionDeleteNoteType(
  input: ActionInputDeleteNoteType,
): Promise<ActionOutputDeleteNoteType> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const validated = validateActionInputDeleteNoteType(input);

    await serviceDeleteNoteType({
      id: validated.id,
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Note type deleted successfully",
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return {
        success: false,
        message: e.message,
      };
    }
    log.error("Delete note type failed", { error: e });
    return {
      success: false,
      message: "Failed to delete note type",
    };
  }
}

export async function actionCreateDefaultBasicNoteType(): Promise<ActionOutputCreateNoteType> {
  return actionCreateNoteType({
    name: "Basic Vocabulary",
    kind: "STANDARD",
    css: DEFAULT_BASIC_NOTE_TYPE_CSS,
    fields: DEFAULT_BASIC_NOTE_TYPE_FIELDS,
    templates: DEFAULT_BASIC_NOTE_TYPE_TEMPLATES,
  });
}

export async function actionCreateDefaultClozeNoteType(): Promise<ActionOutputCreateNoteType> {
  return actionCreateNoteType({
    name: "Cloze",
    kind: "CLOZE",
    css: DEFAULT_CLOZE_NOTE_TYPE_CSS,
    fields: DEFAULT_CLOZE_NOTE_TYPE_FIELDS,
    templates: DEFAULT_CLOZE_NOTE_TYPE_TEMPLATES,
  });
}

export async function actionGetDefaultBasicNoteTypeTemplate() {
  return {
    name: "Basic Vocabulary",
    kind: "STANDARD" as const,
    css: DEFAULT_BASIC_NOTE_TYPE_CSS,
    fields: DEFAULT_BASIC_NOTE_TYPE_FIELDS,
    templates: DEFAULT_BASIC_NOTE_TYPE_TEMPLATES,
  };
}

export async function actionGetDefaultClozeNoteTypeTemplate() {
  return {
    name: "Cloze",
    kind: "CLOZE" as const,
    css: DEFAULT_CLOZE_NOTE_TYPE_CSS,
    fields: DEFAULT_CLOZE_NOTE_TYPE_FIELDS,
    templates: DEFAULT_CLOZE_NOTE_TYPE_TEMPLATES,
  };
}
