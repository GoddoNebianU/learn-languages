import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import {
  repoCreateNoteType,
  repoGetNoteTypeById,
  repoGetNoteTypesByUserId,
  repoUpdateNoteType,
  repoDeleteNoteType,
  repoGetNoteTypeOwnership,
  repoCheckNotesExist,
} from "./note-type-repository";
import {
  ServiceInputCreateNoteType,
  ServiceInputUpdateNoteType,
  ServiceInputGetNoteTypeById,
  ServiceInputGetNoteTypesByUserId,
  ServiceInputDeleteNoteType,
  ServiceInputValidateFields,
  ServiceInputValidateTemplates,
  ServiceOutputNoteType,
  ServiceOutputValidation,
} from "./note-type-service-dto";
import { schemaNoteTypeField, schemaNoteTypeTemplate } from "./note-type-repository-dto";

const log = createLogger("note-type-service");

export function serviceValidateFields(
  input: ServiceInputValidateFields,
): ServiceOutputValidation {
  const errors: string[] = [];

  if (!Array.isArray(input.fields) || input.fields.length === 0) {
    errors.push("Fields must be a non-empty array");
    return { success: false, errors };
  }

  const seenNames = new Set<string>();
  const seenOrds = new Set<number>();

  for (let i = 0; i < input.fields.length; i++) {
    const field = input.fields[i];

    if (!field.name || field.name.trim().length === 0) {
      errors.push(`Field ${i}: name is required`);
    } else if (field.name.length > schemaNoteTypeField.name.maxLength) {
      errors.push(`Field ${i}: name exceeds maximum length of ${schemaNoteTypeField.name.maxLength}`);
    }

    if (seenNames.has(field.name)) {
      errors.push(`Field ${i}: duplicate field name "${field.name}"`);
    }
    seenNames.add(field.name);

    if (typeof field.ord !== "number") {
      errors.push(`Field ${i}: ord must be a number`);
    } else if (seenOrds.has(field.ord)) {
      errors.push(`Field ${i}: duplicate ordinal ${field.ord}`);
    }
    seenOrds.add(field.ord);

    if (typeof field.sticky !== "boolean") {
      errors.push(`Field ${i}: sticky must be a boolean`);
    }

    if (typeof field.rtl !== "boolean") {
      errors.push(`Field ${i}: rtl must be a boolean`);
    }

    if (field.font && field.font.length > schemaNoteTypeField.font.maxLength) {
      errors.push(`Field ${i}: font exceeds maximum length`);
    }

    if (field.size !== undefined && (field.size < schemaNoteTypeField.size.min || field.size > schemaNoteTypeField.size.max)) {
      errors.push(`Field ${i}: size must be between ${schemaNoteTypeField.size.min} and ${schemaNoteTypeField.size.max}`);
    }
  }

  return { success: errors.length === 0, errors };
}

export function serviceValidateTemplates(
  input: ServiceInputValidateTemplates,
): ServiceOutputValidation {
  const errors: string[] = [];

  if (!Array.isArray(input.templates) || input.templates.length === 0) {
    errors.push("Templates must be a non-empty array");
    return { success: false, errors };
  }

  const fieldNames = new Set(input.fields.map((f) => f.name));
  const seenNames = new Set<string>();
  const seenOrds = new Set<number>();

  const mustachePattern = /\{\{([^}]+)\}\}/g;

  for (let i = 0; i < input.templates.length; i++) {
    const template = input.templates[i];

    if (!template.name || template.name.trim().length === 0) {
      errors.push(`Template ${i}: name is required`);
    } else if (template.name.length > schemaNoteTypeTemplate.name.maxLength) {
      errors.push(`Template ${i}: name exceeds maximum length`);
    }

    if (seenNames.has(template.name)) {
      errors.push(`Template ${i}: duplicate template name "${template.name}"`);
    }
    seenNames.add(template.name);

    if (typeof template.ord !== "number") {
      errors.push(`Template ${i}: ord must be a number`);
    } else if (seenOrds.has(template.ord)) {
      errors.push(`Template ${i}: duplicate ordinal ${template.ord}`);
    }
    seenOrds.add(template.ord);

    if (!template.qfmt || template.qfmt.trim().length === 0) {
      errors.push(`Template ${i}: qfmt (question format) is required`);
    } else if (template.qfmt.length > schemaNoteTypeTemplate.qfmt.maxLength) {
      errors.push(`Template ${i}: qfmt exceeds maximum length`);
    }

    if (!template.afmt || template.afmt.trim().length === 0) {
      errors.push(`Template ${i}: afmt (answer format) is required`);
    } else if (template.afmt.length > schemaNoteTypeTemplate.afmt.maxLength) {
      errors.push(`Template ${i}: afmt exceeds maximum length`);
    }

    const qfmtMatches = template.qfmt.match(mustachePattern) || [];
    const afmtMatches = template.afmt.match(mustachePattern) || [];
    const allMatches = [...qfmtMatches, ...afmtMatches];

    for (const match of allMatches) {
      const content = match.slice(2, -2).trim();
      
      if (content.startsWith("cloze:")) {
        continue;
      }
      
      if (content === "FrontSide") {
        continue;
      }
      
      if (content.startsWith("type:")) {
        continue;
      }

      if (!fieldNames.has(content)) {
        log.warn(`Template ${i}: unknown field reference "{{${content}}}"`);
      }
    }
  }

  return { success: errors.length === 0, errors };
}

