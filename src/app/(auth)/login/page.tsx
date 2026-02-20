"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect");

    const session = authClient.useSession().data;
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push(redirectTo ?? "/profile");
        }
    });

    function login() {
        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
        console.log(username, password);
        if (username.includes("@")) {
            authClient.signIn.email({
                email: username,
                password: username
            });
        } else {
            authClient.signIn.username({
                username: username,
                password: password,
                fetchOptions: {
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                    }
                }
            });
        }
    }

    return (
        <div className="flex justify-center items-center h-screen w-screen">
            <div className="rounded shadow-lg w-96 flex flex-col py-4">
                <h1 className="text-6xl m-16 text-center">登录</h1>
                <input type="text"
                    id="username"
                    placeholder="用户名或邮箱地址"
                    className="mx-auto mb-8 pb-2 w-60 border-b-2 outline-none" />
                <input type="password"
                    id="password"
                    placeholder="密码"
                    className="mx-auto mb-8 pb-2 w-60 border-b-2 outline-none" />
                <button
                    onClick={login}
                    className="text-xl rounded shadow w-16 mx-auto p-2 my-4">
                    确认</button>
                <Link href={"/signup" + (redirectTo ? `?redirect=${redirectTo}` : "")}
                    className="text-center text-blue-800"
                >没有账号？去注册</Link>
            </div>
        </div>
    );
}
