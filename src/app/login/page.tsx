"use client";

import LightButton from "@/components/buttons/LightButton";
import ACard from "@/components/cards/ACard";
import Input from "@/components/Input";
import NavbarCenterWrapper from "@/components/NavbarCenterWrapper";
import { useRef } from "react";

export default function Login() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <NavbarCenterWrapper>
      <ACard className="md:border-2 border-gray-200 flex items-center justify-center flex-col gap-8">
        <h1 className="text-2xl md:text-4xl font-bold">Login</h1>
        <form className="flex flex-col gap-2 md:text-xl">
          <Input ref={usernameRef} placeholder="username" type="text" />
          <Input ref={passwordRef} placeholder="password" type="password" />
          <LightButton>Submit</LightButton>
        </form>
      </ACard>
    </NavbarCenterWrapper>
  );
}
