import { ThemeProvider } from "../shared/context/ThemeContext";
import { AuthProvider } from "../modules/auth";
import { ToastProvider } from "../shared/components/feedback/toast/ToastProvider";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
