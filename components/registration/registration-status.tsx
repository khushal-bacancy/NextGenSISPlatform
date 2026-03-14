"use client";

import { useEffect, useState } from "react";
import { RegistrationStatusLookup } from "@/components/registration/registration-status-lookup";

type RegistrationStatus = {
  requestId: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

type Props = {
  email?: string;
};

export function RegistrationStatus({ email }: Props) {
  const [requests, setRequests] = useState<RegistrationStatus[]>([]);
  const [message, setMessage] = useState("Loading status...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setMessage("Enter the email used on your registration to view status.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/registrations/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const payload = (await response.json()) as {
          error?: string;
          data?: { requests?: RegistrationStatus[] };
        };
        if (!response.ok) {
          if (isMounted) {
            setMessage(payload.error ?? "Unable to load registration status.");
          }
          return;
        }

        if (isMounted) {
          setRequests(payload.data?.requests ?? []);
          setMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error instanceof Error ? error.message : "Unable to load registration status.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStatus();
    return () => {
      isMounted = false;
    };
  }, [email]);

  return (
    <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Registration status</h1>
        <p className="text-sm text-slate-600">Track your student registration request.</p>
      </div>
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
        </div>
      ) : (
        <>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          {requests.length > 0 ? (
            <div className="space-y-3 text-sm text-slate-700">
              {requests.map((request, index) => (
                <div key={request.requestId} className="rounded-lg border bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">Request {requests.length - index}</p>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Submitted: {new Date(request.createdAt).toLocaleString()}
                  </p>
                  {request.notes ? <p className="mt-2 text-xs text-slate-600">Notes: {request.notes}</p> : null}
                  <p className="mt-2 text-[11px] text-slate-400">Request ID: {request.requestId}</p>
                </div>
              ))}
              {requests.some((request) => request.status === "approved") ? (
                <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <p className="font-semibold">Your registration is approved.</p>
                  <p className="mt-1">You can now sign in using the credentials provided by your school.</p>
                  <a className="mt-3 inline-flex rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white" href="/login">
                    Go to login
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No registrations found for this email.</p>
          )}
          <div className="rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold">Already approved?</p>
            <p className="mt-1">Use your student credentials to sign in.</p>
            <a className="mt-3 inline-flex rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white" href="/login">
              Go to login
            </a>
          </div>
          <div className="pt-2">
            <RegistrationStatusLookup />
          </div>
        </>
      )}
    </section>
  );
}
