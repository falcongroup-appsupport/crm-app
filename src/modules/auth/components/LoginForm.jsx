import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { FieldLabel, Input } from "../../../shared/components/forms";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../../../shared/api/axiosInstance";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <FieldLabel required>Email</FieldLabel>
        <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@falcongroup.ae" />
      </div>
      <div>
        <FieldLabel required>Password</FieldLabel>
        <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && (
        <p className="rounded-lg bg-signal-50 px-3 py-2 text-sm text-signal-700 ring-1 ring-inset ring-signal-200 dark:bg-signal-500/10 dark:text-signal-400 dark:ring-signal-500/30">
          {error}
        </p>
      )}
      <Button type="submit" disabled={submitting} className="w-full justify-center">
        <LogIn className="h-4 w-4" />
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-ink-400">Auth isn't live on the backend yet — this screen is ready for when it is.</p>
    </form>
  );
}
