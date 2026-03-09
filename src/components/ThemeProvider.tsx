import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="webtuto-theme"
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
