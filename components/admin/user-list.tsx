"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ValidationToast } from "@/components/ui/validation-toast";

type AdminUser = {
  id: string;
  full_name: string | null;
  role: string;
  school_id: string | null;
  student_id: string | null;
  email: string | null;
  created_at: string;
};

export function UserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadUsers(): Promise<void> {
    setIsLoading(true);
    const response = await fetch("/api/admin/users");
    const payload = (await response.json()) as { data: AdminUser[]; error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setIsLoading(false);
      return;
    }
    setUsers(payload.data ?? []);
    setIsLoading(false);
  }

  async function deleteUser(id: string): Promise<void> {
    setMessage("");
    setBusyId(id);
    const response = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id })
    });
    const payload = (await response.json()) as { error: string | null };
    if (payload.error) {
      setMessage(`Error: ${payload.error}`);
      setBusyId(null);
      return;
    }
    setMessage("User deleted.");
    await loadUsers();
    setBusyId(null);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <section className="rounded-lg border bg-white p-4">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-slate-900">
          <span>Users ({users.length})</span>
          <span className="text-sm text-slate-500 group-open:hidden">Show</span>
          <span className="text-sm text-slate-500 hidden group-open:inline">Hide</span>
        </summary>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <ValidationToast message={message} variant={message.startsWith("Error") ? "error" : "info"} />
            <Button type="button" onClick={loadUsers} className="bg-secondary text-secondary-foreground" disabled={isLoading}>
              Refresh
            </Button>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users available.</p>
          ) : (
            <div className="grid gap-2">
              {users.map((user) => (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.full_name ?? "Unnamed user"}</p>
                    <p className="text-xs text-slate-500">{user.email ?? "no-email"}</p>
                    <p className="text-xs text-slate-500">
                      Role: {user.role} · School: {user.school_id ?? "N/A"}
                    </p>
                  </div>
                  <Button type="button" onClick={() => deleteUser(user.id)} disabled={busyId === user.id}>
                    {busyId === user.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
