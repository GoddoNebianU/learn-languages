import { verifyAdminSession } from "@/lib/admin-auth";
import { repoListUsers } from "@/modules/admin/admin-repository";
import { AdminLogin } from "../AdminLogin";
import { AdminUsers } from "./AdminUsers";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const { search } = await searchParams;
  const users = await repoListUsers(search);

  return <AdminUsers initialUsers={users} initialSearch={search ?? ""} />;
}
