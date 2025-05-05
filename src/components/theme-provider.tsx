import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

// Custom theme colors with sky blue scheme
export const themeColors = {
  primary: {
    light: "#0ea5e9", // Sky-500
    dark: "#0284c7", // Sky-600
  },
  background: {
    light: "#ffffff", // White
    dark: "#0c4a6e", // Sky-900
  },
  text: {
    light: "#0f172a", // Slate-900
    dark: "#f0f9ff", // Sky-50
  },
  gradient: {
    light: "linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)", // White to Sky-100
    dark: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)", // Sky-900 to Sky-700
  },
  border: {
    light: "#bae6fd", // Sky-200
    dark: "#0c4a6e", // Sky-900
  },
  card: {
    light: "#ffffff", // White
    dark: "#0369a1", // Sky-700
  },
  button: {
    primary: {
      light: "#0ea5e9", // Sky-500
      dark: "#0284c7", // Sky-600
    },
    secondary: {
      light: "#e0f2fe", // Sky-100
      dark: "#0369a1", // Sky-700
    },
    hover: {
      light: "#0284c7", // Sky-600
      dark: "#0369a1", // Sky-700
    }
  },
  accent: {
    light: "#bae6fd", // Sky-200
    dark: "#0c4a6e", // Sky-900
  },
  success: {
    light: "#22c55e", // Green-500
    dark: "#16a34a", // Green-600
  },
  error: {
    light: "#ef4444", // Red-500
    dark: "#dc2626", // Red-600
  },
  warning: {
    light: "#f59e0b", // Amber-500
    dark: "#d97706", // Amber-600
  },
  info: {
    light: "#0ea5e9", // Sky-500
    dark: "#0284c7", // Sky-600
  }
}; 