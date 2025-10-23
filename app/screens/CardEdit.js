// CardEdit.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { StorageService } from '../services/storage';

import { Feather } from '@expo/vector-icons';
import Toast from "react-native-toast-message";

import { useTheme } from '../contexts/ThemeContext';
import { useCartoes } from '../contexts/CartoesContext';

import { COLORS } from '../constants';

export default function CardEdit({ navigation, route }) {
  const { colors } = useTheme();
  const { updateCartao, deleteCartao, reloadCartoes } = useCartoes();
  const { card } = route.params;

  const [nome, setNome] = useState(card.nome || '');
  const [emoji, setEmoji] = useState(card.emoji || '');
  const [color, setColor] = useState(card.color || COLORS[0]);
  const [limite, setLimite] = useState(card.limite ? card.limite.toString() : '');

  const limiteChange = (texto) => {
    const novoValor = texto.replace(/[^0-9.]/g, "");
    if (novoValor.split(".").length > 2) return;
    setLimite(novoValor);
  };

  const limiteSubmit = () => {
    let valorNumerico = parseFloat(limite);
    if (isNaN(valorNumerico) || valorNumerico < 0) {
      valorNumerico = 0;
    }
    setLimite(valorNumerico.toFixed(2));
  };

  const handleSave = async () => {
    if (!nome.trim() || !limite.trim()) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios!",
        text2: "Preencha os campos marcados com (*).",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const updatedCard = {
        ...card,
        nome: nome.trim(),
        emoji: emoji.trim(),
        color,
        limite: parseFloat(limite) || 0,
      };

      await updateCartao(card.id, updatedCard);

      Toast.show({
        type: "success",
        text1: "Cartão atualizado com sucesso!",
        position: "top",
        visibilityTime: 2000,
      });

      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao atualizar cartão",
        position: "top",
      });
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.secondBackground }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}> ~ {card.nome} </Text>

        {/* preview */}
        <View style={[styles.preview, { backgroundColor: colors.card }]}>
          <Text style={styles.previewEmoji}>{emoji || '💳'}</Text>
          <Text style={[styles.previewNome, { color: colors.text }]}>
            {nome || 'Nome do Cartão'}
          </Text>

          <View style={[styles.previewColor, { backgroundColor: color }]} />
          {limite && (
            <Text style={[styles.previewLimite, { color: colors.textSecondary }]}>
              Limite: R$ {parseFloat(limite || 0).toFixed(2)}
            </Text>
          )}
        </View>

        {/* nome do cartão */}
        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Nome do cartão (*)"
          placeholderTextColor="#888"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Emoji"
          placeholderTextColor="#888"
          value={emoji}
          onChangeText={setEmoji}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Limite (R$) (*)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={limite}
          onChangeText={limiteChange}
          onBlur={limiteSubmit}
          onSubmitEditing={limiteSubmit}
        />

        {/* cor */}
        <View style={styles.colorGrid}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorButton,
                { backgroundColor: c },
                color === c && styles.colorSelected,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        {/* botões lado a lado com ícones */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#4CAF50" }]}
            onPress={handleSave}
          >
            <Feather name="check" size={24} color="#FFF" />
            <Text style={styles.iconButtonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#F44336" }]}
            onPress={async () => {
                try {
                    await StorageService.deleteCard(card.id);
                    await reloadCartoes();
                    Toast.show({
                        type: "error",
                        text1: "Cartão excluído!",
                        position: "top",
                        visibilityTime: 2000,
                    });
                    navigation.goBack();
                    } catch (error) {
                        console.error("Erro ao excluir cartão:", error);
                        Toast.show({
                            type: "error",
                            text1: "Erro ao excluir cartão.",
                            position: "top",
                        });
                    }
            }}
          >
            <Feather name="trash-2" size={24} color="#FFF" />
            <Text style={styles.iconButtonText}>Excluir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#757575" }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={24} color="#FFF" />
            <Text style={styles.iconButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    marginBlockStart: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderRightWidth: 1,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignContent: 'center',
    justifyContent: 'center',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  preview: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewNome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewColor: {
    width: 100,
    height: 8,
    borderRadius: 4,
  },
  previewLimite: {
    fontSize: 14,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
    marginHorizontal: 10,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  iconButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
