import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useCartoes } from "../contexts/CartoesContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Settings = React.memo(() => {
    const { colors } = useTheme();
    const { recarregarItens } = useItens();
    const { reloadCartoes } = useCartoes();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const exportarDados = async () => {
        try {
            setLoading(true);

            // Busca todos os dados
            const itens = await AsyncStorage.getItem("itens");
            const saldo = await AsyncStorage.getItem("@orbia:saldo");
            const cartoes = await AsyncStorage.getItem("cartoes");

            const dados = {
                itens: itens ? JSON.parse(itens) : [],
                saldo: saldo ? parseFloat(saldo) : 0,
                cartoes: cartoes ? JSON.parse(cartoes) : [],
                exportadoEm: new Date().toISOString(),
                versao: "1.0.1",
            };

            const jsonString = JSON.stringify(dados, null, 2);
            const agora = new Date();
            const data = agora.toISOString().split('T')[0]; // yyyy-mm-dd
            const hora = agora.toTimeString().split(' ')[0].replace(/:/g, '-'); // hh-mm-ss
            const fileName = `orbia-backup-${data}-${hora}.json`;

            const fileUri = FileSystemLegacy.documentDirectory + fileName;

            // Salva o arquivo
            await FileSystemLegacy.writeAsStringAsync(fileUri, jsonString);

            // Compartilha o arquivo
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: "application/json",
                    dialogTitle: "Exportar dados do Orbia",
                });

                Toast.show({
                    type: "success",
                    text1: "Dados exportados!",
                    text2: "Arquivo salvo e compartilhado",
                    position: "top",
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.error("Erro ao exportar:", error);
            Toast.show({
                type: "error",
                text1: "Erro ao exportar dados",
                text2: error.message,
                position: "top",
                visibilityTime: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const importarDados = async () => {
        try {
            setLoading(true);

            // Seleciona o arquivo
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
                copyToCacheDirectory: true,
            });

            // Verifica se foi cancelado (nova API)
            if (result.canceled || !result.assets || result.assets.length === 0) {
                setLoading(false);
                return;
            }

            const file = result.assets[0];

            // Lê o arquivo
            const fileContent = await FileSystemLegacy.readAsStringAsync(file.uri);
            const dados = JSON.parse(fileContent);

            // Valida o formato
            if (!dados.itens || !Array.isArray(dados.itens)) {
                throw new Error("Formato de arquivo inválido");
            }

            // Confirma antes de substituir
            Toast.show({
                type: "info", // Ou 'info' se você tiver um estilo para isso
                text1: `Confirmar a importação de ${dados.itens.length} itens?`,
                text2: `Toqie novamente para importar e substituir seus dados atuais.`,
                position: "top",
                visibilityTime: 4000, // Tempo para o usuário ler a mensagem
                autoHide: false, // Não esconder automaticamente para permitir interação
                onPress: async () => {
                    Toast.hide(); // Esconder o Toast atual
                    try {
                        // Salva os dados
                        await AsyncStorage.setItem("itens", JSON.stringify(dados.itens));

                        if (dados.saldo !== undefined) {
                            await AsyncStorage.setItem("@orbia:saldo", dados.saldo.toString());
                        }

                        if (dados.cartoes && Array.isArray(dados.cartoes)) {
                            await AsyncStorage.setItem("cartoes", JSON.stringify(dados.cartoes));
                        }

                        // Recarrega os itens e cartões no contexto
                        await recarregarItens();
                        await reloadCartoes();

                        // Navega para outra tela e volta para forçar atualização
                        navigation.navigate("Início");

                        Toast.show({
                            type: "success",
                            text1: "Dados importados!",
                            text2: `${dados.itens.length} itens restaurados`,
                            position: "top",
                            visibilityTime: 3000,
                        });
                    } catch (error) {
                        console.error("Erro ao salvar dados:", error);
                        Toast.show({
                            type: "error",
                            text1: "Erro ao salvar dados",
                            text2: error.message,
                            position: "top",
                            visibilityTime: 3000,
                        });
                    } finally {
                        setLoading(false);
                    }
                },
                onHide: () => setLoading(false), // Se o usuário não interagir, apenas esconde e desativa o loading
            });
        } catch (error) {
            console.error("Erro ao importar:", error);
            Toast.show({
                type: "error",
                text1: "Erro ao importar dados",
                text2: error.message,
                position: "top",
                visibilityTime: 3000,
            });
            setLoading(false);
        }
    };

    const limparDados = () => {
        Toast.show({
            type: "error", 
            text1: "Limpar todos os dados?",
            text2: "Aperte novamente para excluir todos os seus dados permanentemente.",
            position: "top",
            visibilityTime: 4000,
            autoHide: false,
            onPress: async () => {
                Toast.hide(); 
                try {
                    await AsyncStorage.removeItem("itens");
                    await AsyncStorage.removeItem("@orbia:saldo");
                    await AsyncStorage.removeItem("cartoes");
                    await AsyncStorage.removeItem("cards_migrated_v1.0.1");
                    await recarregarItens();
                    await reloadCartoes();

                    Toast.show({
                        type: "success",
                        text1: "Dados limpos!",
                        text2: "Todos os dados foram apagados",
                        position: "top",
                        visibilityTime: 3000,
                    });
                    navigation.navigate("Início");
                } catch (error) {
                    console.error("Erro ao limpar dados:", error);
                    Toast.show({
                        type: "error",
                        text1: "Erro ao limpar dados",
                        text2: error.message,
                        position: "top",
                        visibilityTime: 3000,
                    });
                }
            },
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Backup de Dados</Text>   

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.text }]}
                        onPress={importarDados}
                        disabled={loading}
                    >
                        <MaterialIcons name="file-download" size={24} color={colors.background} />
                        <Text style={[styles.buttonText, { color: colors.background }]}>
                            Importar Dados
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.text, marginTop: 15}]}
                        onPress={exportarDados}
                        disabled={loading}
                    >
                        <MaterialIcons name="file-upload" size={24} color={colors.background} />
                        <Text style={[styles.buttonText, { color: colors.background }]}>
                            Exportar Dados
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Zona de Perigo</Text>

                    <TouchableOpacity
                        style={[styles.button, styles.dangerButton]}
                        onPress={limparDados}
                        disabled={loading}
                    >
                        <MaterialIcons name="delete-forever" size={24} color="#FFF" />
                        <Text style={[styles.buttonText, { color: "#FFF" }]}>
                            Limpar Todos os Dados
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.infoText, { color: colors.text, opacity: 0.6 }]}>
                        Orbia v1.0.1
                    </Text>
                    <Text style={[styles.infoText, { color: colors.text, opacity: 0.6 }]}>
                        by lucsdsm
                    </Text>
                </View>
            </View>
        </View>
    );
});

export default Settings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 30,
        marginTop: 20,
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    dangerButton: {
        backgroundColor: "#F44336",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    info: {
        marginTop: "auto",
        alignItems: "center",
        paddingBottom: 20,
    },
    infoText: {
        fontSize: 14,
        marginVertical: 2,
    },
});
