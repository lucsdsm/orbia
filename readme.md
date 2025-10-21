# Orbia 🪐

Aplicativo de controle financeiro pessoal minimalista e intuitivo, desenvolvido em React Native com Expo.

<p align="center">
  <img src="https://imgur.com/JFTlHYV.png" alt="Orbia App" />
</p>

## ✨ Funcionalidades

### Gestão Financeira
- ✅ Adicionar, editar e remover **receitas** e **despesas**
- ✅ Categorizar despesas como **fixas** ou **parceladas**
- ✅ Vincular despesas a **cartões de crédito** (Nubank, Inter)
- ✅ Acompanhar progresso de **parcelas**
- ✅ Saldo editável com persistência automática

### Visualizações
- ✅ **Início**: Saldo, Superávite e Previsão de Saldo
- ✅ **Itens**: Lista completa de receitas e despesas
- ✅ **Por Mês**: Agrupamento por mês/ano com totais
- ✅ **Por Cartão**: Agrupamento por cartão com totais por categoria
- ✅ **Configurações**: Backup, importação e gerenciamento de dados

### Recursos Avançados
- ✅ **Temas**: Modo claro e escuro com persistência
- ✅ **Backup/Restauração**: Exportar e importar dados em JSON
- ✅ **Navegação fluida**: Swipe entre telas com indicador animado
- ✅ **Tela de Loading**: Animação personalizada no carregamento
- ✅ **Performance otimizada**: Lazy loading, memoization e FlatList otimizado

## Tecnologias

- **React Native** + **Expo SDK 54**
- **AsyncStorage** - Persistência local
- **React Navigation** - Navegação em tabs e stack
- **Context API** - Gerenciamento de estado global
- **Toast Messages** - Feedback visual
- **Expo File System** - Importação/exportação de arquivos

## Próximas etapas

- **Adição de cartões personalizados**
- **Modais personalizados**
- **...**

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
2. **Cadastre receitas/despesas** - Use os botões verde/vermelho no rodapé
3. **Visualize por categorias** - Navegue entre as telas deslizando
4. **Faça backup** - Acesse Configurações → Exportar Dados
5. **Alterne o tema** - Toque no ícone sol/lua

## 🏗️ Estrutura

```
app/
├── components/       # Componentes reutilizáveis
│   ├── Header.js
│   ├── Footer.js
│   ├── Balance.js
│   ├── Superavite.js
│   ├── NextBalance.js
│   ├── ParcelProgress.js
│   ├── Navigator.js
│   ├── Indicator.js
│   └── LoadingScreen.js
├── screens/          # Telas principais
│   ├── Home.js
│   ├── ItemList.js
│   ├── ItemByMonth.js
│   ├── ItemByCard.js
│   ├── ItemAdd.js
│   ├── ItemEdit.js
│   └── Settings.js
├── services/         # Lógica de negócio
│   └── storage.js
├── constants/        # Constantes (cartões, meses)
│   └── index.js
├── ThemeContext.js   # Gerenciamento de tema
└── ItensContext.js   # Gerenciamento de itens
```

## 🎯 Cálculos Automáticos

- **Superávite**: Receitas - Despesas (do mês atual)
- **Próximo saldo**: Saldo Atual + Superávite
- **Totais por cartão**: Soma de despesas agrupadas
- **Totais por mês**: Soma de itens por período

## 🔧 Build APK Otimizado

```bash
eas build --platform android --profile production
```

**Otimizações aplicadas:**
- ProGuard habilitado
- Shrink Resources
- Minificação avançada (Metro)
- Dead code elimination

---

## Licença

```
Este projeto está licenciado sob a Licença MIT.

Copyright (c) 2025 Lucas Eduardo dos Santos Machado

A permissão é concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia deste software e dos arquivos de documentação associados (o "Software"), para negociar o Software sem restrições, incluindo, sem limitação, os direitos de usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender cópias do Software, e para permitir que as pessoas a quem o Software é fornecido o façam, sob as seguintes condições:

O aviso de direitos autorais acima e este aviso de permissão devem ser incluídos em todas as cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM DETERMINADO FIM E NÃO VIOLAÇÃO. EM NENHUMA CIRCUNSTÂNCIA, OS AUTORES OU TITULARES DE DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO, DANOS OU OUTRA RESPONSABILIDADE, SEJA EM UMA AÇÃO DE CONTRATO, DELITO OU DE OUTRA FORMA, DECORRENTE DE, FORA DE OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTRAS NEGOCIAÇÕES NO SOFTWARE.
```
<br>
<p align="center">
  Autor: lucsdsm <br>
  Versão: 1.0.0 
</p>


 
