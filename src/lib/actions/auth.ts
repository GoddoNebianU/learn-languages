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

    // 服务器端验证
    const errors: SignUpState['errors'] = {};

    if (!email) {
        errors.email = ["邮箱是必填项"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = ["请输入有效的邮箱地址"];
    }

    if (!name) {
        errors.username = ["姓名是必填项"];
    } else if (name.length < 2) {
        errors.username = ["姓名至少需要2个字符"];
    }

    if (!password) {
        errors.password = ["密码是必填项"];
    } else if (password.length < 8) {
        errors.password = ["密码至少需要8个字符"];
    }

    // 如果有验证错误，返回错误状态
    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: "请修正表单中的错误",
            errors
        };
    }

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

    // 服务器端验证
    const errors: SignUpState['errors'] = {};

    if (!email) {
        errors.email = ["邮箱是必填项"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = ["请输入有效的邮箱地址"];
    }

    if (!password) {
        errors.password = ["密码是必填项"];
    }

    // 如果有验证错误，返回错误状态
    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: "请修正表单中的错误",
            errors
        };
    }

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
