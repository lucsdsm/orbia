# Orbia - Gerenciador de Finanças Pessoais 💰

Orbia é um aplicativo de finanças pessoais desenvolvido em React Native com Expo, pensado para Android. O app permite gerenciar despesas, receitas e visualizar o balanço financeiro de forma simples e intuitiva, com suporte a temas claro e escuro.

## 📱 Funcionalidades

- ✅ **Gestão de Receitas e Despesas** - Adicione, edite e remova transações financeiras
- ✅ **Saldo Personalizável** - Configure seu saldo inicial e veja atualizações em tempo real
- ✅ **Superávite do Mês** - Visualize automaticamente a diferença entre receitas e despesas
- ✅ **Previsão de Saldo** - Veja o saldo estimado para o próximo mês
- ✅ **Categorização de Despesas** - Organize despesas em fixas ou parceladas
- ✅ **Modo Claro/Escuro** - Alterne entre temas com um toque
- ✅ **Navegação Animada** - Transições suaves entre telas
- ✅ **Persistência de Dados** - Dados salvos localmente com AsyncStorage
- ✅ **Interface Intuitiva** - Design minimalista e responsivo

## 🛠️ Tecnologias Utilizadas

### Core
- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para facilitar o desenvolvimento e deploy
- **JavaScript (ES6+)** - Linguagem principal do projeto

### Navegação
- **@react-navigation/native** - Sistema de navegação
- **@react-navigation/stack** - Navegação em pilha com animações customizadas

### Armazenamento
- **@react-native-async-storage/async-storage** - Persistência de dados local (substituindo SQLite para maior simplicidade)

### UI/UX
- **react-native-toast-message** - Notificações e feedback visual
- **@expo/vector-icons** - Ícones do Material Design e Feather Icons
- **@react-native-picker/picker** - Seletor de opções

### Gerenciamento de Estado
- **React Hooks** (useState, useEffect, useCallback, useMemo)
- **Context API** - Para gerenciamento do tema global

## 📂 Estrutura do Projeto

```
orbia/
├── app/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Actions.js       # Menu de ações flutuante
│   │   ├── Balance.js       # Componente de saldo editável
│   │   ├── Footer.js        # Rodapé com navegação
│   │   ├── Header.js        # Cabeçalho do app
│   │   ├── Superavite.js    # Exibição do superávite
│   │   ├── NextBalance.js   # Previsão de saldo futuro
│   │   └── ThemeSwitcher.js # Alternador de tema
│   ├── screens/             # Telas do aplicativo
│   │   ├── ItemAdd.js       # Tela para adicionar receitas/despesas
│   │   ├── ItemList.js      # Listagem de itens
│   │   └── ItemEdit.js      # Edição de itens
│   ├── App.js               # Componente principal e navegação
│   └── ThemeContext.js      # Context para gerenciamento de tema
├── assets/                  # Imagens e recursos estáticos
├── package.json             # Dependências do projeto
└── README.md                # Documentação do projeto
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v14 ou superior)
- npm ou yarn
- Expo CLI
- Expo Go (app no celular) ou Android Studio

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/orbia.git
cd orbia
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Inicie o Expo**
```bash
npx expo start
```

4. **Execute no dispositivo**
- Escaneie o QR Code com o app Expo Go (Android)
- Ou pressione `a` para abrir no emulador Android

## 📱 Fluxo de Uso

1. **Tela Inicial**
   - Visualize seu saldo atual
   - Veja o superávite do mês (receitas - despesas)
   - Confira a previsão de saldo para o próximo mês

2. **Adicionar Transação**
   - Toque no botão `+` no rodapé
   - Escolha entre Receita ou Despesa
   - Preencha os detalhes (descrição, emoji, valor, etc.)
   - Para despesas: escolha entre Fixa ou Parcelada

3. **Gerenciar Saldo**
   - Toque no saldo atual para editá-lo
   - Digite o novo valor e confirme

4. **Alternar Tema**
   - Use o botão no rodapé para trocar entre modo claro e escuro

## 🎨 Componentes Principais

### Actions
Menu flutuante animado com opções para adicionar receitas e despesas.

### Balance
Componente editável que permite ao usuário definir seu saldo inicial/atual.

### Superavite
Calcula e exibe automaticamente a diferença entre receitas e despesas do mês.

### NextBalance
Mostra a previsão do saldo para o próximo mês (Saldo Atual + Superávite).

## 🎯 Próximas Funcionalidades

- [ ] Gráficos de gastos por categoria
- [ ] Relatórios mensais e anuais
- [ ] Metas de economia
- [ ] Notificações de vencimento de parcelas
- [ ] Exportação de dados (CSV/PDF)
- [ ] Backup em nuvem
- [ ] Múltiplas contas/carteiras
- [ ] Categorias personalizáveis

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal.

---

**Status:** 🚧 Em desenvolvimento ativo