import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageService = {
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
};