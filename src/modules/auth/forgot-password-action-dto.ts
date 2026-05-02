import z from "zod";

export const schemaActionInputForgotPassword = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

export type ActionInputForgotPassword = z.infer<typeof schemaActionInputForgotPassword>;

export interface ActionOutputForgotPassword {
  success: boolean;
  message: string;
}
