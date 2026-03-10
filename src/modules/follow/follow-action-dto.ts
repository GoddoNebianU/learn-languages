import { z } from "zod";

const schemaActionInputToggleFollow = z.object({
  targetUserId: z.string().min(1),
});

const schemaActionInputGetFollowers = z.object({
  userId: z.string().min(1),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const schemaActionInputGetFollowing = z.object({
  userId: z.string().min(1),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const schemaActionInputGetFollowStatus = z.object({
  targetUserId: z.string().min(1),
});

export type ActionInputToggleFollow = z.infer<typeof schemaActionInputToggleFollow>;
export type ActionInputGetFollowers = z.infer<typeof schemaActionInputGetFollowers>;
export type ActionInputGetFollowing = z.infer<typeof schemaActionInputGetFollowing>;
export type ActionInputGetFollowStatus = z.infer<typeof schemaActionInputGetFollowStatus>;

export {
  schemaActionInputGetFollowers,
  schemaActionInputGetFollowing,
  schemaActionInputGetFollowStatus,
  schemaActionInputToggleFollow,
};
