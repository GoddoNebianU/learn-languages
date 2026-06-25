"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Trash2,
  CheckCircle2,
  Circle,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import { Input } from "@/design-system/input";
import { Field } from "@/design-system/field";
import { IconButton } from "@/design-system/icon-button";
import { Modal } from "@/design-system/modal";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  actionCreateUser,
  actionDeleteUser,
  actionSetUserEmailVerified,
  actionUpdateUser,
} from "../admin-action";
import type { AdminUserRow } from "@/modules/admin/admin-repository";

interface AdminUsersProps {
  initialUsers: AdminUserRow[];
  initialSearch: string;
}

export function AdminUsers({ initialUsers, initialSearch }: AdminUsersProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState(initialSearch);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, startCreateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isToggling, startToggleTransition] = useTransition();

  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdating, startUpdateTransition] = useTransition();

  function handleSearch(value: string) {
    setSearch(value);
    const params = new URLSearchParams(value ? { search: value } : {});
    router.replace(`/admin/users?${params.toString()}`);
  }

  function handleCreate() {
    startCreateTransition(async () => {
      const result = await actionCreateUser({ name, email, username, password });
      if (result.success && result.data) {
        setUsers((prev) => [result.data as AdminUserRow, ...prev]);
        setName("");
        setEmail("");
        setUsername("");
        setPassword("");
        setShowCreate(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(userId: string) {
    startDeleteTransition(async () => {
      const result = await actionDeleteUser(userId);
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setConfirmingId(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleToggleVerified(user: AdminUserRow) {
    startToggleTransition(async () => {
      setTogglingId(user.id);
      const result = await actionSetUserEmailVerified(user.id, !user.emailVerified);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, emailVerified: !u.emailVerified } : u))
        );
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setTogglingId(null);
    });
  }

  function openEdit(user: AdminUserRow) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditUsername(user.username);
    setEditPassword("");
  }

  function handleUpdate() {
    if (!editingUser) return;
    startUpdateTransition(async () => {
      const result = await actionUpdateUser({
        userId: editingUser.id,
        name: editName,
        email: editEmail,
        username: editUsername,
        password: editPassword || undefined,
      });
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, name: editName, email: editEmail, username: editUsername }
              : u
          )
        );
        setEditingUser(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  const isSingleUserMode = process.env.NEXT_PUBLIC_AUTH_MODE === "single";
  const isSystemAdmin = (u: { username: string }) => isSingleUserMode && u.username === "admin";

  const canCreate = name && email && username.length >= 3 && password.length >= 8 && !isCreating;
  const canUpdate = editName && editEmail && editUsername.length >= 3 && !isUpdating;

  return (
    <PageLayout>
      <PageHeader title="User Management" subtitle="Create, edit, delete users and manage email verification" />

      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button variant="light">
              <ArrowLeft size={16} />
              Back to Settings
            </Button>
          </Link>
          <Button variant="primary" onClick={() => setShowCreate(!showCreate)}>
            <UserPlus size={16} />
            Create User
          </Button>
        </div>

        {showCreate && (
          <Card variant="bordered" padding="md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">New User</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <Input variant="bordered" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Username">
                <Input variant="bordered" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="letters, numbers, underscores" />
              </Field>
              <Field label="Email">
                <Input variant="bordered" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
              </Field>
              <Field label="Password">
                <Input variant="bordered" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 characters" />
              </Field>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" onClick={handleCreate} disabled={!canCreate} loading={isCreating}>
                Create
              </Button>
              <Button variant="light" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <Field label="Search">
          <Input variant="bordered" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by username or email" />
        </Field>

        <Card variant="bordered" padding="md">
          {users.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No users found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Username</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Verified</th>
                  <th className="pb-2 pr-4 font-medium">Created</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{user.username}</td>
                    <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                    <td className="py-3 pr-4">
                      <IconButton
                        tone="muted"
                        shape="round"
                        icon={
                          user.emailVerified ? (
                            <CheckCircle2 size={18} className="text-green-500" />
                          ) : (
                            <Circle size={18} />
                          )
                        }
                        onClick={() => handleToggleVerified(user)}
                        loading={togglingId === user.id || isToggling}
                        aria-label={user.emailVerified ? "Mark as unverified" : "Mark as verified"}
                        title={user.emailVerified ? "Mark as unverified" : "Mark as verified"}
                      >
                        <span className="text-xs">{user.emailVerified ? "Yes" : "No"}</span>
                      </IconButton>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {confirmingId === user.id ? (
                        <span className="flex items-center gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            loading={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Confirm delete?"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmingId(null)}
                          >
                            Cancel
                          </Button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <IconButton
                            tone="muted"
                            shape="round"
                            icon={<Pencil size={16} />}
                            onClick={() => openEdit(user)}
                            aria-label="Edit user"
                            title="Edit user"
                          />
                          <IconButton
                            tone="danger"
                            shape="round"
                            icon={<Trash2 size={16} />}
                            onClick={() => setConfirmingId(user.id)}
                            disabled={isSystemAdmin(user)}
                            aria-label="Delete user"
                            title={isSystemAdmin(user) ? "System admin: cannot delete in single-user mode" : "Delete user"}
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <p className="text-xs text-gray-400">{users.length} user(s) shown (max 200).</p>
      </div>

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} size="md">
        <Modal.Header>
          <Modal.Title>Edit User</Modal.Title>
          <Modal.CloseButton onClick={() => setEditingUser(null)} />
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Field label="Name">
              <Input variant="bordered" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field
              label="Username"
              helperText={
                editingUser && isSystemAdmin(editingUser)
                  ? "System admin username is locked in single-user mode."
                  : undefined
              }
            >
              <Input variant="bordered" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="letters, numbers, underscores" disabled={editingUser ? isSystemAdmin(editingUser) : false} />
            </Field>
            <Field label="Email">
              <Input variant="bordered" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="user@example.com" />
            </Field>
            <Field label="New Password" helperText="Min 8 characters. Leave blank to keep unchanged.">
              <Input variant="bordered" type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep current password" />
            </Field>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setEditingUser(null)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={!canUpdate} loading={isUpdating}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
