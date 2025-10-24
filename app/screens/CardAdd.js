import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCartoes } from '../contexts/CartoesContext';
import { useCardForm } from '../hooks';
import { showToast } from '../utils/toast';
import { COLORS } from '../constants';
import CardPreview from '../components/CardPreview';
import ColorGrid from '../components/ColorGrid';
import FormActionButtons from '../components/FormActionButtons';

export default function CardAdd({ navigation }) {
  const { colors } = useTheme();
  const { addCartao } = useCartoes();
  
  const {
    nome,
    emoji,
    color,
    limite,
    diaFechamento,
    setNome,
    setEmoji,
    setColor,
    handleLimiteChange,
    handleLimiteBlur,
    handleDiaFechamentoChange,
    validate,
    getFormValues,
  } = useCardForm({ color: COLORS[0] });

  const handleSave = async () => {
    const validation = validate();
    
    if (!validation.valid) {
      showToast('error', 'Campos obrigatórios!', validation.message);
      return;
    }

    try {
      const newCard = {
        id: Date.now().toString(),
        ...getFormValues(),
      };

      await addCartao(newCard);
      showToast('success', 'Cartão adicionado com sucesso!');
      navigation.goBack();
    } catch (error) {
      showToast('error', 'Erro ao adicionar cartão');
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.secondBackground }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}> + cartão </Text>

        <CardPreview 
          nome={nome}
          emoji={emoji}
          color={color}
          limite={limite}
          colors={colors}
        />

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
          maxLength={2}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Limite (R$) (*)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={limite}
          onChangeText={handleLimiteChange}
          onBlur={handleLimiteBlur}
          onSubmitEditing={handleLimiteBlur}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Dia de fechamento (1-31) (*)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={diaFechamento}
          onChangeText={handleDiaFechamentoChange}
        />

        <ColorGrid 
          colors={COLORS}
          selectedColor={color}
          onColorSelect={setColor}
        />

        <FormActionButtons
          onSave={handleSave}
          onCancel={() => navigation.goBack()}
          saveLabel="Adicionar"
        />
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
});
