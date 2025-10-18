import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";

export default function Modal({ visible, onClose }) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const menuItems = [
    { name: "Itens", icon: "list", screen: "Itens" },
    { name: "Por Mês", icon: "calendar", screen: "Por Mês" },
    { name: "Por Cartão", icon: "credit-card", screen: "Por Cartão" },
    { name: "Configurações", icon: "settings", screen: "Configurações" },
  ];

  const navigateToScreen = (screen) => {
    onClose();
    navigation.navigate("Drawer", { screen });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.menuContainer, { backgroundColor: colors.secondBackground }]}>
          <View style={styles.menuHeader}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Menu</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.text + '20' }]}
              onPress={() => navigateToScreen(item.screen)}
            >
              <Feather name={item.icon} size={22} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 15,
  },
  menuItemText: {
    fontSize: 16,
  },
});
