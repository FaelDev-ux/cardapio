document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DO CARDÁPIO (INICIA ABERTO) ---
    const secoes = document.querySelectorAll('.secao');

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
                    document.querySelectorAll('.sublista.show').forEach(openSublist => {
                        openSublist.style.maxHeight = '0px';
                        openSublist.classList.remove('show');
                    });
                    
                    sublista.classList.add('show');
                    sublista.style.maxHeight = sublista.scrollHeight + 'px';
                }
            });
        }
    });

    // --- LÓGICA DO POP-UP ---

    const popupContainer = document.getElementById('popup-container');
    const closeBtn = document.querySelector('.close-btn');
    const popupLinks = document.querySelectorAll('.popup-link');
    const headerRotativo = document.querySelector('.header-rotativo');
    const headerHeight = headerRotativo ? headerRotativo.offsetHeight : 0;

    setTimeout(() => {
        if (popupContainer) {
            popupContainer.style.display = 'flex';
        }
    }, 1000);

    function closePopup() {
        if (popupContainer) {
            popupContainer.classList.add('popup-hide');
            setTimeout(() => {
                popupContainer.style.display = 'none';
                popupContainer.classList.remove('popup-hide');
            }, 500);
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    if (popupLinks.length > 0) {
        popupLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                closePopup();
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
    }

    window.addEventListener('click', (e) => {
        if (e.target === popupContainer) {
            closePopup();
        }
    });


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

    const btnTopo = document.getElementById('btn-topo');
    if (btnTopo) {
        window.addEventListener('scroll', () => {
            btnTopo.style.display = window.scrollY > 200 ? 'block' : 'none';
            btnTopo.classList.toggle('show', window.scrollY > 200);
        });
        btnTopo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- LÓGICA DO CABEÇALHO ROTATIVO ---
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

    const searchInput = document.getElementById('searchInput');
    const buscaDestaque = document.getElementById('busca-destaque');
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
                    const nomeItem = item.querySelector('.nome-item').textContent.toLowerCase();
                    const descItem = item.querySelector('.desc') ? item.querySelector('.desc').textContent.toLowerCase() : '';

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

    // --- LÓGICA DE DESTAQUE DA SEÇÃO ATIVA ---

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
    
    // --- LÓGICA DO CARRINHO SIMPLES ---
    const btnCarrinho = document.getElementById('btn-carrinho');
    const modalCarrinho = document.getElementById('modal-carrinho');
    const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
    const listaPedidoEl = document.getElementById('lista-pedido');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    const totalPedidoEl = document.getElementById('total-pedido');
    const btnFazerPedido = document.getElementById('btn-fazer-pedido');

    // Novos elementos do pop-up de opções
    const modalOpcoesPedido = document.getElementById('modal-opcoes-pedido');
    const btnGarcom = document.getElementById('btn-garcom');
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const btnCancelar = document.getElementById('btn-cancelar');
    const numeroWhatsApp = '5583988627070';

    let carrinho = [];

    function atualizarCarrinho() {
        listaPedidoEl.innerHTML = '';
        let total = 0;
        if (carrinho.length === 0) {
            listaPedidoEl.innerHTML = '<p>Seu pedido está vazio.</p>';
            contadorCarrinho.style.display = 'none';
            totalPedidoEl.textContent = 'Total: R$ 0,00';
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
                    atualizarCarrinho();
                });
            });
        }
    }

    btnCarrinho.addEventListener('click', () => {
        modalCarrinho.style.display = 'flex';
        atualizarCarrinho();
    });

    fecharCarrinhoBtn.addEventListener('click', () => {
        modalCarrinho.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalCarrinho) {
            modalCarrinho.style.display = 'none';
        }
    });

    // -------- LÓGICA ATUALIZADA PARA ADICIONAR AO CARRINHO --------
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

                // Pega o nome do item principal
                const itemPai = precoBtnContainer.closest('li');
                const nomeItemPrincipal = itemPai.querySelector('.nome-item').textContent.trim();
                
                // Pega a descrição da porção e o preço do botão clicado
                const descricaoPorcao = precoBtnContainer.querySelector('span:first-of-type').textContent.trim();
                const precoTexto = precoBtnContainer.querySelector('.preco-valor').textContent;
                
                // Formata o preço para um número
                const precoNumerico = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim());

                // Combina o nome do item com a descrição da porção
                const nomeCompleto = `${nomeItemPrincipal} - ${descricaoPorcao}`;
        
                carrinho.push({ nome: nomeCompleto, preco: precoNumerico });
                atualizarCarrinho();
                btnCarrinho.style.display = 'flex';
                console.log('Item adicionado:', nomeCompleto);
            });
        });
    } else {
        console.log('Nenhum botão de adicionar encontrado. Verifique se a classe .btn-adicionar está correta.');
    }
    // -------- FIM DA LÓGICA ATUALIZADA --------
    
    // Lógica para o botão "Fazer Pedido"
    btnFazerPedido.addEventListener('click', () => {
        if (carrinho.length > 0) {
            modalOpcoesPedido.style.display = 'flex';
            modalCarrinho.style.display = 'none';
        } else {
            alert("Adicione itens ao seu pedido primeiro!");
        }
    });
    
    // Evento para o botão "Estou no restaurante"
    btnGarcom.addEventListener('click', () => {
        modalOpcoesPedido.style.display = 'none';
        const pedidoCompleto = listaPedidoEl.cloneNode(true);
        const totalCompleto = totalPedidoEl.cloneNode(true);
        const visualizacaoPedido = document.createElement('div');
        visualizacaoPedido.classList.add('visualizacao-pedido');
        const fecharVisualizacao = document.createElement('span');
        fecharVisualizacao.textContent = '×';
        fecharVisualizacao.classList.add('fechar');
        fecharVisualizacao.addEventListener('click', () => {
            visualizacaoPedido.remove();
            carrinho = [];
            atualizarCarrinho();
        });
        visualizacaoPedido.innerHTML = `
            <h2>Seu Pedido</h2>
        `;
        visualizacaoPedido.appendChild(pedidoCompleto);
        visualizacaoPedido.appendChild(totalCompleto);
        visualizacaoPedido.appendChild(fecharVisualizacao);
        document.body.appendChild(visualizacaoPedido);
        visualizacaoPedido.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Evento para o botão "Pedido para entrega (WhatsApp)"
    btnWhatsapp.addEventListener('click', () => {
        modalOpcoesPedido.style.display = 'none';
        let mensagem = 'Olá, gostaria de fazer o seguinte pedido:\n\n';
        let total = 0;
        carrinho.forEach(item => {
            mensagem += `- ${item.nome} (R$ ${item.preco.toFixed(2).replace('.', ',')})\n`;
            total += item.preco;
        });
        mensagem += `\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
        carrinho = [];
        atualizarCarrinho();
    });

    // Evento para o botão "Cancelar"
    btnCancelar.addEventListener('click', () => {
        modalOpcoesPedido.style.display = 'none';
    });

    btnCarrinho.style.display = 'none';
    atualizarCarrinho();
    
    console.log('%cDesenvolvido por faeldev-ux 🦊', 'color:#b30000;font-weight:bold;font-size:14px;');
});