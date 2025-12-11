"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
}

export interface SignUpState {
  success?: boolean;
  message?: string;
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
  };
}

export async function signUpAction(prevState: SignUpState, formData: FormData) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirectTo") as string;

    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name
            }
        });

        redirect(redirectTo || "/");
    } catch (error) {
        return {
            success: false,
            message: "注册失败，请稍后再试"
        };
    }
}

export async function signInAction(prevState: SignUpState, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirectTo") as string;

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            }
        });

        redirect(redirectTo || "/");
    } catch (error) {
        return {
            success: false,
            message: "登录失败，请检查您的邮箱和密码"
        };
    }
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers()
    });

    redirect("/auth");
}