export async function serviceCreateNoteType(
  input: ServiceInputCreateNoteType,
): Promise<number> {
  const fieldsValidation = serviceValidateFields({ fields: input.fields });
  if (!fieldsValidation.success) {
    throw new ValidateError(`Invalid fields: ${fieldsValidation.errors.join("; ")}`);
  }

  const templatesValidation = serviceValidateTemplates({
    templates: input.templates,
    fields: input.fields,
  });
  if (!templatesValidation.success) {
    throw new ValidateError(`Invalid templates: ${templatesValidation.errors.join("; ")}`);
  }

  log.info("Creating note type", { name: input.name, userId: input.userId });

  return repoCreateNoteType({
    name: input.name,
    kind: input.kind,
    css: input.css,
    fields: input.fields,
    templates: input.templates,
    userId: input.userId,
  });
}

export async function serviceUpdateNoteType(
  input: ServiceInputUpdateNoteType,
): Promise<void> {
  const ownership = await repoGetNoteTypeOwnership(input.id);
  if (!ownership) {
    throw new ValidateError("Note type not found");
  }

  if (ownership.userId !== input.userId) {
    throw new ValidateError("You do not have permission to update this note type");
  }

  if (input.fields) {
    const fieldsValidation = serviceValidateFields({ fields: input.fields });
    if (!fieldsValidation.success) {
      throw new ValidateError(`Invalid fields: ${fieldsValidation.errors.join("; ")}`);
    }
  }

  if (input.templates && input.fields) {
    const templatesValidation = serviceValidateTemplates({
      templates: input.templates,
      fields: input.fields,
    });
    if (!templatesValidation.success) {
      throw new ValidateError(`Invalid templates: ${templatesValidation.errors.join("; ")}`);
    }
  } else if (input.templates) {
    const existing = await repoGetNoteTypeById({ id: input.id });
    if (existing) {
      const templatesValidation = serviceValidateTemplates({
        templates: input.templates,
        fields: existing.fields,
      });
      if (!templatesValidation.success) {
        throw new ValidateError(`Invalid templates: ${templatesValidation.errors.join("; ")}`);
      }
    }
  }

  log.info("Updating note type", { id: input.id });

  await repoUpdateNoteType({
    id: input.id,
    name: input.name,
    kind: input.kind,
    css: input.css,
    fields: input.fields,
    templates: input.templates,
  });
}

export async function serviceGetNoteTypeById(
  input: ServiceInputGetNoteTypeById,
): Promise<ServiceOutputNoteType | null> {
  return repoGetNoteTypeById(input);
}

export async function serviceGetNoteTypesByUserId(
  input: ServiceInputGetNoteTypesByUserId,
): Promise<ServiceOutputNoteType[]> {
  return repoGetNoteTypesByUserId(input);
}

export async function serviceDeleteNoteType(
  input: ServiceInputDeleteNoteType,
): Promise<void> {
  const ownership = await repoGetNoteTypeOwnership(input.id);
  if (!ownership) {
    throw new ValidateError("Note type not found");
  }

  if (ownership.userId !== input.userId) {
    throw new ValidateError("You do not have permission to delete this note type");
  }

  const notesCheck = await repoCheckNotesExist({ noteTypeId: input.id });
  if (notesCheck.exists) {
    throw new ValidateError(
      `Cannot delete note type: ${notesCheck.count} notes are using this type`,
    );
  }

  log.info("Deleting note type", { id: input.id });

  await repoDeleteNoteType({ id: input.id });
}
