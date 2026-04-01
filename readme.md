# Orbia 🪐

Aplicativo de controle financeiro pessoal minimalista e intuitivo, desenvolvido em React Native com Expo.

## ✨ Funcionalidades

### Gestão Financeira
- Adicionar, editar e remover **receitas** e **despesas**
- Categorizar despesas como **fixas** ou **parceladas**
- **Gerenciamento completo de cartões**: Criar, editar e excluir cartões personalizados
- Vincular despesas a **cartões de crédito** personalizados
- Definir **limite de crédito** para cada cartão
- Acompanhar progresso de **parcelas** com indicador visual
- Saldo editável com persistência automática

### Visualizações
- **Início**: Saldo, Superávite e Previsão de Saldo
- **Itens**: Lista completa de receitas e despesas com badges de cartão
- **Por Mês**: Agrupamento por mês/ano com totais e parcelas restantes
- **Por Cartão**: Agrupamento por cartão com barra de utilização de limite
- **Cartões**: Lista de cartões com visualização de limite utilizado
- **Configurações**: Backup, importação e gerenciamento de dados

## 🛠️ Tecnologias

- **React Native** + **Expo SDK 54**
- **AsyncStorage** - Persistência local de dados
- **React Navigation** - Navegação em tabs e stack
- **Context API** - Gerenciamento de estado global (Theme, Cartões, Itens)
- **Toast Messages** - Feedback visual de ações
- **Expo Vector Icons (Feather)** - Ícones modernos
- **React Native Picker** - Seleção de dados (substituído por CustomPicker)
- **Expo File System** - Importação/exportação de arquivos
- **React Native Reanimated** - Animações fluidas

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/lucsdsm/orbia.git
cd orbia/app

# Instale as dependências
npm install

# Inicie o app
npx expo start
```

## 📱 Como Usar

1. **Adicione seu saldo inicial** - Toque no saldo para editar
2. **Cadastre seus cartões** - Acesse o menu → Cartões → Adicionar
3. **Cadastre receitas/despesas** - Use os botões verde/vermelho no rodapé
4. **Vincule despesas parceladas** - Selecione o cartão ao criar uma despesa parcelada
5. **Acompanhe seus limites** - Veja barras de progresso em Cartões e Por Cartão
6. **Visualize por categorias** - Navegue entre as telas deslizando
7. **Faça backup** - Acesse Configurações → Exportar Dados
8. **Alterne o tema** - Toque no ícone sol/lua no cabeçalho


## 🎯 Cálculos Automáticos

- **Superávite**: Receitas - Despesas (do mês atual)
- **Próximo saldo**: Saldo Atual + Superávite
- **Parcelas restantes**: Cálculo dinâmico baseado na data de compra
- **Utilização de limite**: Percentual usado do limite do cartão (apenas parcelas futuras)
- **Totais por cartão**: Soma de parcelas restantes agrupadas por cartão
- **Totais por mês**: Soma de itens agrupados por período com parcelas ativas

<br>
<p align="center">
  Desenvolvido por <strong>lucsdsm</strong> <br>
  Versão: <strong>1.0.5</strong> 
</p>


 
