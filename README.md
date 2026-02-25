# Portal Loterias - Simulador

Este é um projeto para simular e gerenciar jogos das loterias **Mega-Sena** e **Quina**. 

## Demonstração

Acesse a versão de demonstração do projeto hospedada no Cloudflare Pages:
[megase.pages.dev](https://megase.pages.dev)

## Como Rodar Localmente

1. **Instalar Dependências**:
   Abra o terminal na pasta do projeto e execute:
   ```bash
   npm install
   ```

2. **Rodar o Servidor**:
   ```bash
   npm start
   ```

3. **Acessar**:
   Abra o navegador em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

O projeto foi refatorado para ter uma arquitetura modular por loteria, facilitando a manutenção e organização:

- `public/index.html`: Portal principal para seleção de loteria.
- `public/pages/mega-sena.html`: Interface do simulador da Mega-Sena.
- `public/pages/quina.html`: Interface do simulador da Quina.
- `public/css/`: Diretório de arquivos de estilo (`style.css` e futuros arquivos modulares).
- `public/js/`: Diretório com a lógica de cada loteria (`mega-sena.js` e `quina.js`).
- `src/server.js`: Servidor Express simples que serve os arquivos estáticos e fornece um Proxy de API para evitar bloqueios de CORS.
- `package.json`: Definição do projeto e dependências.

## Notas Técnicas

- O projeto requer **Node.js 18+** ou superior para o funcionamento correto do `fetch` nativo no servidor.
- A API externa usada nativamente e pelo servidor proxy é fornecida por `loteriascaixa-api.herokuapp.com`. O proxy local evita erros de acessibilidade e CORS durante o desenvolvimento e produção.

## Licença e Uso

Este repositório tem fins estritamente **avaliativos e educacionais** (demonstração para portfólio). 
É **expressamente proibido o uso comercial** deste código ou da marca e propriedades pertencentes à Caixa Econômica Federal.
