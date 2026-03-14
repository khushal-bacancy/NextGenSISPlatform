import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold tracking-tight">NextGen Student Information System</h1>
      <p className="max-w-2xl text-muted-foreground">
        MVP vertical slice covering enrollment, attendance, grades, and parent/student visibility.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild className="bg-secondary text-secondary-foreground">
          <Link href="/enrollment">Open dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
