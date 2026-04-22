import Image from "next/image";
import Link from "next/link";

interface UserItem {
  id: string;
  username: string | null;
  displayUsername: string | null;
  image: string | null;
  bio: string | null;
}

interface UserListProps {
  users: UserItem[];
  emptyMessage: string;
}

export function UserList({ users, emptyMessage }: UserListProps) {
  if (users.length === 0) {
    return <div className="py-12 text-center text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/users/${user.username || user.id}`}
          className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          {user.image ? (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={user.image}
                alt={user.displayUsername || user.username || "User"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-500">
              <span className="text-lg font-bold text-white">
                {(user.displayUsername || user.username || "U")[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-gray-900">
              {user.displayUsername || user.username || "Anonymous"}
            </div>
            {user.username && <div className="text-sm text-gray-500">@{user.username}</div>}
            {user.bio && <div className="mt-1 truncate text-sm text-gray-600">{user.bio}</div>}
          </div>
        </Link>
      ))}
    </div>
  );
}
