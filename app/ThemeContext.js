import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);

    // Carrega o tema salvo ao iniciar
    useEffect(() => {
        carregarTema();
    }, []);

    const carregarTema = async () => {
        try {
            const temaSalvo = await AsyncStorage.getItem("@orbia:tema");
            if (temaSalvo !== null) {
                setIsDark(temaSalvo === "dark");
            }
        } catch (error) {
            console.error("Erro ao carregar tema:", error);
        } finally {
            setLoading(false);
        }
    };

    const salvarTema = async (isDarkMode) => {
        try {
            await AsyncStorage.setItem("@orbia:tema", isDarkMode ? "dark" : "light");
        } catch (error) {
            console.error("Erro ao salvar tema:", error);
        }
    };

    const toggleTheme = () => {
        const novoTema = !isDark;
        setIsDark(novoTema);
        salvarTema(novoTema);
    };

    const theme = {
        isDark,
        colors: {
            background: isDark ? "#121212" : "#ffffffff",
            text: isDark ? "#ffffff" : "#000000",
            secondBackground: isDark ? "#1e1e1e" : "#f0f0f0",
            secondText: isDark ? "#444444ff" : "#bbbbbbff",
        },
        toggleTheme,
        loading,
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