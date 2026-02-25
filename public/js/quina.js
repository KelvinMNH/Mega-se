document.addEventListener('DOMContentLoaded', () => {
    iniciarSimuladorQuina();
});

function iniciarSimuladorQuina() {
    // Estado (traduzido)
    window.configuracaoJogo = {
        quantidadeJogos: 3,
        quantidadeNumeros: 5,
        numeroMaximo: 80,
        apostaMinima: 5,
        apostaMaxima: 15,
        tipoJogo: 'quina'
    };

    let selecoesManuais = { 1: new Set(), 2: new Set(), 3: new Set() };
    let jogosAnulados = new Set();
    let estaAnimando = false;
    window.dadosConcursoAtual = null;

    // Elementos do DOM
    const containerCorpoAposta = document.getElementById('slipBody');
    const btnMenosJogo = document.getElementById('btnGameMinus');
    const btnMaisJogo = document.getElementById('btnGamePlus');
    const displayQuantidadeJogos = document.getElementById('gameQtyDisplay');
    const containerSeletorNumeros = document.getElementById('numSelectorParams');
    const btnSortear = document.getElementById('btnSimulate');
    const mensagemStatus = document.getElementById('statusMsg');
    const btnConcursoAnterior = document.getElementById('btnPrevContest');
    const btnProximoConcurso = document.getElementById('btnNextContest');

    // --- Inicialização ---
    document.body.className = 'theme-quina';
    inicializarBotoesDeNumeros();
    criarGradeDeJogos();
    atualizarInterfaceControles();
    atualizarInterfaceHistorico();
    buscarConcurso('latest');

    // --- Atribuição de Eventos ---
    btnMenosJogo.onclick = () => {
        if (!estaAnimando && window.configuracaoJogo.quantidadeJogos > 1) {
            window.configuracaoJogo.quantidadeJogos--;
            atualizarInterfaceControles();
        }
    };

    btnProximoConcurso.onclick = () => {
        if (window.dadosConcursoAtual && window.dadosConcursoAtual.numero) {
            buscarConcurso(window.dadosConcursoAtual.numero + 1);
        }
    };

    btnConcursoAnterior.onclick = () => {
        if (window.dadosConcursoAtual && window.dadosConcursoAtual.numero) {
            buscarConcurso(window.dadosConcursoAtual.numero - 1);
        }
    };

    btnMaisJogo.onclick = () => {
        if (!estaAnimando && window.configuracaoJogo.quantidadeJogos < 3) {
            window.configuracaoJogo.quantidadeJogos++;
            atualizarInterfaceControles();
        }
    };

    btnSortear.onclick = executarSimulacao;

    // --- Funções Principais ---

    function inicializarBotoesDeNumeros() {
        containerSeletorNumeros.innerHTML = '';
        for (let i = window.configuracaoJogo.apostaMinima; i <= window.configuracaoJogo.apostaMaxima; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn-num-select';
            btn.innerHTML = `[${String(i).padStart(2, '0')}]`;
            btn.onclick = () => {
                if (estaAnimando) return;
                window.configuracaoJogo.quantidadeNumeros = i;
                aplicarLimiteSelecaoManual();
                atualizarInterfaceControles();
            };
            containerSeletorNumeros.appendChild(btn);
        }
    }

    function criarGradeDeJogos() {
        containerCorpoAposta.innerHTML = '';
        for (let g = 1; g <= 3; g++) {
            const divJogo = document.createElement('div');
            divJogo.className = 'game-block';
            divJogo.id = `game-block-${g}`;

            const containerAmarelo = document.createElement('div');
            containerAmarelo.className = 'game-yellow-wrapper';

            const grade = document.createElement('div');
            grade.className = 'numbers-grid';
            grade.id = `grid-${g}`;

            for (let i = 1; i <= window.configuracaoJogo.numeroMaximo; i++) {
                const caixa = document.createElement('div');
                caixa.className = 'number-box';
                caixa.id = `g${g}-num-${i}`;
                caixa.innerHTML = `<span>[${String(i).padStart(2, '0')}]</span>`;
                caixa.onclick = () => alternarSelecaoManual(g, i);
                grade.appendChild(caixa);
            }
            containerAmarelo.appendChild(grade);

            // Linha de anulação
            const linhaAnular = document.createElement('div');
            linhaAnular.className = 'annul-row';

            const fraseAnular = document.createElement('div');
            fraseAnular.className = 'annul-phrase';
            fraseAnular.textContent = "Para anular este jogo, marque ao lado:";
            linhaAnular.appendChild(fraseAnular);

            const checkbox = document.createElement('div');
            checkbox.className = 'annul-checkbox';
            checkbox.id = `annul-check-${g}`;
            checkbox.innerHTML = `[ ]`;
            checkbox.onclick = () => alternarAnulacao(g);
            linhaAnular.appendChild(checkbox);

            containerAmarelo.appendChild(linhaAnular);
            divJogo.appendChild(containerAmarelo);
            containerCorpoAposta.appendChild(divJogo);
        }
    }

    function obterQuantidadeJogosAtivos() {
        let contagem = 0;
        for (let i = 1; i <= window.configuracaoJogo.quantidadeJogos; i++) {
            if (!jogosAnulados.has(i)) contagem++;
        }
        return contagem;
    }

    function atualizarInterfaceControles() {
        const qtdAtivos = obterQuantidadeJogosAtivos();
        displayQuantidadeJogos.textContent = qtdAtivos;

        const botoes = containerSeletorNumeros.children;
        for (let btn of botoes) {
            const valor = parseInt(btn.textContent.replace(/\D/g, ''));
            if (valor === window.configuracaoJogo.quantidadeNumeros) btn.classList.add('active');
            else btn.classList.remove('active');
        }

        for (let g = 1; g <= 3; g++) {
            const bloco = document.getElementById(`game-block-${g}`);
            const checkbox = document.getElementById(`annul-check-${g}`);
            const isActive = (g <= window.configuracaoJogo.quantidadeJogos) && !jogosAnulados.has(g);

            if (isActive) {
                bloco.classList.remove('annulled');
                if (checkbox) {
                    checkbox.classList.remove('checked');
                    checkbox.style.background = 'transparent';
                    checkbox.style.color = '#d63031';
                }
            } else {
                bloco.classList.add('annulled');
                limparGrade(g);
                if (checkbox) {
                    checkbox.classList.add('checked');
                    checkbox.style.background = '#d63031';
                    checkbox.style.color = 'white';
                }
            }
        }

        mensagemStatus.textContent = `${qtdAtivos} Jogo(s) com ${window.configuracaoJogo.quantidadeNumeros} números. Clique nos números para marcar.`;
    }

    function alternarAnulacao(idJogo) {
        if (estaAnimando) return;
        if (idJogo > window.configuracaoJogo.quantidadeJogos) return;

        if (jogosAnulados.has(idJogo)) {
            jogosAnulados.delete(idJogo);
        } else {
            jogosAnulados.add(idJogo);
        }
        atualizarInterfaceControles();
    }

    function alternarSelecaoManual(idJogo, numero) {
        if (estaAnimando) return;
        if (idJogo > window.configuracaoJogo.quantidadeJogos) return;

        const selecao = selecoesManuais[idJogo];
        const caixa = document.getElementById(`g${idJogo}-num-${numero}`);

        if (selecao.has(numero)) {
            selecao.delete(numero);
            caixa.classList.remove('selected');
        } else {
            if (selecao.size >= window.configuracaoJogo.quantidadeNumeros) {
                alert(`Você já selecionou ${window.configuracaoJogo.quantidadeNumeros} números para este jogo!`);
                return;
            }
            selecao.add(numero);
            caixa.classList.add('selected');
        }
    }

    function limparGrade(idJogo) {
        const grade = document.getElementById(`grid-${idJogo}`);
        if (grade) {
            grade.querySelectorAll('.number-box').forEach(el => el.classList.remove('marked', 'searching'));
        }
    }

    async function executarSimulacao() {
        if (estaAnimando) return;
        estaAnimando = true;
        btnSortear.disabled = true;
        mensagemStatus.style.color = 'var(--primary-color)';

        const cabecalhoAposta = document.querySelector('.slip-header');
        if (cabecalhoAposta) {
            cabecalhoAposta.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        for (let g = 1; g <= window.configuracaoJogo.quantidadeJogos; g++) limparGrade(g);

        const todosOsResultados = [];

        for (let g = 1; g <= window.configuracaoJogo.quantidadeJogos; g++) {
            if (jogosAnulados.has(g)) continue;

            mensagemStatus.textContent = `Sorteando JOGO ${g}...`;

            const conjuntoNumeros = Array.from({ length: window.configuracaoJogo.numeroMaximo }, (_, i) => i + 1);
            const escolhasAtuais = selecoesManuais[g];
            const vencedores = Array.from(escolhasAtuais);
            const numerosDisponiveis = conjuntoNumeros.filter(n => !escolhasAtuais.has(n));
            const necessarios = window.configuracaoJogo.quantidadeNumeros - vencedores.length;

            const novosSorteados = [];
            for (let i = 0; i < necessarios; i++) {
                const indiceSorteado = Math.floor(Math.random() * numerosDisponiveis.length);
                const numeroEscolhido = numerosDisponiveis.splice(indiceSorteado, 1)[0];
                novosSorteados.push(numeroEscolhido);
                vencedores.push(numeroEscolhido);
            }

            for (let n of novosSorteados) {
                await new Promise(r => setTimeout(r, 10)); // playRouletteEffect removido
                const elemento = document.getElementById(`g${g}-num-${n}`);
                elemento.classList.add('marked');
                await new Promise(r => setTimeout(r, 700));
            }

            if (necessarios === 0) {
                await new Promise(r => setTimeout(r, 500));
            }

            todosOsResultados.push({ game: g, numbers: vencedores.sort((a, b) => a - b) });
        }

        estaAnimando = false;
        btnSortear.disabled = false;
        mensagemStatus.textContent = "Sorteio Finalizado!";
        mensagemStatus.style.color = '#555';

        adicionarAoHistorico(todosOsResultados);
    }

    function aplicarLimiteSelecaoManual() {
        for (let g = 1; g <= 3; g++) {
            const selecao = selecoesManuais[g];
            if (selecao.size > window.configuracaoJogo.quantidadeNumeros) {
                const arrayNumeros = Array.from(selecao);
                const manter = arrayNumeros.slice(0, window.configuracaoJogo.quantidadeNumeros);
                const remover = arrayNumeros.slice(window.configuracaoJogo.quantidadeNumeros);

                selecoesManuais[g] = new Set(manter);

                remover.forEach(num => {
                    const el = document.getElementById(`g${g}-num-${num}`);
                    if (el) el.classList.remove('selected');
                });
            }
        }
    }

    function adicionarAoHistorico(resultados) {
        const historico = JSON.parse(localStorage.getItem('quina_history') || '[]');
        const novoItem = {
            id: historico.length > 0 ? historico[0].id + 1 : 1,
            date: new Date().toISOString(),
            games: resultados
        };
        historico.unshift(novoItem);
        if (historico.length > 50) historico.pop();
        localStorage.setItem('quina_history', JSON.stringify(historico));

        const numerosVencedores = window.dadosConcursoAtual ? window.dadosConcursoAtual.listaDezenas.map(d => parseInt(d)) : null;
        atualizarInterfaceHistorico(numerosVencedores);
    }

    window.limparHistorico = function () {
        localStorage.removeItem('quina_history');
        window.location.reload();
    };

    window.copiarItemHistorico = function (id, btn) {
        const historico = JSON.parse(localStorage.getItem('quina_history') || '[]');
        const item = historico.find(h => h.id === id);
        if (!item) return;

        let textoCopia = '';
        if (item.games) {
            item.games.forEach(g => {
                textoCopia += g.numbers.map(n => String(n).padStart(2, '0')).join(' ') + '\n';
            });
        }

        navigator.clipboard.writeText(textoCopia).then(() => {
            const original = btn.innerHTML;
            btn.innerHTML = 'Copiado!';
            btn.style.color = '#209869';
            btn.style.borderColor = '#209869';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.color = '#555';
                btn.style.borderColor = '#ddd';
            }, 1500);
        });
    };

    function atualizarInterfaceHistorico(compararCom = null) {
        const listaHistorico = document.getElementById('historyList');
        const historico = JSON.parse(localStorage.getItem('quina_history') || '[]');

        if (!listaHistorico) return;
        listaHistorico.innerHTML = '';

        if (historico.length === 0) {
            listaHistorico.innerHTML = '<li style="padding:20px; text-align:center; color:#999;">Histórico Vazio</li>';
            return;
        }

        historico.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';

            const ehAcerto = (n) => compararCom ? compararCom.includes(n) : false;

            let conteudoJogos = '';
            if (item.games) {
                item.games.forEach(g => {
                    let acertos = 0;
                    const dezenasBolhas = g.numbers.map(n => {
                        if (ehAcerto(n)) acertos++;
                        const classeAcerto = ehAcerto(n) ? 'match' : '';
                        return `<div class="mini-ball ${classeAcerto}">${String(n).padStart(2, '0')}</div>`;
                    }).join('');

                    const labelAcertos = acertos > 0 ? (
                        acertos === 2 ? `<span class="win-badge badge-quadra" style="background:#555;">DUQUE</span>` :
                            acertos === 3 ? `<span class="win-badge badge-quadra">TERNO</span>` :
                                acertos === 4 ? `<span class="win-badge badge-quina">QUADRA</span>` :
                                    acertos === 5 ? `<span class="win-badge badge-sena" style="background:linear-gradient(45deg, #8e44ad, #2980b9);">QUINA</span>` :
                                        `<span class="match-count" style="font-size:0.6em;color:#999;">${acertos} ACERTO(S)</span>`
                    ) : '';

                    conteudoJogos += `
                        <div class="h-game-row" style="display:flex; align-items:center;">
                            <span class="h-game-label">J${g.game}</span>
                            <div class="h-numbers" style="display:flex; gap:3px; flex-wrap:wrap;">${dezenasBolhas}</div>
                            ${labelAcertos}
                        </div>
                    `;
                });
            }

            li.innerHTML = `
                <div class="h-info" style="align-items:center;">
                    <div style="display:flex; flex-direction:column;">
                         <span class="h-id">SIMULAÇÃO #${item.id}</span>
                         <span style="font-size:0.9em;">${new Date(item.date).toLocaleString('pt-BR')}</span>
                    </div>
                    <button class="btn-copy-history" onclick="copiarItemHistorico(${item.id}, this)">Copiar</button>
                </div>
                <div class="h-games-list">
                    ${conteudoJogos}
                </div>
            `;
            listaHistorico.appendChild(li);
        });
    }

    async function buscarConcurso(concurso) {
        const label = document.getElementById('contestLabel');
        label.textContent = "Buscando...";

        const tentarFetch = async (url) => {
            try {
                const r = await fetch(url);
                if (r.ok) return await r.json();
            } catch (e) { console.log("Falha na url: " + url); }
            return null;
        };

        const normalizarDados = (d) => {
            if (!d.listaDezenas && d.dezenas) d.listaDezenas = d.dezenas;
            if (!d.numero && d.concurso) d.numero = d.concurso;
            if (d.acumulado !== undefined && d.acumulou === undefined) d.acumulou = d.acumulado;
            if (!d.premiacoes && d.listaRateioPremio) d.premiacoes = d.listaRateioPremio;
            if (!d.localGanhadores && d.listaMunicipioUFGanhadores) d.localGanhadores = d.listaMunicipioUFGanhadores;

            if (!d.valorEstimadoProximo && d.valorEstimadoProximoConcurso) d.valorEstimadoProximo = d.valorEstimadoProximoConcurso;
            if (!d.valorAcumuladoProximo && d.valorAcumuladoProximoConcurso) d.valorAcumuladoProximo = d.valorAcumuladoProximoConcurso;
            if (!d.valorAcumuladoEspecial && d.valorAcumuladoConcurso_0_5) d.valorAcumuladoEspecial = d.valorAcumuladoConcurso_0_5;

            return d;
        };

        const chaveCache = `quina_result_${concurso}`;
        const cacheSalvo = localStorage.getItem(chaveCache);

        if (cacheSalvo) {
            try {
                let parseado = JSON.parse(cacheSalvo);
                parseado = normalizarDados(parseado);

                if (concurso !== 'latest') {
                    console.log("Usando cache local para " + concurso);
                    window.dadosConcursoAtual = parseado;

                    if (!window.ultimoConcursoConhecido || parseado.numero > window.ultimoConcursoConhecido) {
                        window.ultimoConcursoConhecido = parseado.numero;
                    }

                    renderizarResultadosConcurso(parseado);
                    atualizarInterfaceHistorico(parseado.listaDezenas.map(n => parseInt(n)));
                    return;
                }
            } catch (e) { }
        }

        try {
            let dadosAPI = null;
            const isLatest = concurso === 'latest';

            const guidiUrl = `https://api.guidi.dev/loteria/quina/${isLatest ? 'ultimo' : concurso}`;
            let rawGuidi = await tentarFetch(guidiUrl);

            if (rawGuidi && (rawGuidi.numero || rawGuidi.concurso)) {
                dadosAPI = {
                    numero: rawGuidi.numero || rawGuidi.concurso,
                    dataSorteio: rawGuidi.data || rawGuidi.dataSorteio,
                    listaDezenas: rawGuidi.listaDezenas || rawGuidi.dezenas,
                    acumulou: rawGuidi.acumulado,
                    premiacoes: rawGuidi.listaRateioPremio || [],
                    localGanhadores: rawGuidi.listaMunicipioUFGanhadores || [],
                    valorAcumuladoProximo: rawGuidi.valorAcumuladoProximoConcurso || 0,
                    valorEstimadoProximo: rawGuidi.valorEstimadoProximoConcurso || 0
                };
            }

            if (!dadosAPI) {
                const herokuUrl = `https://loteriascaixa-api.herokuapp.com/api/quina/${isLatest ? 'latest' : concurso}`;
                let rawHeroku = await tentarFetch(herokuUrl);
                if (rawHeroku) dadosAPI = rawHeroku;
            }

            if (!dadosAPI) {
                let rawProxy = await tentarFetch(`/api/quina-proxy/${concurso}`);
                if (rawProxy) dadosAPI = rawProxy;

                if (!dadosAPI) {
                    rawProxy = await tentarFetch(`http://localhost:3000/api/quina-proxy/${concurso}`);
                    if (rawProxy) dadosAPI = rawProxy;
                }
            }

            if (!dadosAPI) throw new Error("Sem conexão com APIs");

            dadosAPI = normalizarDados(dadosAPI);

            if (!dadosAPI.numero || !dadosAPI.listaDezenas) {
                console.error("Dados inválidos recebidos:", dadosAPI);
                throw new Error("Dados inválidos");
            }

            localStorage.setItem(`quina_result_${dadosAPI.numero}`, JSON.stringify(dadosAPI));

            window.dadosConcursoAtual = dadosAPI;

            if (isLatest || !window.ultimoConcursoConhecido || dadosAPI.numero > window.ultimoConcursoConhecido) {
                window.ultimoConcursoConhecido = dadosAPI.numero;
            }

            renderizarResultadosConcurso(dadosAPI, isLatest);

            const numSorteados = dadosAPI.listaDezenas.map(n => parseInt(n));
            atualizarInterfaceHistorico(numSorteados);

        } catch (e) {
            console.error(e);
            label.innerHTML = `<span style="color:#d63031; font-size:0.8em;">Falha na Rede</span>`;
            setTimeout(() => {
                if (label.innerText.includes("Falha")) {
                    label.innerHTML = `<button onclick="buscarConcurso('${concurso}')" style="font-size:0.7em; cursor:pointer;">Tentar Novamente</button>`;
                }
            }, 2000);
        }
    }

    function renderizarResultadosConcurso(dadosExtras) {
        const label = document.getElementById('contestLabel');
        const dataDisplay = document.getElementById('contestDate');
        const containerBolas = document.getElementById('contestResults');
        const btnProximo = document.getElementById('btnNextContest');

        const emblemaAviso = document.getElementById('resStatusBadge');
        const valorPremio = document.getElementById('resPrize');
        const localizacaoVencedor = document.getElementById('resLocation');

        label.textContent = `CONCURSO ${dadosExtras.numero}`;
        dataDisplay.textContent = `DATA: ${dadosExtras.data || dadosExtras.dataSorteio || dadosExtras.data_apuracao || dadosExtras.dt_apuracao || '--/--/----'}`;

        const ocorreuAcumulo = dadosExtras.acumulou === true;
        emblemaAviso.style.display = 'inline-block';

        if (ocorreuAcumulo) {
            emblemaAviso.textContent = "ACUMULOU!";
            emblemaAviso.className = "status-badge status-accumulated";
        } else {
            emblemaAviso.textContent = "PREMIO SAIU!";
            emblemaAviso.className = "status-badge status-won";
        }

        let premioEmDinheiro = 0;
        const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

        if (ocorreuAcumulo) {
            premioEmDinheiro = dadosExtras.valorEstimadoProximo || dadosExtras.valorAcumuladoProximo || dadosExtras.valorAcumuladoEspecial || 0;
            valorPremio.textContent = "Estimativa: " + formatarMoeda(premioEmDinheiro);
            localizacaoVencedor.textContent = "";
        } else {
            let ganhadorQuina = null;
            if (dadosExtras.premiacoes && Array.isArray(dadosExtras.premiacoes)) {
                ganhadorQuina = dadosExtras.premiacoes.find(p => p.faixa === 'Quina' || p.descricao?.toLowerCase().includes('quina') || p.faixa === 1);
            }

            if (ganhadorQuina) {
                premioEmDinheiro = ganhadorQuina.valorPremio;
                valorPremio.textContent = formatarMoeda(premioEmDinheiro);

                if (dadosExtras.localGanhadores && dadosExtras.localGanhadores.length > 0) {
                    const l = dadosExtras.localGanhadores.map(local => `${local.municipio}/${local.uf}`).join(', ');
                    localizacaoVencedor.textContent = "Ganhadores: " + l;
                } else {
                    localizacaoVencedor.textContent = "Ganhador(es) não divulgado(s)";
                }
            } else {
                valorPremio.textContent = "Verificar Site Oficial";
                localizacaoVencedor.textContent = "";
            }
        }

        if (window.ultimoConcursoConhecido && dadosExtras.numero >= window.ultimoConcursoConhecido) {
            btnProximo.disabled = true;
            btnProximo.style.opacity = "0.3";
            btnProximo.style.cursor = "default";
        } else {
            btnProximo.disabled = false;
            btnProximo.style.opacity = "1";
            btnProximo.style.cursor = "pointer";
        }

        containerBolas.innerHTML = '';
        dadosExtras.listaDezenas.forEach(d => {
            const bola = document.createElement('div');
            bola.className = 'result-ball';
            bola.textContent = d;
            containerBolas.appendChild(bola);
        });
    }

    // Exporta chamada de API para botões no HTML
    window.buscarConcurso = buscarConcurso;
}
