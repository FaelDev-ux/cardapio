// =========================================================
// SCRIPT.JS - VERSÃO ATUALIZADA COM TAXA POR BAIRRO
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
    const sublistas = document.querySelectorAll('.sublista');
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
    const bairroClienteInput = document.getElementById('bairro-cliente'); // NOVO: Campo do bairro
    const complementoClienteInput = document.getElementById('complemento-cliente'); // NOVO: Campo do complemento
    const telefoneClienteInput = document.getElementById('telefone-cliente');
    
    // Referências para o novo modal de escolha
    const modalEscolha = document.getElementById('modal-escolha');
    const fecharEscolhaBtn = document.getElementById('fechar-escolha');
    const btnEscolhaWpp = document.getElementById('btn-escolha-wpp');
    const btnEscolhaRestaurante = document.getElementById('btn-escolha-restaurante');

    // Checkbox de Retirada e Container do Endereço
    const retiradaCheckbox = document.getElementById('retirada-local');
    const enderecoContainer = document.getElementById('endereco-completo-container');

    // Referência para o contêiner de mensagens do pedido no painel de admin
    const mensagensPedido = document.getElementById('mensagens-pedido');

    // NOVO: Variáveis para o modal do garçom
    const modalResumoGarcom = document.getElementById('modal-resumo-garcom');
    const fecharResumoGarcomBtn = document.getElementById('fechar-resumo-garcom');
    const resumoPedidoContainer = document.getElementById('resumo-pedido-container');
    const btnFinalizarGarcom = document.getElementById('btn-finalizar-garcom');

    // Variável global para armazenar temporariamente os dados do pedido
    let pedidoTemp = {};

    // --- VARIÁVEL QUE VAI ARMAZENAR O CARRINHO ---
    let carrinho = [];

    // MODIFICADO: Objeto com as taxas de entrega por bairro
    // ATENÇÃO: Os nomes dos bairros devem ser exatos e em letras minúsculas!
    const TAXAS_POR_BAIRRO = {
        'jaguaribe': 11.00,
        'aeroclube': 15.00,
        'agua fria': 8.00,
        'altiplano': 8.00,
        'anatolia': 9.50,
        'bairro das industrias': 20.00,
        'bairro dos estados': 12.00,
        'bairro dos ipes': 14.00,
        'bairro dos novais': 15.00,
        'bancarios': 6.00,
        'bessa': 15.00,
        'brisamar': 10.00,
        'cabo branco': 10.00,
        'castelo branco': 9.00,
        'centro': 12.00,
        'cidade dos colibris': 7.00,
        'colinas do sul': 17.00,
        'costa do sol': 9.00,
        'cristo': 11.00,
        'cruz das armas': 13.00,
        'cuia': 10.00,
        'expedicionarios': 10.00,
        'funcionarios 1': 13.00,
        'funcionarios 2': 12.00,
        'funcionarios 3': 12.00,
        'funcionarios 4': 12.00,
        'geisel': 11.00,
        'gramame': 15.00,
        'jardim cidade universitaria': 6.00,
        'jardim oceania': 15.00,
        'jardim são paulo': 7.00,
        'jardim sao paulo': 7.00,
        'jardim luna': 10.00,
        'joao agripino': 12.00,
        'jose americo': 8.00,
        'joao paulo': 13.00,
        'manaira': 14.00,
        'mandacaru': 8.00,
        'mangabeira': 8.00,
        'mangabeira 8': 9.00,
        'miramar': 9.00,
        'muçumagro': 15.00,
        'oitizeiro': 13.00,
        'padre ze': 13.00,
        'padre zé': 13.00,
        'pedro godin': 10.00,
        'penha': 10.00,
        'portal do sol': 8.00,
        'quadramares': 8.00,
        'rangel': 11.00,
        'roger': 13.00,
        'seixas': 10.00,
        'tambau': 11.00,
        'tambauzinho': 10.00,
        'tambia': 13.00,
        'torre': 10.00,
        'treze de maio': 12.00,
        'valentina': 6.00,
        // Adicione mais bairros e suas taxas aqui
    };
    
    const taxaEntregaEl = document.getElementById('taxa-entrega');

    // =========================================================
    // LÓGICA DO CARDÁPIO (CORRIGIDA)
    // =========================================================
    sublistas.forEach(sublista => {
        sublista.classList.add('show');
        sublista.style.maxHeight = sublista.scrollHeight + 'px';
    });

    secoes.forEach(secao => {
        const sublista = secao.nextElementSibling;
        if (sublista && sublista.classList.contains('sublista')) {
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
    
    // =========================================================
    // NOVO: LÓGICA DO MODAL DE OPÇÕES DO PRATO
    // =========================================================

    // Referências para os novos elementos do modal de prato
    const modalPrato = document.getElementById('modal-prato');
    const fecharPratoBtn = document.getElementById('fechar-prato');
    const pratoTituloEl = document.getElementById('prato-titulo');
    const pratoDescEl = document.getElementById('prato-descricao');
    const pratoTamanhosEl = document.getElementById('prato-tamanhos');
    const pratoObservacoesEl = document.getElementById('prato-observacoes');
    const btnAdicionarPrato = document.getElementById('btn-adicionar-prato');

    // Adicionamos a nova função para abrir o modal do prato
    function abrirModalPrato(nomePrato, descricaoPrato, precos, observacoesAnteriores = '') {
        pratoTituloEl.textContent = nomePrato;
        pratoDescEl.textContent = descricaoPrato;
        pratoObservacoesEl.value = observacoesAnteriores;
        pratoTamanhosEl.innerHTML = ''; // Limpa as opções anteriores

        // Preenche as opções de tamanho e preço
        precos.forEach(opcao => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'tamanho';
            radio.value = `${opcao.descricao}`;
            radio.dataset.preco = opcao.preco;
            radio.id = `tamanho-${opcao.descricao}`;
            
            const label = document.createElement('label');
            label.htmlFor = `tamanho-${opcao.descricao}`;
            label.innerHTML = `
                <span>${opcao.descricao}</span>
                <span class="preco-valor-popup">R$ ${opcao.preco.toFixed(2).replace('.', ',')}</span>
            `;
            
            const div = document.createElement('div');
            div.classList.add('opcao-tamanho');
            div.appendChild(radio);
            div.appendChild(label);
            pratoTamanhosEl.appendChild(div);
        });

        // Seleciona a primeira opção por padrão
        const primeiroTamanho = pratoTamanhosEl.querySelector('input[type="radio"]');
        if (primeiroTamanho) {
            primeiroTamanho.checked = true;
        }

        modalPrato.style.display = 'flex';
    }

    // Evento de clique no item do cardápio para abrir o modal
    // Esta é uma alternativa à lógica de botões 'btn-adicionar'
    const itensCardapio = document.querySelectorAll('.item-cardapio'); // Use uma classe em cada item do seu cardápio
    if (itensCardapio.length > 0) {
        itensCardapio.forEach(item => {
            item.addEventListener('click', () => {
                const nomeItem = item.querySelector('.nome-item').textContent.trim();
                const descItem = item.querySelector('.desc').textContent.trim();
                
                // Pega os preços e descrições diretamente do HTML do item
                const precosElement = item.querySelectorAll('.preco-btn-container');
                const precos = Array.from(precosElement).map(p => {
                    const desc = p.querySelector('span:first-of-type').textContent.trim();
                    const preco = parseFloat(p.querySelector('.preco-valor').textContent.replace('R$', '').replace(',', '.').trim());
                    return { descricao: desc, preco: preco };
                });
                
                // Abre o modal com os dados do prato
                abrirModalPrato(nomeItem, descItem, precos);
            });
        });
    }

    // Evento para fechar o modal do prato
    if (fecharPratoBtn) {
        fecharPratoBtn.addEventListener('click', () => {
            modalPrato.style.display = 'none';
        });
    }

    // Evento para adicionar o item ao carrinho a partir do modal
    if (btnAdicionarPrato) {
        btnAdicionarPrato.addEventListener('click', () => {
            const nomePrato = pratoTituloEl.textContent;
            const observacoes = pratoObservacoesEl.value.trim();
            const tamanhoSelecionado = pratoTamanhosEl.querySelector('input[name="tamanho"]:checked');

            if (tamanhoSelecionado) {
                const descricaoTamanho = tamanhoSelecionado.value;
                const precoTamanho = parseFloat(tamanhoSelecionado.dataset.preco);
                
                let nomeCompleto = `${nomePrato} (${descricaoTamanho})`;
                if (observacoes) {
                    nomeCompleto += ` - Obs: ${observacoes}`;
                }

                carrinho.push({ nome: nomeCompleto, preco: precoTamanho });
                salvarCarrinho();
                atualizarCarrinho();
                modalPrato.style.display = 'none';
                btnCarrinho.style.display = 'flex';
            } else {
                alert('Por favor, selecione um tamanho para o prato.');
            }
        });
    }

    // Adiciona o novo modal à lógica de fechar ao clicar fora
    window.addEventListener('click', (event) => {
        if (event.target === modalPrato) {
            modalPrato.style.display = 'none';
        }
        // ... sua lógica existente ...
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
        if (event.target === modalResumoGarcom) {
            modalResumoGarcom.style.display = 'none';
        }
    });

    // =========================================================
    // FIM DA NOVA LÓGICA
    // =========================================================

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

    // FUNÇÃO QUE ATUALIZA O CARRINHO (MODIFICADA)
    function atualizarCarrinho() {
        listaPedidoEl.innerHTML = '';
        let total = 0;
        let taxa = 0; // MODIFICADO: Variável para a taxa de entrega

        if (carrinho.length === 0) {
            listaPedidoEl.innerHTML = '<p>Seu pedido está vazio.</p>';
            contadorCarrinho.style.display = 'none';
            totalPedidoEl.textContent = 'Total: R$ 0,00';
            // NOVO: Esconde a linha da taxa se o carrinho estiver vazio
            if (taxaEntregaEl) taxaEntregaEl.style.display = 'none';
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

            // MODIFICADO: Lógica para pegar a taxa baseada no bairro
            const isRetirada = retiradaCheckbox.checked;
            if (!isRetirada && bairroClienteInput) {
                const bairroDigitado = bairroClienteInput.value.toLowerCase().trim();
                taxa = TAXAS_POR_BAIRRO[bairroDigitado] || 0; // Se o bairro não for encontrado, a taxa é 0
            }

            // MODIFICADO: Atualiza a exibição da taxa e do total
            if (taxaEntregaEl) {
                if (taxa > 0) {
                    taxaEntregaEl.innerHTML = `
                        <span>Taxa de Entrega:</span>
                        <span>R$ ${taxa.toFixed(2).replace('.', ',')}</span>
                    `;
                    taxaEntregaEl.style.display = 'flex';
                } else {
                    taxaEntregaEl.style.display = 'none';
                }
            }
            
            const totalFinal = total + taxa;

            totalPedidoEl.textContent = `Total: R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
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
    
    // NOVO: Eventos para fechar o modal do garçom
    if (fecharResumoGarcomBtn) {
        fecharResumoGarcomBtn.addEventListener('click', () => {
            modalResumoGarcom.style.display = 'none';
        });
    }
    if (btnFinalizarGarcom) {
        btnFinalizarGarcom.addEventListener('click', () => {
            modalResumoGarcom.style.display = 'none';
        });
    }

    // LÓGICA DE MOSTRAR/OCULTAR CAMPO DE ENDEREÇO COM O CHECKBOX (MODIFICADA)
    if (retiradaCheckbox && enderecoContainer && bairroClienteInput) {
        retiradaCheckbox.addEventListener('change', () => {
            if (retiradaCheckbox.checked) {
                enderecoContainer.style.display = 'none';
            } else {
                enderecoContainer.style.display = 'flex';
            }
            atualizarCarrinho();
        });
        
        // NOVO: Atualiza a taxa de entrega em tempo real enquanto o cliente digita o bairro
        bairroClienteInput.addEventListener('input', atualizarCarrinho);
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
                            <h4>Itens:</h4>
                            <ul>${itensHtml}</ul>
                            <p class="resumo-total"><strong>Total:</strong> R$ ${total.toFixed(2).replace('.', ',')}</p>
                        `;
                    }
                    // Exibe o novo modal do garçom
                    modalResumoGarcom.style.display = 'flex';

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
    // LÓGICA CORRIGIDA DO FORMULÁRIO DE DADOS DO CLIENTE (MODIFICADA)
    // =========================================================
    if (formDadosCliente) {
        formDadosCliente.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = nomeClienteInput.value.trim();
            const telefone = telefoneClienteInput.value.trim();
            const isRetirada = retiradaCheckbox.checked;
            const bairro = bairroClienteInput.value.trim(); // NOVO: Pega o valor do bairro
            const complemento = complementoClienteInput.value.trim(); // NOVO: Pega o valor do complemento

            let enderecoCompleto = 'Retirada no Local';
            if (!isRetirada) {
                const endereco = enderecoClienteInput.value.trim();
                enderecoCompleto = `${endereco}, ${bairro}${complemento ? `, ${complemento}` : ''}`; // MODIFICADO: Concatena o endereço
            }
            
            // Validação dos campos obrigatórios
            if (!nome || !telefone || (!isRetirada && (!enderecoClienteInput.value.trim() || !bairro))) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }

            const dataPedido = new Date().toLocaleString('pt-BR');
            const totalItens = carrinho.reduce((sum, item) => sum + item.preco, 0);

            // MODIFICADO: Define a taxa de entrega baseada no bairro
            let taxa = 0;
            if (!isRetirada) {
                const bairroLowerCase = bairro.toLowerCase();
                taxa = TAXAS_POR_BAIRRO[bairroLowerCase] || 0; // Se o bairro não for encontrado, a taxa é 0
            }
            const totalFinal = totalItens + taxa;
            
            const cliente = { nome, endereco: enderecoCompleto, telefone, bairro }; // NOVO: Adiciona o bairro ao objeto do cliente
            
            // Constrói o pedido para o Firebase (incluindo total para o painel de admin)
            const pedidoCompleto = {
                cliente: cliente,
                itens: carrinho,
                // NOVO: Envia o total final (com a taxa) para o Firebase
                total: `R$ ${totalFinal.toFixed(2).replace('.', ',')}`,
                taxaEntrega: taxa, // NOVO: Adiciona a taxa de entrega ao objeto do pedido
                data: dataPedido,
                status: 'pendente',
                finalizacao: 'whatsapp'
            };

            // Constrói a mensagem do WhatsApp (agora com total e taxa)
            const saudacao = `Olá, gostaria de fazer o meu pedido. Seguem os detalhes:\n\n`;
            const dadosCliente = `*Dados do Cliente:*\nNome: ${cliente.nome}\nEndereço: ${cliente.endereco}\nTelefone: ${cliente.telefone}\n\n`;
            const itensPedido = `*Itens do Pedido:*\n${carrinho.map(item => `- ${item.nome} (R$ ${item.preco.toFixed(2).replace('.', ',')})`).join('\n')}\n`;
            
            // NOVO: Adiciona a linha da taxa e o total final
            const resumoValores = `\nSubtotal: R$ ${totalItens.toFixed(2).replace('.', ',')}\nTaxa de Entrega: R$ ${taxa.toFixed(2).replace('.', ',')}\n\n*Total a pagar: R$ ${totalFinal.toFixed(2).replace('.', ',')}*\n`;
            const mensagemFinal = `\nObrigado!`;

            const mensagemCompleta = `${saudacao}${dadosCliente}${itensPedido}${resumoValores}${mensagemFinal}`;
            const telefoneRestaurante = "5583988627070";
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
                    bairroClienteInput.value = ''; // NOVO: Limpa o campo do bairro
                    complementoClienteInput.value = ''; // NOVO: Limpa o campo do complemento
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

    // --- REMOÇÃO DA LÓGICA DE ADICIONAR ITEM AO CARRINHO (AGORA USAMOS O POPUP) ---
    // A lógica anterior foi substituída pela função 'abrirModalPrato' e o evento do botão 'btnAdicionarPrato'

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

                    // NOVO: Verifica se há taxa de entrega para exibir
                    const taxaHtml = (pedido.taxaEntrega > 0) ? `<p class="pedido-taxa"><strong>Taxa de Entrega:</strong> R$ ${pedido.taxaEntrega.toFixed(2).replace('.', ',')}</p>` : '';

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
                        ${taxaHtml}
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
