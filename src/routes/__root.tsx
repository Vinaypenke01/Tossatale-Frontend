import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import favicon96 from "@/assets/favicon-96x96.png?url";
import { reportTossataleError } from "../lib/error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportTossataleError(error, { boundary: "tossatale_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "tossatale — Stories worth slowing down for" },
      {
        name: "description",
        content:
          "tossatale is a premium storytelling ecosystem: longform stories, series, essays and films from a community of curious writers.",
      },
      { name: "author", content: "tossatale" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400..800;1,400..700&family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap",
      },
      { rel: "icon", type: "image/png", href: favicon96 },
      { rel: "shortcut icon", type: "image/png", href: favicon96 },
      { rel: "apple-touch-icon", href: favicon96 },
    ],
    scripts: [
      {
        src: "https://accounts.google.com/gsi/client",
        async: true,
        defer: true,
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { UnderConstructionScreen } from "@/components/tossa/UnderConstructionScreen";
import { api } from "@/lib/api";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRootContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppRootContent() {
  const { user } = useAuth();
  const routerState = useRouterState();
  const currentPath =
    routerState?.location?.pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "/");

  // Fetch live maintenance_mode from settings
  const { data: siteSettings } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: async () => {
      try {
        const res = await api.get("/public/settings/");
        return res.data?.data || res.data || {};
      } catch {
        return {};
      }
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const isServerMaintenance = Boolean(siteSettings?.maintenance_mode);
  const isEnvUnderConstruction =
    import.meta.env.VITE_UNDER_CONSTRUCTION === "true" ||
    import.meta.env.VITE_UNDER_CONSTRUCTION === "TRUE";

  const isUnderConstructionActive = isServerMaintenance || isEnvUnderConstruction;

  // Admins or users accessing admin studio / auth route bypass the maintenance screen
  const isAdmin =
    user?.role === "ADMIN" ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("tossatale_user_role") === "ADMIN" ||
        localStorage.getItem("tossatale_user_role") === "admin"));

  const isExemptPath =
    currentPath === "/auth" ||
    currentPath === "/auth/" ||
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/");

  if (isUnderConstructionActive && !isAdmin && !isExemptPath) {
    return (
      <>
        <UnderConstructionScreen message={siteSettings?.maintenance_message} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster />
    </>
  );
}
