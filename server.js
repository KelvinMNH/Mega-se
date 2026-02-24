const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Habilitar CORS para todas as requisições
app.use(cors());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota de Proxy para a API (Mega Sena e Quina)
// Necessária para evitar problemas de HTTPS/CORS no navegador cliente
app.get('/api/:gameType-proxy/:concurso', async (req, res) => {
    const { gameType, concurso } = req.params;
    try {
        // Se for 'latest', busca o último. Se for número, busca específico.
        const suffix = concurso === 'latest' ? 'latest' : concurso;
        const targetUrl = `https://loteriascaixa-api.herokuapp.com/api/${gameType}/${suffix}`;

        console.log(`[Proxy - ${gameType.toUpperCase()}] Redirecionando requisição para: ${targetUrl}`);

        // fetch nativo do Node.js 18+
        const response = await fetch(targetUrl);

        if (!response.ok) {
            console.error(`Status Inválido da API Externa: ${response.status}`);
            return res.status(response.status).json({ error: "Falha na API externa" });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Erro interno no Proxy:", error);
        res.status(500).json({ error: "Erro interno do servidor ao buscar resultados" });
    }
});

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 Simulador de Loterias (Mega/Quina) Rodando!`);
    console.log(`👉 Acesso local: http://localhost:${PORT}`);
    console.log(`=============================================`);
});
