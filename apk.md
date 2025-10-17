# Guia de Otimização do APK

## 🚀 Como Fazer o Build

### Opção 1: APK Otimizado (Recomendado para testes)
```bash
eas build --platform android --profile production
```

### Opção 2: AAB para Google Play Store
```bash
eas build --platform android --profile production-aab
```

### Opção 3: Preview (teste rápido)
```bash
eas build --platform android --profile preview
```

## 💡 Dicas Adicionais

### 1. Otimize as imagens (se houver)
```bash
# Instale o pacote de otimização de imagens
npm install --save-dev imagemin imagemin-pngquant imagemin-mozjpeg

# Use ferramentas online como TinyPNG para reduzir assets
```

### 2. Analise o bundle
```bash
# Para ver o que está ocupando espaço
npx react-native-bundle-visualizer
```

### 3. Remova dependências não utilizadas
```bash
# Verifique pacotes não utilizados
npm install -g depcheck
depcheck
```