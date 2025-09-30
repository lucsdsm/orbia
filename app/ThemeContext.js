import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark(!isDark);

    const theme = {
        isDark,
        colors: {
            background: isDark ? "#121212" : "#f2f2f2",
            text: isDark ? "#ffffff" : "#000000",
            primary: "#6200ee",
            secondary: "#3700b3",
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