import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import Saldo from "./Saldo";

export default function Home() {
    const { colors } = useTheme();

    return (
        <View style={[styles.home, { backgroundColor: colors.background }]}>
            <Saldo />
        </View>
    );
}

const styles = StyleSheet.create({
    home: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});