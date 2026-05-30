import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Attiva tema chiaro" : "Attiva tema scuro"}
      title={theme === "dark" ? "Tema chiaro" : "Tema scuro"}
      className={className}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.15rem] w-[1.15rem]" />
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem]" />
      )}
    </Button>
  );
}
