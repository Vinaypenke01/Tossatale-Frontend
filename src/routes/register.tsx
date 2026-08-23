import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/register")({
  component: RegisterRedirect,
});

function RegisterRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/auth", search: { mode: "signup" } as any, replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Redirecting to registration...</span>
      </div>
    </div>
  );
}
