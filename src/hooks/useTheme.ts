import { useCallback, useEffect, useState } from "react";

const KEY = "focus-blocks:theme";
type Theme = "dark" | "light";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (localStorage.getItem(KEY) as Theme | null)
      : null) ?? "dark";
    setTheme(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggle };
};
