import z from "zod";
import { generateValidator } from "@/utils/validate";
import { LENGTH_MAX_USERNAME, LENGTH_MIN_USERNAME } from "@/shared/constant";

const schemaActionInputGetUserProfileByUsername = z.object({
  username: z.string().min(LENGTH_MIN_USERNAME).max(LENGTH_MAX_USERNAME),
});

export type ActionInputGetUserProfileByUsername = z.infer<
  typeof schemaActionInputGetUserProfileByUsername
>;

export const validateActionInputGetUserProfileByUsername = generateValidator(
  schemaActionInputGetUserProfileByUsername
);

export type ActionOutputUserProfile = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    emailVerified: boolean;
    username: string | null;
    displayUsername: string | null;
    image: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type ActionOutputDeleteAccount = {
  success: boolean;
  message: string;
};
