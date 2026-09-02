export type Theme = "dark" | "light";

const STORAGE_KEY = "aero-feather-theme";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}

export function persistTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function getInitialThemeScript() {
  return `(function(){try{var k='aero-feather-theme';var s=localStorage.getItem(k);var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s==='light'||s==='dark'?s:(d?'dark':'light');var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.classList.toggle('light',t==='light');r.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;
}
