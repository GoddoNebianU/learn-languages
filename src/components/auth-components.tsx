import { signIn, signOut } from "next-auth/react";
import LightButton from "./buttons/LightButton";

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof LightButton>) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(provider)
      }}
    >
      <LightButton {...props}>Sign In</LightButton>
    </form>
  )
}

export function SignOut(props: React.ComponentPropsWithRef<typeof LightButton>) {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
      className="w-full"
    >
      <LightButton className="w-full p-0" {...props}>
        Sign Out
      </LightButton>
    </form>
  )
}
