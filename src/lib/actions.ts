"use server";

import { UserController } from "./db";

export async function loginAction(formData: FormData) {
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();
  
  
  if (username && password) await UserController.createUser(username, password);
}
