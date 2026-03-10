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
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/users/${user.username || user.id}`}
          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          {user.image ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={user.image}
                alt={user.displayUsername || user.username || "User"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">
                {(user.displayUsername || user.username || "U")[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {user.displayUsername || user.username || "Anonymous"}
            </div>
            {user.username && (
              <div className="text-sm text-gray-500">@{user.username}</div>
            )}
            {user.bio && (
              <div className="text-sm text-gray-600 truncate mt-1">
                {user.bio}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
