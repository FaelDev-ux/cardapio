// =========================================================
// SCRIPT.JS - VERSÃO COMPLETA E CORRIGIDA COM FIREBASE
// =========================================================

// Importa todas as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

    // NOVO: Referências para o modal de dados do cliente
    const modalDadosCliente = document.getElementById('modal-dados-cliente');
    const fecharDadosClienteBtn = document.getElementById('fechar-dados-cliente');
    const formDadosCliente = document.getElementById('form-dados-cliente');
    const nomeClienteInput = document.getElementById('nome-cliente');
    const enderecoClienteInput = document.getElementById('endereco-cliente');
    const telefoneClienteInput = document.getElementById('telefone-cliente');

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

    // NOVO: Evento para abrir o modal de dados do cliente ao clicar em "Fazer Pedido"
    if (btnFazerPedido) {
        btnFazerPedido.addEventListener('click', () => {
            if (carrinho.length > 0) {
                modalCarrinho.style.display = 'none';
                modalDadosCliente.style.display = 'flex';
            } else {
                alert("Adicione itens ao seu pedido primeiro!");
            }
        });
    }
    
    // NOVO: Evento para fechar o modal de dados do cliente
    if (fecharDadosClienteBtn) {
        fecharDadosClienteBtn.addEventListener('click', () => {
            modalDadosCliente.style.display = 'none';
        });
    }

    // NOVO: Evento de submit do formulário para enviar o pedido completo
    if (formDadosCliente) {
        formDadosCliente.addEventListener('submit', (e) => {
            e.preventDefault();

            if (carrinho.length === 0) {
                alert("O carrinho está vazio. Adicione itens antes de enviar o pedido.");
                return;
            }

            const nomeCliente = nomeClienteInput.value;
            const enderecoCliente = enderecoClienteInput.value;
            const telefoneCliente = telefoneClienteInput.value;
            const dataPedido = new Date().toLocaleString('pt-BR');
            const total = carrinho.reduce((sum, item) => sum + item.preco, 0);

            const pedidoCompleto = {
                cliente: {
                    nome: nomeCliente,
                    endereco: enderecoCliente,
                    telefone: telefoneCliente
                },
                itens: carrinho,
                total: `R$ ${total.toFixed(2).replace('.', ',')}`,
                data: dataPedido,
                status: 'pendente'
            };

            push(ordersRef, pedidoCompleto)
                .then(() => {
                    modalDadosCliente.style.display = 'none';
                    modalConfirmacao.style.display = 'flex';

                    carrinho = [];
                    localStorage.removeItem('carrinhoSalvo');
                    atualizarCarrinho();
                    
                    // Opcional: Limpar os campos do formulário
                    nomeClienteInput.value = '';
                    enderecoClienteInput.value = '';
                    telefoneClienteInput.value = '';
                })
                .catch((error) => {
                    console.error("Erro ao enviar pedido: ", error);
                    alert("Ocorreu um erro ao enviar seu pedido. Tente novamente.");
                });
        });
    }
    
    // --- LÓGICA DE ADICIONAR ITEM AO CARRINHO ---
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');
    if (botoesAdicionar.length > 0) {
        console.log('Encontrei ' + botoesAdicionar.length + ' botões de adicionar. Adicionando eventos...');
        botoesAdicionar.forEach(btn => {
            btn.addEventListener('click', () => {
                const precoBtnContainer = btn.closest('.preco-btn-container');
                if (!precoBtnContainer) {
                    console.error('Botão de adicionar não está dentro de um .preco-btn-container. Verifique a estrutura HTML.');
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
                console.log('Item adicionado:', nomeCompleto);
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

    carregarCarrinho();
    atualizarCarrinho();
    
    console.log('%cDesenvolvido por faeldev-ux 🦊', 'color:#b30000;font-weight:bold;font-size:14px;');
});