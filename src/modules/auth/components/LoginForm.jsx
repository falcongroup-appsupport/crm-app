import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { FieldLabel, Input } from "../../../shared/components/forms";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../../../shared/api/axiosInstance";
import { useToast } from "../../../shared/components/feedback/toast/useToast";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      toast.error("Sign-in failed", {
        description:
          err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <FieldLabel required>Email</FieldLabel>
        <Input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@falcongroup.ae"
        />
      </div>
      <div>
        <FieldLabel required>Password</FieldLabel>
        <Input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="w-full justify-center"
      >
        <LogIn className="h-4 w-4" />
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-ink-400">
        Auth isn't live on the backend yet — this screen is ready for when it
        is.
      </p>
    </form>
  );
}
