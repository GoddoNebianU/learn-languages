/**
 * Centralized activity-action identifiers used by the audit log.
 *
 * Format: `<namespace>.<verb>` so records stay greppable and filterable.
 * Keep this file free of runtime side-effects (no "use server") so it can be
 * imported from both server and client modules.
 */
export const ACTIVITY_ACTIONS = {
  AUTH: {
    LOGIN: "auth.login",
    LOGIN_FAILED: "auth.login_failed",
    SIGNUP: "auth.signup",
    LOGOUT: "auth.logout",
    DELETE_ACCOUNT: "auth.delete_account",
    PASSWORD_RESET_REQUEST: "auth.password_reset_request",
  },
  DECK: {
    CREATE: "deck.create",
    UPDATE: "deck.update",
    DELETE: "deck.delete",
    FAVORITE_TOGGLE: "deck.favorite_toggle",
    REORDER: "deck.reorder",
  },
  CARD: {
    CREATE: "card.create",
    UPDATE: "card.update",
    DELETE: "card.delete",
    REORDER: "card.reorder",
  },
  DICTIONARY: {
    LOOKUP: "dictionary.lookup",
  },
  TRANSLATOR: {
    TRANSLATE: "translator.translate",
  },
  READING: {
    READ: "reading.read",
  },
  FOLLOW: {
    CREATE: "follow.create",
    DELETE: "follow.delete",
  },
  TTS: {
    SYNTHESIZE: "tts.synthesize",
  },
  ADMIN: {
    CONFIG_UPDATE: "admin.config_update",
    USER_CREATE: "admin.user_create",
    USER_UPDATE: "admin.user_update",
    USER_DELETE: "admin.user_delete",
  },
} as const;
