export interface RepoInputCreateApiKey {
  name: string;
  keyHash: string;
  keyPrefix: string;
  userId: string;
}

export interface RepoOutputApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  userId: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
}
