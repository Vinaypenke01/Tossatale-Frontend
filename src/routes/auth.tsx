import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Feather,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import authArt from "@/assets/cover-desk.jpg";
import logo from "@/assets/official_tossatale_logo.png";
import { Button, Field, Input } from "@/components/tossa/kit";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthContext";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In / Writer Registration — tossatale" },
      {
        name: "description",
        content:
          "Sign in to tossatale or apply as a contributing writer to publish longform stories, series, essays and films.",
      },
      { property: "og:title", content: "Sign In / Writer Registration — tossatale" },
      { property: "og:description", content: "Stories worth slowing down for." },
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
  otp?: string;
  newPassword?: string;
}

type AuthMode = "signin" | "signup" | "forgot";

function AuthPage() {
  const getInitialMode = (): AuthMode => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup") return "signup";
      if (params.get("mode") === "forgot") return "forgot";
    }
    return "signin";
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Forgot Password 3-Step Flow:
  // Step 1: Enter email & Send OTP
  // Step 2: Enter & Verify 6-digit OTP
  // Step 3: Enter & Confirm New Password
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

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
  const isForgot = mode === "forgot";

  // Google Auth Button Rendering
  useEffect(() => {
    if (mode !== "signin" || isMaintenance) return;

    const initGoogle = () => {
      import("@/lib/googleAuth").then(({ setupGoogleAuth, renderGoogleButton }) => {
        const ready = setupGoogleAuth(async (response: { credential?: string }) => {
          if (!response.credential) {
            toast.error("Google authentication failed. No credential returned.");
            return;
          }
          setIsSubmitting(true);
          try {
            const res = await googleLogin(response.credential);
            const userObj = res.data?.user;
            toast.success("Welcome to Tossatale!", {
              description: `Signed in as ${userObj?.first_name || userObj?.email || "Reader"}.`,
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
        });

        if (ready) {
          const btnDiv = document.getElementById("google-signin-btn-container");
          if (btnDiv) {
            renderGoogleButton(btnDiv, {
              theme: "outline",
              size: "large",
              width: 320,
              text: "signin_with",
              shape: "pill",
            });
          }
        }
      });
    };

    const timer = setTimeout(initGoogle, 250);
    return () => clearTimeout(timer);
  }, [mode, isMaintenance, googleLogin, navigate]);

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    if (newMode === "forgot") {
      setForgotStep(1);
      setOtpCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "Email address is required to reset password" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post("/auth/password/send-otp/", { email: email.trim() });
      setOtpCountdown(60);
      setForgotStep(2);
      toast.success("Verification Code Sent!", {
        description: `Please check your email inbox at ${email.trim()} for the 6-digit code.`,
      });
    } catch (err: any) {
      toast.error("Could not send code", {
        description: err.message || "Please check your email address and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Validate OTP Only
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrors({ otp: "Please enter the 6-digit verification code" });
      return;
    }
    if (otpCode.trim().length < 6) {
      setErrors({ otp: "Please enter the full 6-digit verification code" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post("/auth/password/verify-otp/", {
        email: email.trim(),
        otp: otpCode.trim(),
      });

      toast.success("Code Verified Successfully! ✅", {
        description: "Please enter your new password below.",
      });

      // Progress to Step 3 (Set New Password)
      setForgotStep(3);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Invalid or expired verification code.";
      setErrors({ otp: msg });
      toast.error("Invalid Code", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Set & Save New Password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!confirmNewPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post("/auth/password/reset-with-otp/", {
        email: email.trim(),
        otp: otpCode.trim(),
        new_password: newPassword,
      });

      toast.success("Password Updated Successfully! 🎉", {
        description: "You can now sign in with your new password.",
      });

      // Reset form and switch to Sign In mode
      setPassword("");
      setMode("signin");
      setForgotStep(1);
      setOtpCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Password update failed. Please try again.";
      toast.error("Update Failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (isSignup && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (isSignup) {
      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

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
        const firstName = nameParts[0] || "Writer";
        const lastName = nameParts.slice(1).join(" ") || "";

        await register({
          email: email.trim(),
          password,
          first_name: firstName,
          last_name: lastName,
          role: "WRITER",
          bio: portfolioUrl.trim() ? `Portfolio: ${portfolioUrl.trim()}` : undefined,
          website_url: portfolioUrl.trim() || undefined,
        });

        toast.success("Writer Account Created!", {
          description: "Welcome to Tossatale! Navigating to your Writer Studio...",
        });

        navigate({ to: "/writer" });
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
      <div className="flex h-full w-full flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-y-auto bg-background relative">
        <div className="flex items-center justify-between w-full shrink-0">
          <Link to="/" className="inline-flex items-center">
            <img src={logo} alt="tossatale" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <div className="mx-auto my-auto max-w-[390px] w-full py-4 flex flex-col justify-center">
          {/* Header Title */}
          <h1
            className={cn(
              "font-display font-bold leading-tight text-heading transition-all",
              isSignup || isForgot ? "text-[clamp(1.4rem,2.2vw,1.85rem)]" : "text-[clamp(1.75rem,2.8vw,2.2rem)]",
            )}
          >
            {isForgot
              ? forgotStep === 1
                ? "Reset Your Password"
                : forgotStep === 2
                  ? "Verify 6-Digit Code"
                  : "Set New Password"
              : isSignup
                ? "Become a Contributing Writer."
                : "Sign In to tossatale."}
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              "text-body leading-snug transition-all",
              isSignup || isForgot ? "mt-1 text-[0.84rem]" : "mt-2 text-[0.9375rem]",
            )}
          >
            {isForgot
              ? forgotStep === 1
                ? "Enter your account email to receive a 6-digit verification code."
                : forgotStep === 2
                  ? `Enter the 6-digit verification code sent to ${email}.`
                  : "Choose a secure new password for your account."
              : isSignup
                ? "Join our storyteller collective to write and publish longform stories, series and essays."
                : "Readers sign in with Google. Writers and Editors access studios with email."}
          </p>

          {/* Maintenance Notice */}
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

          {/* Mode Switcher Tabs (Sign In / Writer Registration) */}
          {!isMaintenance && !isForgot && (
            <div
              className={cn(
                "flex rounded-full border border-border bg-surface p-1 transition-all",
                isSignup ? "mt-3" : "mt-4",
              )}
            >
              {(
                [
                  ["signin", "Sign In"],
                  ["signup", "Writer Registration"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  suppressHydrationWarning
                  disabled={isSubmitting}
                  onClick={() => handleModeSwitch(key)}
                  className={cn(
                    "flex-1 rounded-full py-1.5 font-sans text-[0.8125rem] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5",
                    mode === key ? "bg-primary text-primary-foreground" : "text-body hover:text-primary",
                  )}
                >
                  {key === "signup" && <Feather className="size-3.5" />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Reader Google Login on Sign In view */}
          {!isMaintenance && mode === "signin" && (
            <div className="mt-4 mb-1">
              <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-heading mb-2.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Reader Quick Sign In</span>
                </div>
                <div id="google-signin-btn-container" className="min-h-[40px] flex items-center justify-center" />
                <p className="mt-1.5 text-[0.7rem] text-subtle">
                  Instant access to bookmarks and liked stories
                </p>
              </div>

              <div className="my-4 flex items-center gap-3 text-subtle text-xs">
                <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
              </div>
            </div>
          )}

          {/* ─── 3-STEP FORGOT PASSWORD FLOW ─── */}
          {isForgot ? (
            <div className="mt-4 space-y-4">
              {/* STEP 1: Enter Email & Send OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <Field label="Account Email Address">
                    <Input
                      type="email"
                      placeholder="writer@tossatale.com"
                      disabled={isSubmitting}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      className={cn(
                        "h-10 text-[0.875rem]",
                        errors.email && "border-destructive focus:border-destructive focus:ring-destructive/20",
                      )}
                    />
                    {errors.email && (
                      <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                        {errors.email}
                      </span>
                    )}
                  </Field>

                  <Button
                    type="submit"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full h-10 text-[0.875rem] mt-2 gap-2 font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-primary-foreground" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="size-4" />
                        <span>Send 6-Digit Code</span>
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleModeSwitch("signin")}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-subtle hover:text-primary transition-colors py-1"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Sign In
                  </button>
                </form>
              )}

              {/* STEP 2: Verify OTP Only (No Password Fields Shown) */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2 border border-border text-xs">
                    <span className="text-subtle truncate max-w-[220px]">
                      Code sent to: <strong className="text-heading font-medium">{email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-primary font-bold hover:underline shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  <Field label="6-Digit Verification Code">
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      disabled={isSubmitting}
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ""));
                        if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
                      }}
                      className={cn(
                        "h-11 text-center tracking-[0.35em] font-mono text-lg font-bold",
                        errors.otp && "border-destructive focus:border-destructive focus:ring-destructive/20",
                      )}
                    />
                    {errors.otp && (
                      <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive text-center">
                        {errors.otp}
                      </span>
                    )}
                  </Field>

                  {/* Resend OTP button */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-subtle">Didn't receive code?</span>
                    {otpCountdown > 0 ? (
                      <span className="font-bold text-subtle">Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                      >
                        <RefreshCw className="size-3" /> Resend Code
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full h-10 text-[0.875rem] mt-2 font-bold gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-primary-foreground" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        <span>Verify Code</span>
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleModeSwitch("signin")}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-subtle hover:text-primary transition-colors py-1"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Sign In
                  </button>
                </form>
              )}

              {/* STEP 3: Enter New Password (Only Shown After OTP Is Verified) */}
              {forgotStep === 3 && (
                <form onSubmit={handleSetNewPassword} className="space-y-3.5 animate-fade-up">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>OTP verified for <strong>{email}</strong>. Please enter your new password below.</span>
                  </div>

                  {/* New Password Field */}
                  <Field label="New Password" hint="At least 8 characters.">
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
                        }}
                        className={cn(
                          "pr-10 h-10 text-[0.875rem]",
                          errors.newPassword && "border-destructive focus:border-destructive focus:ring-destructive/20",
                        )}
                      />
                      <button
                        type="button"
                        suppressHydrationWarning
                        disabled={isSubmitting}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading focus:outline-none transition-colors"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                        {errors.newPassword}
                      </span>
                    )}
                  </Field>

                  {/* Confirm New Password Field */}
                  <Field label="Confirm New Password">
                    <div className="relative">
                      <Input
                        type={showConfirmNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                        className={cn(
                          "pr-10 h-10 text-[0.875rem]",
                          errors.confirmPassword && "border-destructive focus:border-destructive focus:ring-destructive/20",
                        )}
                      />
                      <button
                        type="button"
                        suppressHydrationWarning
                        disabled={isSubmitting}
                        onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading focus:outline-none transition-colors"
                        aria-label={showConfirmNewPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </Field>

                  <Button
                    type="submit"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full h-10 text-[0.875rem] mt-2 font-bold gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-primary-foreground" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="size-4" />
                        <span>Set New Password & Sign In</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            /* ─── STANDARD SIGN IN & WRITER SIGNUP FORMS ─── */
            <form
              className={cn("transition-all relative", isSignup ? "mt-3 space-y-2.5" : "space-y-3.5")}
              onSubmit={handleSubmit}
              noValidate
            >
              {isSignup && (
                <>
                  <Field label="Full name">
                    <Input
                      placeholder="e.g. Vikram Seth"
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

                  <Field label="Portfolio / Writing sample URL (Optional)">
                    <Input
                      placeholder="https://medium.com/@username or personal site"
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
                </>
              )}

              <Field label="Email address">
                <Input
                  type="email"
                  placeholder="writer@tossatale.com"
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

              {/* Forgot password link on Sign In */}
              {!isSignup && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("forgot")}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

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
                  isSignup ? "h-9 text-[0.8125rem] mt-2" : "h-10 text-[0.875rem] mt-2",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-primary-foreground" />
                    <span>{isSignup ? "Creating Writer Account..." : "Signing In..."}</span>
                  </>
                ) : isSignup ? (
                  "Create Writer Account"
                ) : (
                  "Sign In with Email"
                )}
              </Button>
            </form>
          )}

          <p className={cn("text-subtle transition-all", isSignup ? "mt-3 text-[0.7rem]" : "mt-4 text-[0.75rem]")}>
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
