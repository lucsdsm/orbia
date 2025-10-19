import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";

export default function Sandwich({ visible, onClose }) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const SandwichItems = [
    { name: "Itens", icon: "list", screen: "Itens" },
    { name: "Por Mês", icon: "calendar", screen: "Por Mês" },
    { name: "Por Cartão", icon: "credit-card", screen: "Por Cartão" },
    { name: "Configurações", icon: "settings", screen: "Configurações" },
  ];

  const navigateToScreen = (screen) => {
    onClose();
    navigation.navigate("Drawer", { screen }, { animationEnabled: false });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.SandwichOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.SandwichContainer, { backgroundColor: colors.secondBackground }]}>
          <View style={styles.SandwichHeader}>
            <Text style={[styles.SandwichTitle, { color: colors.text }]}> Menu </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {SandwichItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.SandwichItem, { borderBottomColor: colors.text + '20' }]}
              onPress={() => navigateToScreen(item.screen)}
            >
              <Feather name={item.icon} size={22} color={colors.text} />
              <Text style={[styles.SandwichItemText, { color: colors.text }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  SandwichOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  SandwichContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  SandwichHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  SandwichTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  SandwichItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 15,
  },
  SandwichItemText: {
    fontSize: 16,
  },
});
