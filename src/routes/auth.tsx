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
  X,
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
  otp?: string;
  newPassword?: string;
  consent?: string;
}

type AuthMode = "signin" | "signup" | "forgot" | "verify-otp";

function AuthPage() {
  const getInitialMode = (): AuthMode => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup") return "signup";
      if (params.get("mode") === "forgot") return "forgot";
      if (params.get("mode") === "verify-otp") return "verify-otp";
    }
    return "signin";
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

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

  const { login, googleLogin, register, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const navigate = useNavigate();

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const isVerifyOtp = mode === "verify-otp";

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

  // Step 1: Send OTP to Email (Forgot Password)
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

  // Step 2: Validate OTP Only (Forgot Password)
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

  // Step 3: Set & Save New Password (Forgot Password)
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

  // Writer Registration OTP Verification handler
  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrors({ otp: "Please enter the full 6-digit verification code" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await verifyRegistrationOtp(email.trim(), otpCode.trim());
      const userObj = res.data?.user;
      toast.success("Writer Account Activated! 🎉", {
        description: `Welcome to Tossatale, ${userObj?.first_name || "Storyteller"}!`,
      });
      navigate({ to: "/writer" });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid or expired verification code.";
      setErrors({ otp: msg });
      toast.error("Activation Failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Writer Registration Resend OTP handler
  const handleResendRegistrationOtp = async () => {
    if (otpCountdown > 0) return;
    try {
      await resendRegistrationOtp(email.trim());
      setOtpCountdown(60);
      toast.success("New Verification Code Sent!", {
        description: `A fresh 6-digit code has been sent to ${email.trim()}.`,
      });
    } catch (err: any) {
      toast.error("Could not resend code", { description: err.message });
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

      if (!consentGiven) {
        newErrors.consent = "You must agree to the Terms of service and Privacy policy to register.";
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

        const regRes = await register({
          email: email.trim(),
          password,
          first_name: firstName,
          last_name: lastName,
          role: "WRITER",
          consent: consentGiven,
          terms_accepted: consentGiven,
        });

        if (regRes.data?.requires_otp) {
          setMode("verify-otp");
          setOtpCountdown(60);
          setOtpCode("");
          toast.success("Activation Code Sent!", {
            description: `We have sent a 6-digit verification code to ${email.trim()}. Please enter it below to activate your writer account.`,
          });
          return;
        }

        toast.success("Writer Account Created!", {
          description: "Welcome to Tossatale! Navigating to your Writer Studio...",
        });

        navigate({ to: "/writer" });
      }
    } catch (err: any) {
      const serverErrors: FormErrors = {};
      let mainTitle = "Authentication failed";
      let detailDesc = "An error occurred while processing your request. Please try again.";

      // Handle unverified writer login check
      const isUnverified =
        err?.error_code === "EMAIL_NOT_VERIFIED" ||
        err?.errors?.error_code === "EMAIL_NOT_VERIFIED" ||
        err?.response?.data?.error_code === "EMAIL_NOT_VERIFIED" ||
        err?.message?.toLowerCase()?.includes("verification") ||
        err?.message?.toLowerCase()?.includes("verify your email");

      if (isUnverified) {
        setMode("verify-otp");
        setOtpCountdown(60);
        setOtpCode("");
        toast.info("Email Verification Required", {
          description: `Your writer account is pending activation. A fresh 6-digit verification code has been sent to ${email.trim()}.`,
        });
        return;
      }

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
    <div className="min-h-screen w-full bg-white dark:bg-zinc-950 flex flex-col justify-between items-center px-4 py-8 sm:py-12 relative overflow-x-hidden">
      {/* Top Left Back Navigation Button */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            window.history.back();
          } else {
            navigate({ to: "/" });
          }
        }}
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-black dark:hover:text-white font-sans text-xs font-bold transition-all shadow-xs hover:shadow-sm z-20 cursor-pointer"
        aria-label="Go Back"
      >
        <ArrowLeft className="size-4" />
        <span>Back</span>
      </button>

      {/* Top right "X" mark to return to Home page */}
      <Link
        to="/"
        suppressHydrationWarning
        className="absolute top-6 right-6 size-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors z-20"
        aria-label="Back to Home"
      >
        <X className="size-5" />
      </Link>

      <div className="w-full flex-1 flex items-center justify-center my-auto">
        <div className="max-w-[440px] w-full rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-[0_10px_35px_rgba(0,0,0,0.06)] p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle logo tint ambient backdrop */}
          <div className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-[#2B638C]/10 blur-3xl" />

          {/* Clean Header Title without logo inside form */}
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-heading">
              {isVerifyOtp
                ? "Activate Account"
                : isForgot
                  ? forgotStep === 1
                    ? "Reset Password"
                    : forgotStep === 2
                      ? "Verify Code"
                      : "New Password"
                  : isSignup
                    ? "Writer Registration"
                    : "Sign In"}
            </h1>
            <p className="mt-1.5 text-[0.9375rem] text-subtle">
              Sign In to tossatale
            </p>
          </div>

          {/* Maintenance Notice */}
          {isMaintenance && (
            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-left text-xs text-amber-600 dark:text-amber-300 flex items-start gap-2.5 shadow-sm">
              <ShieldAlert className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-700 dark:text-amber-200">
                  Platform Under Maintenance
                </span>
                Sign-in is currently restricted to Administrators only. Reader and Writer access is temporarily paused.
              </div>
            </div>
          )}

          {/* Reader / Writer Side-by-Side Switcher */}
          {!isMaintenance && !isForgot && !isVerifyOtp && (
            <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 dark:bg-zinc-800 p-1">
              <button
                type="button"
                suppressHydrationWarning
                disabled={isSubmitting}
                onClick={() => handleModeSwitch("signin")}
                className={cn(
                  "py-2 rounded-lg font-sans text-[0.875rem] font-bold transition-all text-center cursor-pointer",
                  mode === "signin"
                    ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-black dark:hover:text-white",
                )}
              >
                Reader
              </button>
              <button
                type="button"
                suppressHydrationWarning
                disabled={isSubmitting}
                onClick={() => handleModeSwitch("signup")}
                className={cn(
                  "py-2 rounded-lg font-sans text-[0.875rem] font-bold transition-all text-center cursor-pointer",
                  mode === "signup"
                    ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-black dark:hover:text-white",
                )}
              >
                Writer
              </button>
            </div>
          )}

          {/* Quick Reader Google Login on Sign In view */}
          {!isMaintenance && mode === "signin" && (
            <div className="mt-6">
              <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 text-center">
                <div id="google-signin-btn-container" className="min-h-[40px] flex items-center justify-center" />
                <p className="mt-2 text-[0.75rem] text-subtle">
                  Instant access to bookmarks and saved stories
                </p>
              </div>

              <div className="my-5 flex items-center gap-3 text-subtle text-xs">
                <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
              </div>
            </div>
          )}

          {/* ─── WRITER REGISTRATION OTP VERIFICATION FLOW ─── */}
          {isVerifyOtp ? (
            <div className="mt-6 space-y-4">
              <form onSubmit={handleVerifyRegistrationOtp} className="space-y-3.5 animate-fade-up">
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-xs text-primary dark:text-primary flex items-start gap-2.5 shadow-sm">
                  <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <span className="font-bold block text-heading">
                      Account Activation Required
                    </span>
                    A 6-digit verification code was sent to <strong className="text-heading font-medium">{email}</strong>.
                  </div>
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
                      onClick={handleResendRegistrationOtp}
                      className="inline-flex items-center gap-1 text-primary font-bold hover:underline cursor-pointer"
                    >
                      <RefreshCw className="size-3" /> Resend Code
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  size="md"
                  disabled={isSubmitting || otpCode.length < 6}
                  className="w-full h-11 text-[0.875rem] mt-2 font-bold gap-2 bg-[#FF6B35] hover:bg-[#e85b27] text-white border-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-white" />
                      <span>Activating Account...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      <span>Verify & Enter Studio</span>
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => handleModeSwitch("signin")}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-subtle hover:text-primary transition-colors py-1 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" /> Back to Sign In
                </button>
              </form>
            </div>
          ) : isForgot ? (
            <div className="mt-6 space-y-4">
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
                        "h-11 text-[0.875rem]",
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
                    className="w-full h-11 text-[0.875rem] mt-2 gap-2 font-bold bg-[#FF6B35] hover:bg-[#e85b27] text-white border-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-white" />
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
                    suppressHydrationWarning
                    onClick={() => handleModeSwitch("signin")}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-subtle hover:text-primary transition-colors py-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Sign In
                  </button>
                </form>
              )}

              {/* STEP 2: Verify OTP Only */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5" suppressHydrationWarning>
                  <div className="flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2 border border-border text-xs">
                    <span className="text-subtle truncate max-w-[220px]">
                      Code sent to: <strong className="text-heading font-medium">{email}</strong>
                    </span>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setForgotStep(1)}
                      className="text-primary font-bold hover:underline shrink-0 ml-2 cursor-pointer"
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

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-subtle">Didn't receive code?</span>
                    {otpCountdown > 0 ? (
                      <span className="font-bold text-subtle">Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="inline-flex items-center gap-1 text-primary font-bold hover:underline cursor-pointer"
                      >
                        <RefreshCw className="size-3" /> Resend Code
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full h-11 text-[0.875rem] mt-2 gap-2 font-bold bg-[#FF6B35] hover:bg-[#e85b27] text-white border-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-white" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => handleModeSwitch("signin")}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-subtle hover:text-primary transition-colors py-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Sign In
                  </button>
                </form>
              )}

              {/* STEP 3: Set New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    <span>Identity verified. Please set your new password.</span>
                  </div>

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
                          "pr-10 h-11 text-[0.875rem]",
                          errors.newPassword && "border-destructive focus:border-destructive focus:ring-destructive/20",
                        )}
                      />
                      <button
                        type="button"
                        suppressHydrationWarning
                        disabled={isSubmitting}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading focus:outline-none transition-colors"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
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
                          "pr-10 h-11 text-[0.875rem]",
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
                    className="w-full h-11 text-[0.875rem] mt-2 gap-2 font-bold bg-[#FF6B35] hover:bg-[#e85b27] text-white border-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-white" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="size-4" />
                        <span>Update Password & Sign In</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {isSignup && (
                <Field label="Full name">
                  <Input
                    placeholder="e.g. Maya Sen"
                    disabled={isSubmitting}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    className={cn(
                      "h-10 text-[0.875rem]",
                      errors.fullName && "border-destructive focus:border-destructive focus:ring-destructive/20",
                    )}
                  />
                  {errors.fullName && (
                    <span className="mt-1 block font-sans text-[0.75rem] font-bold text-destructive">
                      {errors.fullName}
                    </span>
                  )}
                </Field>
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

              <Field label="Password">
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
                      "pr-10 h-10 text-[0.875rem]",
                      errors.password && "border-destructive focus:border-destructive focus:ring-destructive/20",
                    )}
                  />
                  <button
                    type="button"
                    suppressHydrationWarning
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading focus:outline-none transition-colors cursor-pointer"
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

              {!isSignup && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => handleModeSwitch("forgot")}
                    className="text-xs font-bold text-[#2B638C] hover:underline cursor-pointer"
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
                        "pr-10 h-10 text-[0.875rem]",
                        errors.confirmPassword && "border-destructive focus:border-destructive focus:ring-destructive/20",
                      )}
                    />
                    <button
                      type="button"
                      suppressHydrationWarning
                      disabled={isSubmitting}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading focus:outline-none transition-colors cursor-pointer"
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

              {isSignup && (
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none text-left">
                    <input
                      type="checkbox"
                      suppressHydrationWarning
                      checked={consentGiven}
                      onChange={(e) => {
                        setConsentGiven(e.target.checked);
                        if (errors.consent) setErrors((prev) => ({ ...prev, consent: "" }));
                      }}
                      disabled={isSubmitting}
                      className="size-4 mt-0.5 rounded border-slate-300 text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer shrink-0 accent-[#FF6B35]"
                    />
                    <span className="text-[0.8125rem] text-body leading-snug">
                      I agree to the{" "}
                      <Link to="/terms" target="_blank" className="font-bold text-[#2B638C] hover:underline" onClick={(e) => e.stopPropagation()}>
                        Terms of service
                      </Link>
                      ,{" "}
                      <Link to="/privacy" target="_blank" className="font-bold text-[#2B638C] hover:underline" onClick={(e) => e.stopPropagation()}>
                        Privacy policy
                      </Link>
                      , and Writer Publishing Guidelines.
                    </span>
                  </label>
                  {errors.consent && (
                    <span className="mt-1.5 block font-sans text-[0.75rem] font-bold text-destructive text-left">
                      {errors.consent}
                    </span>
                  )}
                </div>
              )}

              <Button
                type="submit"
                size="md"
                disabled={isSubmitting}
                className="w-full h-11 text-[0.875rem] mt-3 font-bold bg-[#FF6B35] hover:bg-[#e85b27] text-white border-none shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-white" />
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

          {/* Centered Terms and Privacy */}
          <p className="mt-5 text-center text-xs text-subtle">
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-[#2B638C] font-semibold hover:underline">
              Terms of service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-[#2B638C] font-semibold hover:underline">
              Privacy policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Centered Footer Copyright */}
      <div className="w-full text-center text-[0.8125rem] text-subtle shrink-0 pt-4">
        © {new Date().getFullYear()} tossatale. All rights reserved.
      </div>
    </div>
  );
}
