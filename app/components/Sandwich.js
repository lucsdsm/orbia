import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";

/**
 * Menu sanduíche para navegação entre telas principais.
*/
export default function Sandwich({ visible, onClose }) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const SandwichCardItems = [
    { name: "Todos os itens", icon: "list", screen: "Itens" },
    { name: "Por Mês", icon: "calendar", screen: "Por Mês" },
    { name: "Por Cartão", icon: "credit-card", screen: "Por Cartão" },
    { name: "Gráficos", icon: "bar-chart-2", screen: "Gráficos" },
  ];

  const SandwichCardCards = [
    { name: "Meus Cartões", icon: "credit-card", screen: "Cartões" },
  ];

  const SandwichCardApp = [
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

          {/* Itens */}
          <View style={styles.SandwichHeader}>
            <Text style={[styles.SandwichTitle, { color: colors.text }]}> Itens </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {SandwichCardItems.map((item, index) => (
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

          {/* Cartões */}
          <View style={styles.SandwichHeader}>
            <Text style={[styles.SandwichTitle, { color: colors.text }]}> Cartões </Text>
          </View>

          {SandwichCardCards.map((item, index) => (
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

          {/* Aplicativo */}
          <View style={styles.SandwichHeader}>
            <Text style={[styles.SandwichTitle, { color: colors.text }]}> Aplicativo </Text>
          </View>

          {SandwichCardApp.map((item, index) => (
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
    paddingTop: 25,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  SandwichTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  SandwichItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 8,
    gap: 10,
  },
  SandwichItemText: {
    fontSize: 16,
  },
});
