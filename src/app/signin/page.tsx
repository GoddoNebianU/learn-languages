import LightButton from "@/components/buttons/LightButton";
import { signInAction } from "@/lib/actions/auth";
import Link from "next/link";

export default function SignInPage() {
    return (
        <div>
            <h1>Sign In</h1>
            <form action={signInAction}>
                <input type="email" 
                name="email" 
                placeholder="Email" 
                required />
                <input type="password"
                name="password"
                placeholder="Password"
                required />
                <LightButton type="submit">Sign In</LightButton>
            </form>
            <Link href={"/signup"}>Do not have an account? Sign up!</Link>
        </div>
    );
}
