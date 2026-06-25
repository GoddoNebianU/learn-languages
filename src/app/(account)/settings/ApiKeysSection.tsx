"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Copy, Check, Trash2, Plus, Key, Loader2, AlertTriangle, BookOpen } from "lucide-react";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { Field } from "@/design-system/field";
import Link from "next/link";
import { actionCreateApiKey, actionListApiKeys, actionRevokeApiKey } from "@/modules/api-key/api-key-action";

interface ApiKeyDisplay {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadKeys = useCallback(async () => {
    const result = await actionListApiKeys();
    if (result.success && result.data) {
      setKeys(result.data.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        createdAt: k.createdAt.toISOString(),
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    loadKeys().catch(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [loadKeys]);

  function handleCreate() {
    if (!newKeyName.trim()) return;
    startTransition(async () => {
      const result = await actionCreateApiKey({ name: newKeyName.trim() });
      if (result.success && result.data) {
        setCreatedKey(result.data.plaintext);
        setNewKeyName("");
        setShowCreate(false);
        await loadKeys();
      }
    });
  }

  function handleRevoke(id: string) {
    setRevokingId(id);
    startTransition(async () => {
      await actionRevokeApiKey(id);
      await loadKeys();
      setRevokingId(null);
    });
  }

  function copyKey() {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">API Keys</h2>
        </div>
        <Link href="/api-docs" className="inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 hover:underline">
          <BookOpen size={15} />
          API Docs
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Manage API keys for REST API access (<code className="rounded bg-gray-100 px-1">/api/v1/</code>).
        Keys are shown only once at creation.
      </p>

      {/* Created key display */}
      {createdKey && (
        <div className="mb-4 rounded-lg border-2 border-warning-300 bg-warning-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-warning-700">
            <AlertTriangle size={18} />
            <span className="font-medium">Save this key now — you won&apos;t see it again.</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-white px-3 py-2 text-sm">{createdKey}</code>
            <Button variant="light" onClick={copyKey} size="sm">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="light" onClick={() => setCreatedKey(null)} size="sm">Dismiss</Button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate ? (
        <div className="mb-4 flex items-end gap-2">
          <Field label="Key name" className="flex-1">
            <Input
              variant="bordered"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. My App"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </Field>
          <Button variant="primary" onClick={handleCreate} loading={isPending} size="md">Create</Button>
          <Button variant="light" onClick={() => { setShowCreate(false); setNewKeyName(""); }} size="md">Cancel</Button>
        </div>
      ) : (
        <Button
          variant="light"
          onClick={() => setShowCreate(true)}
          leftIcon={<Plus size={16} />}
          className="mb-4"
        >
          Create New Key
        </Button>
      )}

      {/* Key list */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : keys.length === 0 ? (
        <p className="text-sm text-gray-400">No API keys yet.</p>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{key.name}</span>
                  <code className="text-xs text-gray-400">{key.keyPrefix}...</code>
                </div>
                <div className="text-xs text-gray-400">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                </div>
              </div>
              <Button
                variant="light"
                onClick={() => handleRevoke(key.id)}
                loading={revokingId === key.id}
                size="sm"
                className="text-error-500 hover:bg-error-50"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
