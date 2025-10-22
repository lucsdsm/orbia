import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageService = {
  // ========== ITENS ==========
  async getItems() {
    const data = await AsyncStorage.getItem("itens");
    return data ? JSON.parse(data) : [];
  },

  async saveItem(item) {
    const items = await this.getItems();
    await AsyncStorage.setItem("itens", JSON.stringify([...items, item]));
  },

  async updateItem(id, updatedItem) {
    const items = await this.getItems();
    const updated = items.map(i => i.id === id ? updatedItem : i);
    await AsyncStorage.setItem("itens", JSON.stringify(updated));
  },

  async deleteItem(id) {
    const items = await this.getItems();
    const filtered = items.filter(i => i.id !== id);
    await AsyncStorage.setItem("itens", JSON.stringify(filtered));
  },

  // ========== CARTÕES ==========
  async getCards() {
    const data = await AsyncStorage.getItem("cartoes");
    return data ? JSON.parse(data) : [];
  },

  async saveCard(card) {
    const cards = await this.getCards();
    await AsyncStorage.setItem("cartoes", JSON.stringify([...cards, card]));
  },

  async updateCard(id, updatedCard) {
    const cards = await this.getCards();
    const updated = cards.map(c => c.id === id ? updatedCard : c);
    await AsyncStorage.setItem("cartoes", JSON.stringify(updated));
  },

  async deleteCard(id) {
    const cards = await this.getCards();
    const filtered = cards.filter(c => c.id !== id);
    await AsyncStorage.setItem("cartoes", JSON.stringify(filtered));
  },

  // ✅ Inicializar cartões padrão
  async initializeDefaultCards(defaultCards) {
    const cards = await this.getCards();
    if (cards.length === 0) {
      await AsyncStorage.setItem("cartoes", JSON.stringify(defaultCards));
    }
  },
};