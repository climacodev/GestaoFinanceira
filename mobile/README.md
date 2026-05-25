# Contable - Aplicativo Mobile (Expo)

Esta é a pasta do aplicativo mobile híbrido do **Contable**, construído com **React Native** e **Expo**.

---

## 📱 Como Testar no seu Tablet ou Celular (Android / iOS)

### Passo 1: Instalar o Expo Go no seu Tablet/Celular
1. Abra a loja de aplicativos no seu dispositivo (Google Play Store no Android ou App Store no iPad/iPhone).
2. Procure por **Expo Go** e instale-o.

### Passo 2: Instalar as Dependências no Computador
Abra o terminal na pasta `mobile` (esta pasta) e instale os pacotes necessários:
```bash
npm install
```

### Passo 3: Iniciar o Aplicativo
Execute o comando para iniciar o servidor local do Expo:
```bash
npm run start
```

### Passo 4: Conectar e Rodar no Tablet
* Certifique-se de que o **computador** e o **tablet** estejam conectados na **mesma rede Wi-Fi**.
* **No Android:** Abra o aplicativo **Expo Go**, clique em *"Scan QR Code"* e escaneie o código QR gerado no terminal do computador.
* **No iPad/iOS:** Abra o aplicativo nativo da **Câmera**, escaneie o código QR e toque no link de notificação que aparece para abri-lo no **Expo Go**.

---

## 💡 Dicas e Resolução de Problemas

### 1. Erro de Conexão (Network Connection Error)
Se o app travar em "Connecting..." ou der erro de rede ao tentar carregar no tablet:
* Verifique se o tablet e o computador estão de fato conectados à mesma rede Wi-Fi (ex: redes corporativas ou públicas às vezes bloqueiam essa comunicação).
* Caso o problema persista, você pode iniciar o servidor no modo `tunnel` executando:
  ```bash
  npx expo start --tunnel
  ```
  *(O modo tunnel cria um endereço público na internet para o seu servidor local, contornando bloqueios de rede local do Wi-Fi)*.

### 2. Rodar no Simulador do Computador
Caso queira testar diretamente na tela do seu computador:
* Pressione `w` no terminal para abrir a versão Web do app no navegador.
