"use client";

import LightButton from "@/components/buttons/LightButton";
import { signUpAction } from "@/lib/actions/auth";
import Link from "next/link";

export default function SignInPage() {
    return (
        <div>
            <h1>Sign Up</h1>
            <form action={signUpAction}>
                <input type="text"
                    name="name"
                    placeholder="Name"
                    required
                />
                <input type="email"
                    name="email"
                    placeholder="Email"
                    required
                />
                <input type="password"
                    name="password"
                    placeholder="Password"
                    required
                />
                <LightButton type="submit">Sign Up</LightButton>
            </form>

            <Link href={"/signin"}>Already have an account? Sign in!</Link>
        </div>
    );
}