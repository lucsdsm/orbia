import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark(!isDark);

    const theme = {
        isDark,
        colors: {
            background: isDark ? "#121212" : "#ffffffff",
            text: isDark ? "#ffffff" : "#000000",
            secondBackground: isDark ? "#1e1e1e" : "#f0f0f0",
            secondText: isDark ? "#444444ff" : "#bbbbbbff",
        },
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}