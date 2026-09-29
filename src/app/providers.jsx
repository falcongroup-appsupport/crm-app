import { ThemeProvider } from "../shared/context/ThemeContext";
import { AuthProvider } from "../modules/auth";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
