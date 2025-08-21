// =========================================================
// SCRIPT.JS - VERSÃO ATUALIZADA E CORRIGIDA
// =========================================================

// Importa todas as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // INICIALIZAÇÃO DO FIREBASE
    // =========================================================
    const firebaseConfig = {
        apiKey: "AIzaSyAn9EvaVb-GLvh4-60B4oKKQznuJteM_do",
        authDomain: "supremo-oriente-chat-45c03.firebaseapp.com",
        projectId: "supremo-oriente-chat-45c03",
        storageBucket: "supremo-oriente-chat-45c03.firebasestorage.app",
        messagingSenderId: "246020177422",
        appId: "1:246020177422:web:8108b666088f15b26c465f"
    };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const ordersRef = ref(database, 'pedidos');
    const messagesRef = ref(database, 'messages');
    // =========================================================
    // FIM DA INICIALIZAÇÃO
    // =========================================================

    // --- VARIÁVEIS DO DOM ---
    const secoes = document.querySelectorAll('.secao');
    const popupContainer = document.getElementById('popup-container');
    const closeBtn = document.querySelector('.close-btn');
    const popupLinks = document.querySelectorAll('.popup-link');
    const headerRotativo = document.querySelector('.header-rotativo');
    const headerHeight = headerRotativo ? headerRotativo.offsetHeight : 0;
    const btnTopo = document.getElementById('btn-topo');
    const searchInput = document.getElementById('searchInput');
    const buscaDestaque = document.getElementById('busca-destaque');

    // Carrinho e Modais
    const btnCarrinho = document.getElementById('btn-carrinho');
    const modalCarrinho = document.getElementById('modal-carrinho');
    const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
    const listaPedidoEl = document.getElementById('lista-pedido');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    const totalPedidoEl = document.getElementById('total-pedido');
    const btnFazerPedido = document.getElementById('btn-fazer-pedido');
    const modalConfirmacao = document.getElementById('modal-confirmacao');
    const fecharConfirmacaoBtn = document.getElementById('fechar-confirmacao');
    const okBtn = document.getElementById('ok-btn');

    // Referências para o modal de dados do cliente (para pedidos WhatsApp)
    const modalDadosCliente = document.getElementById('modal-dados-cliente');
    const fecharDadosClienteBtn = document.getElementById('fechar-dados-cliente');
    const formDadosCliente = document.getElementById('form-dados-cliente');
    
    // VARIÁVEIS AJUSTADAS PARA CORRESPONDER AO SEU HTML
    const nomeClienteInput = document.getElementById('nome-cliente');
    const enderecoClienteInput = document.getElementById('endereco-cliente');
    const telefoneClienteInput = document.getElementById('telefone-cliente');
    
    // Referências para o novo modal de escolha
    const modalEscolha = document.getElementById('modal-escolha');
    const fecharEscolhaBtn = document.getElementById('fechar-escolha');
    const btnEscolhaWpp = document.getElementById('btn-escolha-wpp');
    const btnEscolhaRestaurante = document.getElementById('btn-escolha-restaurante');

    // Checkbox de Retirada e Container do Endereço
    const retiradaCheckbox = document.getElementById('retirada-local');
    const enderecoContainer = document.getElementById('endereco-container');

    // Referência para o contêiner de mensagens do pedido no painel de admin
    const mensagensPedido = document.getElementById('mensagens-pedido');
    const resumoPedidoContainer = document.getElementById('resumo-pedido-container');

    // Variável global para armazenar temporariamente os dados do pedido
    let pedidoTemp = {};

    // --- VARIÁVEL QUE VAI ARMAZENAR O CARRINHO ---
    let carrinho = [];

    // --- LÓGICA DO CARDÁPIO (INICIA ABERTO) ---
    secoes.forEach(secao => {
        const sublista = secao.nextElementSibling;
        if (sublista && sublista.classList.contains('sublista')) {
            setTimeout(() => {
                sublista.classList.add('show');
                sublista.style.maxHeight = sublista.scrollHeight + 'px';
            }, 100);
            secao.addEventListener('click', () => {
                const isSublistaOpen = sublista.classList.contains('show');
                if (isSublistaOpen) {
                    sublista.style.maxHeight = '0px';
                    sublista.classList.remove('show');
                } else {
                    sublista.classList.add('show');
                    sublista.style.maxHeight = sublista.scrollHeight + 'px';
                }
            });
        }
    });

    // --- FUNÇÕES PARA SALVAR E CARREGAR DO LOCAL STORAGE ---
    function salvarCarrinho() {
        localStorage.setItem('carrinhoSalvo', JSON.stringify(carrinho));
    }

    function carregarCarrinho() {
        const carrinhoSalvo = localStorage.getItem('carrinhoSalvo');
        if (carrinhoSalvo) {
            carrinho = JSON.parse(carrinhoSalvo);
            atualizarCarrinho();
        }
    }

    // FUNÇÃO QUE ATUALIZA O CARRINHO
    function atualizarCarrinho() {
        listaPedidoEl.innerHTML = '';
        let total = 0;
        if (carrinho.length === 0) {
            listaPedidoEl.innerHTML = '<p>Seu pedido está vazio.</p>';
            contadorCarrinho.style.display = 'none';
            totalPedidoEl.textContent = 'Total: R$ 0,00';
            localStorage.removeItem('carrinhoSalvo');
        } else {
            carrinho.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.nome}</span>
                    <div class="item-info-carrinho">
                        <span>R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                        <button class="btn-remover" data-index="${index}">&times;</button>
                    </div>
                `;
                listaPedidoEl.appendChild(li);
                total += item.preco;
            });
            totalPedidoEl.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
            contadorCarrinho.textContent = carrinho.length;
            contadorCarrinho.style.display = 'flex';

            document.querySelectorAll('.btn-remover').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const indexParaRemover = parseInt(event.target.dataset.index);
                    carrinho.splice(indexParaRemover, 1);
                    salvarCarrinho();
                    atualizarCarrinho();
                });
            });
        }
    }

    // --- LÓGICA DE MODAIS E BOTÕES ---
    if (btnCarrinho) {
        btnCarrinho.addEventListener('click', () => {
            modalCarrinho.style.display = 'flex';
            atualizarCarrinho();
        });
    }

    if (fecharCarrinhoBtn) {
        fecharCarrinhoBtn.addEventListener('click', () => {
            modalCarrinho.style.display = 'none';
        });
    }

    // LÓGICA PARA FECHAR TODOS OS MODAIS AO CLICAR FORA
    window.addEventListener('click', (event) => {
        if (event.target === modalCarrinho) {
            modalCarrinho.style.display = 'none';
        }
        if (event.target === modalDadosCliente) {
            modalDadosCliente.style.display = 'none';
        }
        if (event.target === modalConfirmacao) {
            modalConfirmacao.style.display = 'none';
        }
        if (event.target === modalEscolha) {
            modalEscolha.style.display = 'none';
        }
    });

    if (fecharConfirmacaoBtn) {
        fecharConfirmacaoBtn.addEventListener('click', () => {
            modalConfirmacao.style.display = 'none';
        });
    }

    if (okBtn) {
        okBtn.addEventListener('click', () => {
            modalConfirmacao.style.display = 'none';
        });
    }
    
    // Evento para fechar o modal de escolha
    if(fecharEscolhaBtn) {
        fecharEscolhaBtn.addEventListener('click', () => {
            modalEscolha.style.display = 'none';
        });
    }

    // Evento para abrir o NOVO modal de escolha ao clicar em "Fazer Pedido"
    if (btnFazerPedido) {
        btnFazerPedido.addEventListener('click', () => {
            if (carrinho.length > 0) {
                // Esconde o modal do carrinho e mostra o modal de escolha
                modalCarrinho.style.display = 'none';
                modalEscolha.style.display = 'flex';
            } else {
                alert("Adicione itens ao seu pedido primeiro!");
            }
        });
    }

    // Evento para fechar o modal de dados do cliente
    if (fecharDadosClienteBtn) {
        fecharDadosClienteBtn.addEventListener('click', () => {
            modalDadosCliente.style.display = 'none';
        });
    }

    // LÓGICA DE MOSTRAR/OCULTAR CAMPO DE ENDEREÇO COM O CHECKBOX
    if (retiradaCheckbox && enderecoContainer) {
        retiradaCheckbox.addEventListener('change', () => {
            if (retiradaCheckbox.checked) {
                enderecoContainer.style.display = 'none';
            } else {
                enderecoContainer.style.display = 'flex';
            }
        });
    }

    // --- LÓGICA DOS BOTÕES DO NOVO MODAL DE ESCOLHA ---

    // Botão "Estou no Restaurante"
    if (btnEscolhaRestaurante) {
        btnEscolhaRestaurante.addEventListener('click', () => {
            if (carrinho.length === 0) {
                alert("O carrinho está vazio.");
                modalEscolha.style.display = 'none';
                return;
            }

            const dataPedido = new Date().toLocaleString('pt-BR');
            const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
            
            // Cria um pedido sem dados de cliente, com status "no local"
            const pedidoCompleto = {
                cliente: {
                    nome: 'Cliente no Local',
                    endereco: 'Retirada no Local',
                    telefone: 'N/A',
                    email: ''
                },
                itens: carrinho,
                total: `R$ ${total.toFixed(2).replace('.', ',')}`,
                data: dataPedido,
                status: 'pendente',
                finalizacao: 'estabelecimento'
            };

            // Envia para o Firebase
            push(ordersRef, pedidoCompleto)
                .then(() => {
                    modalEscolha.style.display = 'none';
                    
                    // Exibe o resumo do pedido na tela para o garçom
                    const resumoPedidoDiv = document.getElementById('resumo-pedido-container');
                    if (resumoPedidoDiv) {
                        const itensHtml = carrinho.map(item => `<li>${item.nome} - R$ ${item.preco.toFixed(2).replace('.', ',')}</li>`).join('');
                        resumoPedidoDiv.innerHTML = `
                            <h3 class="resumo-title">Resumo do Pedido</h3>
                            <p class="resumo-message">Mostre esta tela para o garçom.</p>
                            <h4>Itens:</h4>
                            <ul>${itensHtml}</ul>
                            <p class="resumo-total"><strong>Total:</strong> R$ ${total.toFixed(2).replace('.', ',')}</p>
                        `;
                        resumoPedidoDiv.style.display = 'block';
                    }

                    // Limpa o carrinho
                    carrinho = [];
                    localStorage.removeItem('carrinhoSalvo');
                    atualizarCarrinho();
                })
                .catch((error) => {
                    console.error("Erro ao enviar pedido: ", error);
                    alert("Ocorreu um erro ao enviar seu pedido. Tente novamente.");
                });
        });
    }

    // Botão "Enviar por WhatsApp"
    if (btnEscolhaWpp) {
        btnEscolhaWpp.addEventListener('click', () => {
            // Esconde o modal de escolha e mostra o modal de dados do cliente
            modalEscolha.style.display = 'none';
            modalDadosCliente.style.display = 'flex';
        });
    }

    // =========================================================
    // LÓGICA CORRIGIDA DO FORMULÁRIO DE DADOS DO CLIENTE
    // =========================================================
    if (formDadosCliente) {
        formDadosCliente.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = nomeClienteInput.value.trim();
            const telefone = telefoneClienteInput.value.trim();
            const isRetirada = retiradaCheckbox.checked;

            let endereco = 'Retirada no Local';
            if (!isRetirada) {
                endereco = enderecoClienteInput.value.trim();
            }
            
            // Validação dos campos obrigatórios
            if (!nome || !telefone || (!isRetirada && !endereco)) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }

            const dataPedido = new Date().toLocaleString('pt-BR');
            const cliente = { nome, endereco, telefone };
            
            // Constrói o pedido para o Firebase (sem total e email)
            const pedidoCompleto = {
                cliente: cliente,
                itens: carrinho,
                data: dataPedido,
                status: 'pendente',
                finalizacao: 'whatsapp'
            };

            // Constrói a mensagem do WhatsApp (sem total)
            const saudacao = `Olá, gostaria de fazer o meu pedido. Seguem os detalhes:\n\n`;
            const dadosCliente = `*Dados do Cliente:*\nNome: ${cliente.nome}\nEndereço: ${cliente.endereco}\nTelefone: ${cliente.telefone}\n\n`;
            // Formata a lista de itens para a mensagem do WhatsApp
            const itensPedido = `*Itens do Pedido:*\n${carrinho.map(item => `- ${item.nome}`).join('\n')}\n\n`;
            const mensagemFinal = `Obrigado!`;

            const mensagemCompleta = `${saudacao}${dadosCliente}${itensPedido}${mensagemFinal}`;
            const telefoneRestaurante = "5583988627070"; // SUBSTITUA PELO SEU NÚMERO DE TELEFONE
            const urlWhatsapp = `https://api.whatsapp.com/send?phone=${telefoneRestaurante}&text=${encodeURIComponent(mensagemCompleta)}`;

            // Envia o pedido para o Firebase
            push(ordersRef, pedidoCompleto)
                .then(() => {
                    modalDadosCliente.style.display = 'none';
                    modalConfirmacao.style.display = 'flex';

                    // Limpa o carrinho
                    carrinho = [];
                    localStorage.removeItem('carrinhoSalvo');
                    atualizarCarrinho();
                    
                    // Limpar os campos do formulário para o próximo uso
                    nomeClienteInput.value = '';
                    enderecoClienteInput.value = '';
                    telefoneClienteInput.value = '';
                    retiradaCheckbox.checked = false;
                    enderecoContainer.style.display = 'flex';

                    // Abre o WhatsApp em uma nova aba
                    window.open(urlWhatsapp, '_blank');
                })
                .catch((error) => {
                    console.error("Erro ao enviar pedido para o Firebase: ", error);
                    alert("Ocorreu um erro ao enviar seu pedido. Tente novamente.");
                });
        });
    }
    // =========================================================
    // FIM DA LÓGICA CORRIGIDA
    // =========================================================

    // --- LÓGICA DE ADICIONAR ITEM AO CARRINHO ---
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');
    if (botoesAdicionar.length > 0) {
        botoesAdicionar.forEach(btn => {
            btn.addEventListener('click', () => {
                const precoBtnContainer = btn.closest('.preco-btn-container');
                if (!precoBtnContainer) {
                    return;
                }
                const itemPai = precoBtnContainer.closest('li');
                const nomeItemPrincipal = itemPai.querySelector('.nome-item')?.textContent.trim() || itemPai.querySelector('.desc')?.textContent.trim();
                const descricaoPorcao = precoBtnContainer.querySelector('span:first-of-type')?.textContent.trim() || '';
                const precoTexto = precoBtnContainer.querySelector('.preco-valor').textContent;
                const precoNumerico = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim());
                
                let nomeCompleto = nomeItemPrincipal;
                if(descricaoPorcao) {
                    nomeCompleto += ` - ${descricaoPorcao}`;
                }
                carrinho.push({ nome: nomeCompleto, preco: precoNumerico });
                salvarCarrinho();
                atualizarCarrinho();
                btnCarrinho.style.display = 'flex';
            });
        });
    }

    // --- OUTRAS FUNÇÕES DO CÓDIGO ---
    function trocarLogoPorTema() {
        const logo = document.getElementById('logo');
        if (!logo) return;
        const temaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
        logo.src = temaEscuro ? '12.jpg' : '10.jpg';
    }

    trocarLogoPorTema();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', trocarLogoPorTema);

    const fundo = new Image();
    fundo.src = '11.jpg';
    fundo.onload = () => {
        document.body.classList.add('fundo-carregado');
    };

    if (btnTopo) {
        window.addEventListener('scroll', () => {
            btnTopo.style.display = window.scrollY > 200 ? 'block' : 'none';
            btnTopo.classList.toggle('show', window.scrollY > 200);
        });
        btnTopo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const headerLinks = document.querySelectorAll('.header-rotativo a');
    headerLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - headerHeight;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const termoBusca = this.value.toLowerCase().trim();
                const todosItens = document.querySelectorAll('.sublista li');
                const menuItens = document.querySelectorAll('.sublista');
                menuItens.forEach(sublista => {
                    sublista.classList.remove('show');
                    sublista.style.maxHeight = '0px';
                });
                secoes.forEach(secao => secao.style.display = 'block');
                todosItens.forEach(item => {
                    const nomeItemEl = item.querySelector('.nome-item');
                    const descItemEl = item.querySelector('.desc');
                    const nomeItem = nomeItemEl ? nomeItemEl.textContent.toLowerCase() : '';
                    const descItem = descItemEl ? descItemEl.textContent.toLowerCase() : '';
                    if (nomeItem.includes(termoBusca) || descItem.includes(termoBusca)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
                secoes.forEach(secao => {
                    const sublista = secao.nextElementSibling;
                    const itensVisiveis = sublista.querySelectorAll('li[style*="display: flex"]');
                    if (itensVisiveis.length > 0 && termoBusca !== '') {
                        sublista.classList.add('show');
                        setTimeout(() => {
                            sublista.style.maxHeight = sublista.scrollHeight + 'px';
                        }, 50);
                    } else if (termoBusca === '') {
                        sublista.classList.remove('show');
                        sublista.style.maxHeight = '0px';
                        secao.style.display = 'block';
                    }
                });

                let resultados = [];
                if (termoBusca.length > 0) {
                    todosItens.forEach((item, idx) => {
                        const nomeSpan = item.querySelector('.nome-item');
                        const nome = nomeSpan?.textContent.toLowerCase() || '';
                        if (nome.includes(termoBusca)) {
                            resultados.push(
                                `<li data-idx="${idx}">
                                    <div style="display:flex;justify-content:space-between;align-items:center;gap:20px;">
                                        <strong>${nomeSpan.textContent}</strong>
                                    </div>
                                </li>`
                            );
                        }
                    });
                }
                
                if (buscaDestaque) {
                    if (resultados.length > 0) {
                        buscaDestaque.innerHTML = `<ul>${resultados.join('')}</ul>`;
                        buscaDestaque.style.display = 'block';
                        buscaDestaque.querySelectorAll('li').forEach(li => {
                            li.addEventListener('click', function() {
                                const idx = this.getAttribute('data-idx');
                                const item = document.querySelectorAll('.sublista li')[idx];
                                if (item) {
                                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    item.style.background = '#f500003f';
                                    setTimeout(() => {
                                        item.style.background = '';
                                    }, 1500);
                                }
                                buscaDestaque.style.display = 'none';
                            });
                        });
                    } else {
                        buscaDestaque.style.display = 'none';
                    }
                }
                const msgBusca = document.getElementById('msgBusca');
                if (msgBusca) {
                    msgBusca.style.display = (resultados.length === 0 && termoBusca.length > 0) ? 'block' : 'none';
                }
            }, 200);
        });
        searchInput.addEventListener('blur', function() {
            setTimeout(() => {
                if (buscaDestaque) buscaDestaque.style.display = 'none';
            }, 200);
        });
    }

    const secoesComID = document.querySelectorAll('.secao[id]');
    const observerOptions = {
        root: null,
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: 0
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const secaoId = entry.target.id;
            const linkCorrespondente = document.querySelector(`.header-rotativo a[href="#${secaoId}"]`);
            if (linkCorrespondente) {
                if (entry.isIntersecting) {
                    linkCorrespondente.classList.add('link-ativo');
                } else {
                    linkCorrespondente.classList.remove('link-ativo');
                }
            }
        });
    }, observerOptions);
    secoesComID.forEach(secao => {
        observer.observe(secao);
    });
    
    // --- LÓGICA DO CHAT E ENVIO DE MENSAGENS ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatContainer = document.getElementById('chat-container');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    if (chatToggleBtn && chatContainer && chatCloseBtn && chatMessages && chatInput && chatSendBtn) {
        chatToggleBtn.addEventListener('click', () => {
            chatContainer.classList.toggle('hidden');
        });
        chatCloseBtn.addEventListener('click', () => {
            chatContainer.classList.add('hidden');
        });

        function sendMessage() {
            const messageText = chatInput.value.trim();
            if (messageText !== '') {
                const now = new Date();
                const timestamp = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                push(messagesRef, {
                    text: messageText,
                    timestamp: timestamp,
                    sender: 'user'
                });
                chatInput.value = '';
            }
        }
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        onValue(messagesRef, (snapshot) => {
            chatMessages.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                const messageElement = document.createElement('div');
                messageElement.classList.add('chat-message');
                messageElement.classList.add(message.sender === 'user' ? 'sent' : 'received');
                messageElement.innerHTML = `<p>${message.text}</p><span class="timestamp">${message.timestamp}</span>`;
                chatMessages.appendChild(messageElement);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
    
    // =========================================================
    // LÓGICA PERSONALIZADA DO PAINEL DE PEDIDOS RECEBIDOS
    // =========================================================
    if (mensagensPedido) {
        onValue(ordersRef, (snapshot) => {
            const pedidos = [];
            snapshot.forEach((childSnapshot) => {
                pedidos.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            mensagensPedido.innerHTML = '';
            
            if (pedidos.length === 0) {
                mensagensPedido.innerHTML = '<p class="msg-sem-pedidos">Nenhum pedido recebido ainda.</p>';
            } else {
                pedidos.reverse().forEach(pedido => {
                    const pedidoDiv = document.createElement('div');
                    pedidoDiv.classList.add('pedido-item');

                    const isWhatsapp = pedido.finalizacao === 'whatsapp';
                    const telefone = pedido.cliente.telefone;
                    const endereco = pedido.cliente.endereco;
                    
                    // Constrói a lista de itens do pedido
                    const listaItensHtml = pedido.itens.map(item => `
                        <li>${item.nome} <span class="item-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</span></li>
                    `).join('');

                    pedidoDiv.innerHTML = `
                        <div class="pedido-header">
                            <span class="pedido-total-valor">Total: ${pedido.total}</span>
                            <span class="pedido-data">${pedido.data}</span>
                        </div>
                        <div class="pedido-detalhes">
                            <p><strong>Cliente:</strong> ${pedido.cliente.nome}</p>
                            ${endereco ? `<p><strong>Endereço:</strong> ${endereco}</p>` : ''}
                            ${telefone ? `<p><strong>Telefone:</strong> ${telefone} ${isWhatsapp ? `<a href="https://api.whatsapp.com/send?phone=55${telefone}&text=Ol%C3%A1%20${pedido.cliente.nome}%2C%20recebemos%20seu%20pedido!" target="_blank" class="abrir-wpp-link">Abrir WhatsApp</a>` : ''}</p>` : ''}
                        </div>
                        <div class="pedido-lista-itens">
                            <p><strong>Itens:</strong></p>
                            <ul>
                                ${listaItensHtml}
                            </ul>
                        </div>
                        <button class="btn-pedido-pronto" data-id="${pedido.id}">Pronto</button>
                    `;
                    mensagensPedido.appendChild(pedidoDiv);
                });

                // Adiciona o evento de clique para os botões "Pronto"
                document.querySelectorAll('.btn-pedido-pronto').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const pedidoId = e.target.dataset.id;
                        const pedidoRef = ref(database, 'pedidos/' + pedidoId);
                        
                        // Atualiza o status para 'pronto' para acionar a Cloud Function
                        // Esta é a parte que se conecta com o seu código de e-mail!
                        push(pedidoRef, { status: 'pronto' })
                            .then(() => {
                                console.log("Status do pedido atualizado para 'pronto'!");
                            })
                            .catch((error) => {
                                console.error("Erro ao atualizar status do pedido: ", error);
                            });
                    });
                });
            }
        });
    }

    carregarCarrinho();
    atualizarCarrinho();
    
    console.log('%cDesenvolvido por faeldev-ux 🦊', 'color:#b30000;font-weight:bold;font-size:14px;');
});