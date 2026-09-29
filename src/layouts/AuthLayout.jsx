import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4 dark:bg-ink-950">
      <Outlet />
    </div>
  );
}
