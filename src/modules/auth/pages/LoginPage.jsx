import { Crosshair } from "lucide-react";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal-600">
          <Crosshair className="h-5 w-5 text-white" strokeWidth={2.25} />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-950 dark:text-white">Falcon Survey Engineering</h1>
        <p className="mt-1 text-sm text-ink-400">Sign in to your Falcon Group account</p>
      </div>
      <div className="rounded-xl bg-white p-6 ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
        <LoginForm />
      </div>
    </div>
  );
}
