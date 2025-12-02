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

  async getCartoes() {
    return this.getCards();
  },

  async saveCard(card) {
    const cards = await this.getCards();
    await AsyncStorage.setItem("cartoes", JSON.stringify([...cards, card]));
  },

  async saveCartoes(cartoes) {
    await AsyncStorage.setItem("cartoes", JSON.stringify(cartoes));
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

  // 🔄 Migração de cartões antigos (v1.0 -> v1.0.1)
  async migrateOldCardReferences() {
    try {
      // Verifica se a migração já foi executada
      const migrated = await AsyncStorage.getItem("cards_migrated_v1.0.1");
      if (migrated === "true") {
        return; // Já migrado
      }

      const items = await this.getItems();
      const cards = await this.getCards();
      
      // Mapa de nomes antigos para novos IDs
      const cardMapping = {};
      
      // Encontra cartões pelo nome (case-insensitive)
      cards.forEach(card => {
        const nomeLower = card.nome.toLowerCase();
        cardMapping[nomeLower] = card.id;
      });
      
      // Atualiza itens que usam referências antigas
      let hasChanges = false;
      const updatedItems = items.map(item => {
        if (item.cartao && typeof item.cartao === 'string') {
          const cartaoLower = item.cartao.toLowerCase();
          
          // Se o cartão é uma string antiga (nubank, inter, etc)
          if (cardMapping[cartaoLower] && item.cartao !== cardMapping[cartaoLower]) {
            hasChanges = true;
            return {
              ...item,
              cartao: cardMapping[cartaoLower]
            };
          }
        }
        return item;
      });

      // Salva apenas se houve mudanças
      if (hasChanges) {
        await AsyncStorage.setItem("itens", JSON.stringify(updatedItems));
      }

      // Marca como migrado
      await AsyncStorage.setItem("cards_migrated_v1.0.1", "true");
    } catch (error) {
      console.error("Erro na migração de cartões:", error);
    }
  },
};