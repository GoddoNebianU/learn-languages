import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { createUserIfNotExists, getUserIdByEmail } from "./lib/actions/services/userService";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;
            await createUserIfNotExists(user.email, user.name);
            return true
        },
        async session({ session }) {
            if (session.user?.email) {
                const userId = await getUserIdByEmail(session.user.email);

                if (userId) {
                    session.user.id = userId.toString();
                }
            }
            return session;
        },
    },
});
