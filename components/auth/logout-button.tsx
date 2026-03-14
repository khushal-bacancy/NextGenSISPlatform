import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <Button type="submit" className={className}>
        Logout
      </Button>
    </form>
  );
}

