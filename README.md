# Simulador Mega Sena

Este é um projeto isolado para o Simulador e Verificador da Mega Sena.

## Como Rodar

1. **Instalar Dependências**:
   Abra o terminal na pasta deste projeto (`mega-sena-isolado`) e execute:
   ```bash
   npm install
   ```

2. **Rodar o Servidor**:
   ```bash
   npm start
   ```

3. **Acessar**:
   Abra o navegador em [http://localhost:3000](http://localhost:3000)

## Estrutura

- `public/index.html`: O front-end da aplicação (antigo mega.html).
- `public/style.css`: Estilos globais.
- `server.js`: Servidor Express simples que serve os arquivos e fornece o Proxy de API.
- `package.json`: Definição do projeto e dependências.

## Notas

- O projeto requer **Node.js 18+** para o funcionamento correto do `fetch` nativo no servidor.
- A API externa usada é a `loteriascaixa-api.herokuapp.com`.
