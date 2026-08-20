import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import authArt from "@/assets/cover-desk.jpg";
import logo from "@/assets/tossatale_offical_logo-removebg-preview.png";
import { Button, Field, Input } from "@/components/tossa/kit";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthContext";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — tossatale" },
      {
        name: "description",
        content:
          "Sign in to tossatale to keep your place in every story, save bookmarks and follow the writers you read most.",
      },
      { property: "og:title", content: "Sign in — tossatale" },
      { property: "og:description", content: "Keep your place in every story." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
  portfolioUrl?: string;
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signupRole, setSignupRole] = useState<"WRITER" | "READER">("WRITER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check live maintenance mode status
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
  });

  const isMaintenance = Boolean(siteSettings?.maintenance_mode);

  const { login, googleLogin, register } = useAuth();
  const navigate = useNavigate();

  const isSignup = mode === "signup";

  useEffect(() => {
    const googleClientId =
      (import.meta.env as Record<string, string>)["VITE_GOOGLE_CLIENT_ID"] ||
      "994213208335-fpqa9rm8h4pav9mcsaer73j2omr3quek.apps.googleusercontent.com";

    const initGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: { credential?: string }) => {
              if (!response.credential) {
                toast.error("Google authentication failed. No credential returned.");
                return;
              }
              setIsSubmitting(true);
              try {
                const res = await googleLogin(response.credential);
                const userObj = res.data?.user;
                toast.success("Welcome!", {
                  description: `Signed in as ${userObj?.email || "User"}.`,
                });

                if (userObj?.role === "ADMIN") {
                  navigate({ to: "/admin" });
                } else if (userObj?.role === "WRITER") {
                  navigate({ to: "/writer" });
                } else {
                  navigate({ to: "/" });
                }
              } catch (err: any) {
                toast.error("Google Sign-In Failed", {
                  description: err.message || "Could not complete Google authentication.",
                });
              } finally {
                setIsSubmitting(false);
              }
            },
          });

          const btnDiv = document.getElementById("google-signin-btn-container");
          if (btnDiv) {
            btnDiv.innerHTML = "";
            (window as any).google.accounts.id.renderButton(btnDiv, {
              theme: "outline",
              size: "large",
              width: 320,
              text: mode === "signup" ? "signup_with" : "signin_with",
              shape: "pill",
            });
          }
        } catch (e) {
          console.warn("Google initialization deferred:", e);
        }
      }
    };

    const timer = setTimeout(initGoogle, 400);
    return () => clearTimeout(timer);
  }, [mode, googleLogin, navigate]);

  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (isSignup && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (isSignup) {
      // Full Name validation
      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      }

      // Confirm Password validation
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Portfolio URL validation (optional, but validate format if provided)
      if (portfolioUrl.trim() && !/^https?:\/\/.+/i.test(portfolioUrl.trim())) {
        newErrors.portfolioUrl = "Please enter a valid URL starting with http:// or https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Validation Failed", {
        description: "Please fix the highlighted input errors before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (mode === "signin") {
        const res = await login({ email: email.trim(), password });
        const userObj = res.data?.user;
        const userRole = (userObj?.role || "").toUpperCase();

        toast.success("Signed in successfully!", {
          description: `Welcome back, ${userObj?.first_name || userObj?.full_name || "User"}!`,
        });

        if (userRole === "ADMIN") {
          navigate({ to: "/admin" });
        } else if (userRole === "WRITER") {
          navigate({ to: "/writer" });
        } else {
          navigate({ to: "/reader" });
        }
      } else {
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "";

        const res = await register({
          email: email.trim(),
          password,
          first_name: firstName,
          last_name: lastName,
          role: signupRole,
          bio: portfolioUrl.trim() ? `Portfolio: ${portfolioUrl.trim()}` : undefined,
        });

        toast.success(`${signupRole === "WRITER" ? "Writer" : "Reader"} account created successfully!`, {
          description: `Navigating to your ${signupRole === "WRITER" ? "Writer Studio" : "Reader Dashboard"}...`,
        });

        if (signupRole === "WRITER") {
          navigate({ to: "/writer" });
        } else {
          navigate({ to: "/reader" });
        }
      }
    } catch (err: any) {
      const serverErrors: FormErrors = {};
      let mainTitle = "Authentication failed";
      let detailDesc = "An error occurred while processing your request. Please try again.";

      if (err instanceof ApiError || err?.status) {
        if (err.status === 401) {
          mainTitle = "Invalid Credentials";
          detailDesc = "The email or password you entered is incorrect.";
          serverErrors.email = "Check your email address";
          serverErrors.password = "Check your password";
        } else if (err.status === 400 && err.errors) {
          mainTitle = "Registration Failed";
          Object.entries(err.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              const camelField =
                field === "first_name" || field === "last_name"
                  ? "fullName"
                  : field === "portfolio_url"
                  ? "portfolioUrl"
                  : field;
              (serverErrors as any)[camelField] = messages[0];
            }
          });
          detailDesc = Object.values(serverErrors)[0] || err.message || "Invalid input data provided.";
        } else if (err.message) {
          detailDesc = err.message;
        }
      } else if (err?.message) {
        detailDesc = err.message;
      }

      setErrors(serverErrors);
      toast.error(mainTitle, { description: detailDesc });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid h-screen w-full overflow-hidden lg:grid-cols-[1.05fr_1.15fr]">
      <div className="flex h-full w-full flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden bg-background relative">
        <div className="flex items-center justify-between w-full shrink-0">
          <Link to="/" className="inline-flex items-center">
            <img src={logo} alt="tossatale" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <div className="mx-auto my-auto max-w-[390px] w-full py-2 flex flex-col justify-center">
          <h1
            className={cn(
              "font-display font-bold leading-tight text-heading transition-all",
              isSignup ? "text-[clamp(1.4rem,2.2vw,1.85rem)]" : "text-[clamp(1.75rem,2.8vw,2.2rem)]",
            )}
          >
            {isSignup
              ? signupRole === "WRITER"
                ? "Become a Writer."
                : "Create Reader Account."
              : "Sign In to tossatale."}
          </h1>
          <p
            className={cn(
              "text-body leading-snug transition-all",
              isSignup ? "mt-1 text-[0.84rem]" : "mt-2 text-[0.9375rem]",
            )}
          >
            {isSignup
              ? signupRole === "WRITER"
                ? "Publish longform stories, series and essays to our audience."
                : "Save bookmarks, follow favorite storytellers, and build your library."
              : "Access your dashboard, saved stories, and publisher tools."}
          </p>

          {isMaintenance && (
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-left text-xs text-amber-600 dark:text-amber-300 flex items-start gap-2.5 shadow-sm">
              <ShieldAlert className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-700 dark:text-amber-200">
                  Platform Under Maintenance
                </span>
                Sign-in is currently restricted to Administrators only. Reader and Writer access and new registrations are temporarily paused.
              </div>
            </div>
          )}

          {!isMaintenance && (
            <div
              className={cn(
                "flex rounded-full border border-border bg-surface p-1 transition-all",
                isSignup ? "mt-3" : "mt-4",
              )}
            >
              {(
                [
                  ["signin", "Sign in"],
                  ["signup", "Create account"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  suppressHydrationWarning
                  disabled={isSubmitting}
                  onClick={() => handleModeSwitch(key)}
                  className={cn(
                    "flex-1 rounded-full py-1.5 font-sans text-[0.8125rem] font-bold transition-colors disabled:opacity-50",
                    mode === key ? "bg-primary text-primary-foreground" : "text-body hover:text-primary",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {isSignup && (
            <div className="mt-3 flex rounded-xl border border-border bg-surface p-1">
              <button
                type="button"
                suppressHydrationWarning
                disabled={isSubmitting}
                onClick={() => setSignupRole("WRITER")}
                className={cn(
                  "flex-1 rounded-lg py-1 font-sans text-[0.75rem] font-bold transition-colors disabled:opacity-50",
                  signupRole === "WRITER" ? "bg-primary text-primary-foreground" : "text-subtle hover:text-heading",
                )}
              >
                Writer Account
              </button>
              <button
                type="button"
                suppressHydrationWarning
                disabled={isSubmitting}
                onClick={() => setSignupRole("READER")}
                className={cn(
                  "flex-1 rounded-lg py-1 font-sans text-[0.75rem] font-bold transition-colors disabled:opacity-50",
                  signupRole === "READER" ? "bg-primary text-primary-foreground" : "text-subtle hover:text-heading",
                )}
              >
                Reader Account
              </button>
            </div>
          )}

          <form
            className={cn("transition-all relative", isSignup ? "mt-3 space-y-2.5" : "mt-4 space-y-3.5")}
            onSubmit={handleSubmit}
            noValidate
          >
            {isSignup && (
              <>
                <Field label="Full name">
                  <Input
                    placeholder="First and Last Name"
                    disabled={isSubmitting}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    className={cn(
                      "h-8.5 text-[0.8125rem]",
                      errors.fullName && "border-destructive focus:border-destructive focus:ring-destructive/20",
                    )}
                  />
                  {errors.fullName && (
                    <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                      {errors.fullName}
                    </span>
                  )}
                </Field>

                {signupRole === "WRITER" && (
                  <Field label="Portfolio / Writing sample URL">
                    <Input
                      placeholder="https://medium.com/@username"
                      disabled={isSubmitting}
                      value={portfolioUrl}
                      onChange={(e) => {
                        setPortfolioUrl(e.target.value);
                        if (errors.portfolioUrl) setErrors((prev) => ({ ...prev, portfolioUrl: "" }));
                      }}
                      className={cn(
                        "h-8.5 text-[0.8125rem]",
                        errors.portfolioUrl && "border-destructive focus:border-destructive focus:ring-destructive/20",
                      )}
                    />
                    {errors.portfolioUrl && (
                      <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                        {errors.portfolioUrl}
                      </span>
                    )}
                  </Field>
                )}
              </>
            )}

            <Field label="Email address">
              <Input
                type="email"
                placeholder="you@example.com"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={cn(
                  errors.email && "border-destructive focus:border-destructive focus:ring-destructive/20",
                  isSignup ? "h-8.5 text-[0.8125rem]" : "h-10 text-[0.875rem]",
                )}
              />
              {errors.email && (
                <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                  {errors.email}
                </span>
              )}
            </Field>

            <Field label="Password" hint={isSignup ? "At least 8 characters." : undefined}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={cn(
                    "pr-10",
                    errors.password && "border-destructive focus:border-destructive focus:ring-destructive/20",
                    isSignup ? "h-8.5 text-[0.8125rem]" : "h-10 text-[0.875rem]",
                  )}
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  disabled={isSubmitting}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                  {errors.password}
                </span>
              )}
            </Field>

            {isSignup && (
              <Field label="Confirm password">
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className={cn(
                      "pr-10 h-8.5 text-[0.8125rem]",
                      errors.confirmPassword && "border-destructive focus:border-destructive focus:ring-destructive/20",
                    )}
                  />
                  <button
                    type="button"
                    suppressHydrationWarning
                    disabled={isSubmitting}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading focus:outline-none transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                    {errors.confirmPassword}
                  </span>
                )}
              </Field>
            )}

            <Button
              type="submit"
              size="md"
              disabled={isSubmitting}
              className={cn(
                "w-full transition-all flex items-center justify-center gap-2",
                isSignup ? "h-9 text-[0.8125rem] mt-2" : "h-10 text-[0.875rem] mt-3",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary-foreground" />
                  <span>{isSignup ? "Creating Account..." : "Signing In..."}</span>
                </>
              ) : isSignup ? (
                `Create ${signupRole === "WRITER" ? "Writer" : "Reader"} Account`
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {!isMaintenance && (!isSignup || signupRole === "READER") && (
            <>
              <div
                className={cn(
                  "flex items-center gap-3 text-subtle transition-all",
                  isSignup ? "mt-2.5 text-[0.7rem]" : "mt-4 text-[0.75rem]",
                )}
              >
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <div className={cn("flex flex-col items-center justify-center", isSignup ? "mt-2" : "mt-3")}>
                <div id="google-signin-btn-container" className="min-h-[40px] flex items-center justify-center" />
                <p className="mt-1 text-[0.7rem] text-subtle text-center">
                  Reader access via Google
                </p>
              </div>
            </>
          )}

          <p className={cn("text-subtle transition-all", isSignup ? "mt-3 text-[0.7rem]" : "mt-5 text-[0.75rem]")}>
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>

        <div className="text-[0.75rem] text-subtle shrink-0 text-center sm:text-left">
          © {new Date().getFullYear()} tossatale
        </div>
      </div>

      <div className="relative hidden h-full overflow-hidden lg:block">
        <img src={authArt} alt="Writing desk" width={1920} height={1080} className="size-full object-cover" />
        <span className="absolute inset-0 bg-primary-hover/35" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="max-w-md font-display text-[1.65rem] leading-snug text-white italic">
            “I came for one story and stayed for four years.”
          </p>
          <p className="mt-3 text-[0.875rem] text-white/80">Member since 2022 · Kolkata</p>
        </div>
      </div>
    </div>
  );
}
