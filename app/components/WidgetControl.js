import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Componente para controlar o widget de notificação persistente
 */
export default function WidgetControl({ 
  widgetEnabled, 
  loading, 
  onToggle 
}) {
  const { colors } = useTheme();

  const handlePress = async () => {
    if (loading) return;
    await onToggle();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: widgetEnabled ? '#4CAF50' : colors.backgroundColor,
            borderColor: colors.text,
          }
        ]}
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <>
            <MaterialIcons 
              name={widgetEnabled ? 'notifications-active' : 'notifications-none'} 
              size={24}
              color={colors.text}
            />
            <Text 
              style={[styles.buttonText, { color: colors.text }]}
            >
              {widgetEnabled ? 'Widget ativo' : 'Ativar widget'}
            </Text>
          </>
        )}
      </TouchableOpacity>
      
      {widgetEnabled && (
        <Text style={[styles.hint, { color: colors.text }]}>
          💡 Toque na notificação para abrir o app
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
});
