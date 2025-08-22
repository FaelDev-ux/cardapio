// Importa todas as funções necessárias do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js'

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================
  // INICIALIZAÇÃO DO FIREBASE
  // =========================================================
  const firebaseConfig = {
    apiKey: 'AIzaSyAn9EvaVb-GLvh4-60B4oKKQznuJteM_do',
    authDomain: 'supremo-oriente-chat-45c03.firebaseapp.com',
    projectId: 'supremo-oriente-chat-45c03',
    storageBucket: 'supremo-oriente-chat-45c03.firebase-app.com',
    messagingSenderId: '246020177422',
    appId: '1:246020177422:web:8108b666088f15b26c465f'
  }

  const app = initializeApp(firebaseConfig)
  const database = getDatabase(app)
  const ordersRef = ref(database, 'pedidos')
  const messagesRef = ref(database, 'messages')
  // =========================================================
  // FIM DA INICIALIZAÇÃO
  // =========================================================

  // --- VARIÁVEIS DO DOM ---
  const secoes = document.querySelectorAll('.secao')
  const sublistas = document.querySelectorAll('.sublista')
  const popupContainer = document.getElementById('popup-container')
  const closeBtn = document.querySelector('.close-btn')
  const popupLinks = document.querySelectorAll('.popup-link')
  const headerRotativo = document.querySelector('.header-rotativo')
  const headerHeight = headerRotativo ? headerRotativo.offsetHeight : 0
  const btnTopo = document.getElementById('btn-topo')
  const searchInput = document.getElementById('searchInput')
  const buscaDestaque = document.getElementById('busca-destaque')

  // Carrinho e Modais
  const btnCarrinho = document.getElementById('btn-carrinho')
  const modalCarrinho = document.getElementById('modal-carrinho')
  const fecharCarrinhoBtn = document.getElementById('fechar-carrinho')
  const listaPedidoEl = document.getElementById('lista-pedido')
  const contadorCarrinho = document.getElementById('contador-carrinho')
  const totalPedidoEl = document.getElementById('total-pedido')
  const btnFazerPedido = document.getElementById('btn-fazer-pedido')
  const modalConfirmacao = document.getElementById('modal-confirmacao')
  const fecharConfirmacaoBtn = document.getElementById('fechar-confirmacao')
  const okBtn = document.getElementById('ok-btn')

  // Referências para o modal de dados do cliente (para pedidos WhatsApp)
  const modalDadosCliente = document.getElementById('modal-dados-cliente')
  const fecharDadosClienteBtn = document.getElementById('fechar-dados-cliente')
  const formDadosCliente = document.getElementById('form-dados-cliente')

  // VARIÁVEIS AJUSTADAS PARA CORRESPONDER AO HTML
  const nomeClienteInput = document.getElementById('nome-cliente')
  const enderecoClienteInput = document.getElementById('endereco-cliente')
  const bairroClienteInput = document.getElementById('bairro-cliente')
  const complementoClienteInput = document.getElementById('complemento-cliente')
  const telefoneClienteInput = document.getElementById('telefone-cliente')

  // Referências para o novo modal de escolha
  const modalEscolha = document.getElementById('modal-escolha')
  const fecharEscolhaBtn = document.getElementById('fechar-escolha')
  const btnEscolhaWpp = document.getElementById('btn-escolha-wpp')
  const btnEscolhaRestaurante = document.getElementById(
    'btn-escolha-restaurante'
  )

  // Checkbox de Retirada e Container do Endereço
  const retiradaCheckbox = document.getElementById('retirada-local')
  const enderecoContainer = document.getElementById(
    'endereco-completo-container'
  )

  // Referência para o contêiner de mensagens do pedido no painel de admin
  const mensagensPedido = document.getElementById('mensagens-pedido')

  // NOVO: Variáveis para o modal do garçom
  const modalResumoGarcom = document.getElementById('modal-resumo-garcom')
  const fecharResumoGarcomBtn = document.getElementById('fechar-resumo-garcom')
  const resumoPedidoContainer = document.getElementById(
    'resumo-pedido-container'
  )
  const btnFinalizarGarcom = document.getElementById('btn-finalizar-garcom')

  // NOVO: Variáveis para o modal de pagamento
  const modalPagamento = document.getElementById('modal-pagamento')
  const fecharPagamentoBtn = document.getElementById('fechar-pagamento')
  const btnPagamentoDinheiro = document.getElementById('btn-pagamento-dinheiro')
  const btnPagamentoCartao = document.getElementById('btn-pagamento-cartao')

  // NOVO: Variáveis para o modal de troco
  const modalTroco = document.getElementById('modal-troco')
  const fecharTrocoBtn = document.getElementById('fechar-troco')
  const valorTrocoInput = document.getElementById('valor-troco-input')
  const btnConfirmarTroco = document.getElementById('btn-confirmar-troco')

  let pedidoTemp = {}
  let carrinho = []

  const TAXAS_POR_BAIRRO = {
    'jaguaribe': 11.0,
    'aeroclube': 15.0,
    'agua fria': 8.0,
    'altiplano': 8.0,
    'anatolia': 9.5,
    'anatólia': 9.5,
    'bairro das industrias': 20.0,
    'bairro dos estados': 12.0,
    'bairro dos ipes': 14.0,
    'bairro dos novais': 15.0,
    'bancarios': 6.0,
    'bessa': 15.0,
    'brisamar': 10.0,
    'cabo branco': 10.0,
    'castelo branco': 9.0,
    'centro': 12.0,
    'cidade dos colibris': 7.0,
    'colinas do sul': 17.0,
    'costa do sol': 9.0,
    'cristo': 11.0,
    'cruz das armas': 13.0,
    'cuia': 10.0,
    'expedicionarios': 10.0,
    'funcionarios 1': 13.0,
    'funcionarios 2': 12.0,
    'funcionarios 3': 12.0,
    'funcionarios 4': 12.0,
    'geisel': 11.0,
    'gramame': 15.0,
    'jardim cidade universitaria': 6.0,
    'jardim oceania': 15.0,
    'jardim são paulo': 7.0,
    'jardim sao paulo': 7.0,
    'jardim luna': 10.0,
    'joao agripino': 12.0,
    'jose americo': 8.0,
    'joao paulo': 13.0,
    'manaira': 14.0,
    'mandacaru': 8.0,
    'mangabeira': 8.0,
    'mangabeira 8': 9.0,
    'miramar': 9.0,
    'muçumagro': 15.0,
    'oitizeiro': 13.0,
    'padre ze': 13.0,
    'padre zé': 13.0,
    'pedro godin': 10.0,
    'penha': 10.0,
    'portal do sol': 8.0,
    'quadramares': 8.0,
    'rangel': 11.0,
    'roger': 13.0,
    'seixas': 10.0,
    'tambau': 11.0,
    'tambauzinho': 10.0,
    'tambia': 13.0,
    'torre': 10.0,
    'treze de maio': 12.0,
    'valentina': 6.0

    // Adicione mais bairros e suas taxas aqui
  }
  const taxaEntregaEl = document.getElementById('taxa-entrega')

  // --- LÓGICA ATUALIZADA PARA MANTER O CARDÁPIO ABERTO ---
  // Apenas garante que as sublistas estão visíveis ao carregar a página
  // A lógica de clique nas seções para expandir/recolher foi removida
  sublistas.forEach(sublista => {
    sublista.classList.add('show')
    sublista.style.maxHeight = sublista.scrollHeight + 'px'
  })

  const modalPrato = document.getElementById('modal-prato')
  const fecharPratoBtn = document.getElementById('fechar-prato')
  const pratoTituloEl = document.getElementById('prato-titulo')
  const pratoDescEl = document.getElementById('prato-descricao')
  const pratoTamanhosEl = document.getElementById('prato-tamanhos')
  const pratoObservacoesEl = document.getElementById('prato-observacoes')
  const btnAdicionarPrato = document.getElementById('btn-adicionar-prato')

  function abrirModalPrato(
    nomePrato,
    descricaoPrato,
    precos,
    observacoesAnteriores = ''
  ) {
    if (!pratoTituloEl || !pratoDescEl || !pratoTamanhosEl) {
      console.error(
        'Um dos elementos do modal de prato não foi encontrado. Verifique os IDs no HTML.'
      )
      alert(
        'Erro: O modal do prato não está configurado corretamente. Verifique o console do navegador.'
      )
      return
    }

    pratoTituloEl.textContent = nomePrato
    pratoDescEl.textContent = descricaoPrato
    pratoObservacoesEl.value = observacoesAnteriores
    pratoTamanhosEl.innerHTML = ''

    precos.forEach(opcao => {
      const radio = document.createElement('input')
      radio.type = 'radio'
      radio.name = 'tamanho'
      radio.value = `${opcao.descricao}`
      radio.dataset.preco = opcao.preco
      radio.id = `tamanho-${opcao.descricao}`

      const label = document.createElement('label')
      label.htmlFor = `tamanho-${opcao.descricao}`
      label.innerHTML = `
                <span>${opcao.descricao}</span>
                <span class="preco-valor-popup">R$ ${opcao.preco
                  .toFixed(2)
                  .replace('.', ',')}</span>
            `

      const div = document.createElement('div')
      div.classList.add('opcao-tamanho')
      div.appendChild(radio)
      div.appendChild(label)
      pratoTamanhosEl.appendChild(div)
    })

    const primeiroTamanho = pratoTamanhosEl.querySelector('input[type="radio"]')
    if (primeiroTamanho) {
      primeiroTamanho.checked = true
    }

    modalPrato.style.display = 'flex'
  }

  const itensCardapio = document.querySelectorAll('.item-cardapio')
  if (itensCardapio.length > 0) {
    itensCardapio.forEach(item => {
      item.addEventListener('click', () => {
        const nomeItem = item.querySelector('.nome-item').textContent.trim()
        const descItem = item.querySelector('.desc').textContent.trim()

        const precosElement = item.querySelectorAll('.preco-btn-container')
        const precos = Array.from(precosElement).map(p => {
          const desc = p.querySelector('span:first-of-type').textContent.trim()
          const preco = parseFloat(
            p
              .querySelector('.preco-valor')
              .textContent.replace('R$', '')
              .replace(',', '.')
              .trim()
          )
          return { descricao: desc, preco: preco }
        })

        abrirModalPrato(nomeItem, descItem, precos)
      })
    })
  }

  if (fecharPratoBtn) {
    fecharPratoBtn.addEventListener('click', () => {
      modalPrato.style.display = 'none'
    })
  }

  if (btnAdicionarPrato) {
    btnAdicionarPrato.addEventListener('click', () => {
      const nomePrato = pratoTituloEl.textContent
      const observacoes = pratoObservacoesEl.value.trim()
      const tamanhoSelecionado = pratoTamanhosEl.querySelector(
        'input[name="tamanho"]:checked'
      )

      if (tamanhoSelecionado) {
        const descricaoTamanho = tamanhoSelecionado.value
        const precoTamanho = parseFloat(tamanhoSelecionado.dataset.preco)

        let nomeCompleto = `${nomePrato} (${descricaoTamanho})`
        if (observacoes) {
          nomeCompleto += ` - Obs: ${observacoes}`
        }

        carrinho.push({ nome: nomeCompleto, preco: precoTamanho })
        salvarCarrinho()
        atualizarCarrinho()
        modalPrato.style.display = 'none'
        btnCarrinho.style.display = 'flex'
      } else {
        alert('Por favor, selecione um tamanho para o prato.')
      }
    })
  }

  window.addEventListener('click', event => {
    if (event.target === modalPrato) {
      modalPrato.style.display = 'none'
    }
    if (event.target === modalCarrinho) {
      modalCarrinho.style.display = 'none'
    }
    if (event.target === modalDadosCliente) {
      modalDadosCliente.style.display = 'none'
    }
    if (event.target === modalConfirmacao) {
      modalConfirmacao.style.display = 'none'
    }
    if (event.target === modalEscolha) {
      modalEscolha.style.display = 'none'
    }
    if (event.target === modalResumoGarcom) {
      modalResumoGarcom.style.display = 'none'
    }
    if (event.target === modalPagamento) {
      modalPagamento.style.display = 'none'
    }
    if (event.target === modalTroco) {
      modalTroco.style.display = 'none'
    }
  })

  // --- FUNÇÕES PARA SALVAR E CARREGAR DO LOCAL STORAGE ---
  function salvarCarrinho() {
    localStorage.setItem('carrinhoSalvo', JSON.stringify(carrinho))
  }

  function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinhoSalvo')
    if (carrinhoSalvo) {
      carrinho = JSON.parse(carrinhoSalvo)
      atualizarCarrinho()
    }
  }

  function atualizarCarrinho() {
    listaPedidoEl.innerHTML = ''
    let total = 0
    let taxa = 0

    if (carrinho.length === 0) {
      listaPedidoEl.innerHTML = '<p>Seu pedido está vazio.</p>'
      contadorCarrinho.style.display = 'none'
      totalPedidoEl.textContent = 'Total: R$ 0,00'
      if (taxaEntregaEl) taxaEntregaEl.style.display = 'none'
      localStorage.removeItem('carrinhoSalvo')
    } else {
      carrinho.forEach((item, index) => {
        const li = document.createElement('li')
        li.innerHTML = `
                    <span>${item.nome}</span>
                    <div class="item-info-carrinho">
                        <span>R$ ${item.preco
                          .toFixed(2)
                          .replace('.', ',')}</span>
                        <button class="btn-remover" data-index="${index}">&times;</button>
                    </div>
                `
        listaPedidoEl.appendChild(li)
        total += item.preco
      })

      const isRetirada = retiradaCheckbox.checked
      if (!isRetirada && bairroClienteInput) {
        const bairroDigitado = bairroClienteInput.value.toLowerCase().trim()
        taxa = TAXAS_POR_BAIRRO[bairroDigitado] || 0
      }

      if (taxaEntregaEl) {
        if (taxa > 0) {
          taxaEntregaEl.innerHTML = `
                        <span>Taxa de Entrega:</span>
                        <span>R$ ${taxa.toFixed(2).replace('.', ',')}</span>
                    `
          taxaEntregaEl.style.display = 'flex'
        } else {
          taxaEntregaEl.style.display = 'none'
        }
      }

      const totalFinal = total + taxa

      totalPedidoEl.textContent = `Total: R$ ${totalFinal
        .toFixed(2)
        .replace('.', ',')}`
      contadorCarrinho.textContent = carrinho.length
      contadorCarrinho.style.display = 'flex'

      document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', event => {
          const indexParaRemover = parseInt(event.target.dataset.index)
          carrinho.splice(indexParaRemover, 1)
          salvarCarrinho()
          atualizarCarrinho()
        })
      })
    }
  }

  // --- LÓGICA DE MODAIS E BOTÕES ---
  if (btnCarrinho) {
    btnCarrinho.addEventListener('click', () => {
      modalCarrinho.style.display = 'flex'
      atualizarCarrinho()
    })
  }

  if (fecharCarrinhoBtn) {
    fecharCarrinhoBtn.addEventListener('click', () => {
      modalCarrinho.style.display = 'none'
    })
  }

  if (fecharConfirmacaoBtn) {
    fecharConfirmacaoBtn.addEventListener('click', () => {
      modalConfirmacao.style.display = 'none'
    })
  }

  if (okBtn) {
    okBtn.addEventListener('click', () => {
      modalConfirmacao.style.display = 'none'
    })
  }

  if (fecharEscolhaBtn) {
    fecharEscolhaBtn.addEventListener('click', () => {
      modalEscolha.style.display = 'none'
    })
  }

  if (btnFazerPedido) {
    btnFazerPedido.addEventListener('click', () => {
      if (carrinho.length > 0) {
        modalCarrinho.style.display = 'none'
        modalEscolha.style.display = 'flex'
      } else {
        alert('Adicione itens ao seu pedido primeiro!')
      }
    })
  }

  if (fecharDadosClienteBtn) {
    fecharDadosClienteBtn.addEventListener('click', () => {
      modalDadosCliente.style.display = 'none'
    })
  }

  if (fecharResumoGarcomBtn) {
    fecharResumoGarcomBtn.addEventListener('click', () => {
      modalResumoGarcom.style.display = 'none'
    })
  }
  if (btnFinalizarGarcom) {
    btnFinalizarGarcom.addEventListener('click', () => {
      modalResumoGarcom.style.display = 'none'
    })
  }

  if (fecharPagamentoBtn) {
    fecharPagamentoBtn.addEventListener('click', () => {
      modalPagamento.style.display = 'none'
    })
  }

  if (fecharTrocoBtn) {
    fecharTrocoBtn.addEventListener('click', () => {
      modalTroco.style.display = 'none'
    })
  }

  if (retiradaCheckbox && enderecoContainer && bairroClienteInput) {
    retiradaCheckbox.addEventListener('change', () => {
      if (retiradaCheckbox.checked) {
        enderecoContainer.style.display = 'none'
      } else {
        enderecoContainer.style.display = 'flex'
      }
      atualizarCarrinho()
    })

    bairroClienteInput.addEventListener('input', atualizarCarrinho)
  }

  // Remova o código antigo da função btnEscolhaRestaurante
  if (btnEscolhaRestaurante) {
    btnEscolhaRestaurante.addEventListener('click', () => {
      if (carrinho.length === 0) {
        alert('O carrinho está vazio.')
        modalEscolha.style.display = 'none'
        return
      }

      // NOVO CÓDIGO AQUI
      modalEscolha.style.display = 'none'

      const total = carrinho.reduce((sum, item) => sum + item.preco, 0)

      pedidoTemp = {
        cliente: {
          nome: 'Cliente no Local',
          endereco: 'Retirada no Local',
          telefone: 'N/A',
          email: ''
        },
        itens: carrinho,
        total: total,
        data: new Date().toLocaleString('pt-BR'),
        status: 'pendente',
        finalizacao: 'estabelecimento',
        taxaEntrega: 0
      }

      // Exibe o resumo diretamente para o garçom
      const resumoPedidoDiv = document.getElementById('resumo-pedido-container')
      if (resumoPedidoDiv) {
        const itensHtml = carrinho
          .map(
            item =>
              `<li>${item.nome} - R$ ${item.preco
                .toFixed(2)
                .replace('.', ',')}</li>`
          )
          .join('')

        resumoPedidoDiv.innerHTML = `
                <h4>Itens:</h4>
                <ul>${itensHtml}</ul>
                <p class="resumo-total"><strong>Total:</strong> R$ ${pedidoTemp.total
                  .toFixed(2)
                  .replace('.', ',')}</p>
            `
        if (modalResumoGarcom) {
          modalResumoGarcom.style.display = 'flex'
        }
      }

      // NOVO CÓDIGO AQUI
      // Formata o total para ser enviado ao Firebase
      const pedidoFinal = { ...pedidoTemp }
      pedidoFinal.total = `R$ ${pedidoFinal.total.toFixed(2).replace('.', ',')}`

      push(ordersRef, pedidoFinal)
        .then(() => {
          console.log('Pedido enviado para o Firebase com sucesso!')
        })
        .catch(error => {
          console.error('Erro ao enviar pedido para o Firebase: ', error)
          alert('Ocorreu um erro ao enviar seu pedido. Tente novamente.')
        })

      // Limpa o carrinho após o pedido
      carrinho = []
      pedidoTemp = {}
      localStorage.removeItem('carrinhoSalvo')
      atualizarCarrinho()
    })
  }

  if (btnEscolhaWpp) {
    btnEscolhaWpp.addEventListener('click', () => {
      modalEscolha.style.display = 'none'
      modalDadosCliente.style.display = 'flex'
    })
  }

  const btnFinalizarDados = document.getElementById('btn-finalizar-dados')

  if (btnFinalizarDados) {
    btnFinalizarDados.addEventListener('click', e => {
      e.preventDefault()

      const nome = nomeClienteInput.value.trim()
      const telefone = telefoneClienteInput.value.trim()
      const isRetirada = retiradaCheckbox.checked
      const bairro = bairroClienteInput.value.trim()
      const complemento = complementoClienteInput.value.trim()

      let enderecoCompleto = 'Retirada no Local'
      if (!isRetirada) {
        const endereco = enderecoClienteInput.value.trim()
        enderecoCompleto = `${endereco}, ${bairro}${
          complemento ? `, ${complemento}` : ''
        }`
      }

      if (
        !nome ||
        !telefone ||
        (!isRetirada && (!enderecoClienteInput.value.trim() || !bairro))
      ) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
      }

      const dataPedido = new Date().toLocaleString('pt-BR')
      const totalItens = carrinho.reduce((sum, item) => sum + item.preco, 0)
      let taxa = 0
      if (!isRetirada) {
        const bairroLowerCase = bairro.toLowerCase()
        taxa = TAXAS_POR_BAIRRO[bairroLowerCase] || 0
      }
      const totalFinal = totalItens + taxa

      const cliente = { nome, endereco: enderecoCompleto, telefone, bairro }

      pedidoTemp = {
        cliente: cliente,
        itens: carrinho,
        total: totalFinal,
        taxaEntrega: taxa,
        data: dataPedido,
        status: 'pendente',
        finalizacao: 'whatsapp'
      }

      modalDadosCliente.style.display = 'none'
      modalPagamento.style.display = 'flex'
    })
  }

  // FUNÇÃO ATUALIZADA: agora recebe o valor do troco e o troco devido
  function enviarPedidoFinal(formaPagamento, valorTroco, trocoDevido) {
    if (!pedidoTemp || carrinho.length === 0) {
      alert('Não há pedido para ser finalizado.')
      return
    }

    const pedidoFinal = {
      ...pedidoTemp,
      formaPagamento: formaPagamento,
      troco: valorTroco,
      trocoDevido: trocoDevido,
      // Apenas para exibição final, transformamos o total numérico em string formatada
      total: `R$ ${pedidoTemp.total.toFixed(2).replace('.', ',')}`
    }

    push(ordersRef, pedidoFinal)
      .then(() => {
        modalPagamento.style.display = 'none'
        modalConfirmacao.style.display = 'flex'

        if (pedidoFinal.finalizacao === 'whatsapp') {
          const totalItens = carrinho.reduce((sum, item) => sum + item.preco, 0)

          const trocoMensagem =
            pedidoFinal.formaPagamento === 'Dinheiro'
              ? `Troco para: ${pedidoFinal.troco}\nTroco devido: ${pedidoFinal.trocoDevido}\n`
              : ''

          const resumoValores = `\nSubtotal: R$ ${totalItens
            .toFixed(2)
            .replace('.', ',')}\nTaxa de Entrega: R$ ${pedidoFinal.taxaEntrega
            .toFixed(2)
            .replace(
              '.',
              ','
            )}\nForma de Pagamento: ${formaPagamento}\n${trocoMensagem}\n*Total a pagar: ${
            pedidoFinal.total
          }*\n`

          const mensagemCompleta = `Olá, gostaria de fazer o meu pedido. Seguem os detalhes:\n\n*Dados do Cliente:*\nNome: ${
            pedidoFinal.cliente.nome
          }\nEndereço: ${pedidoFinal.cliente.endereco}\nTelefone: ${
            pedidoFinal.cliente.telefone
          }\n\n*Itens do Pedido:*\n${carrinho
            .map(
              item =>
                `- ${item.nome} (R$ ${item.preco.toFixed(2).replace('.', ',')})`
            )
            .join('\n')}\n${resumoValores}\nObrigado!`

          const telefoneRestaurante = '5583988627070'
          const urlWhatsapp = `https://api.whatsapp.com/send?phone=${telefoneRestaurante}&text=${encodeURIComponent(
            mensagemCompleta
          )}`
          window.open(urlWhatsapp, '_blank')
        } else {
          const resumoPedidoDiv = document.getElementById(
            'resumo-pedido-container'
          )
          if (resumoPedidoDiv) {
            const itensHtml = carrinho
              .map(
                item =>
                  `<li>${item.nome} - R$ ${item.preco
                    .toFixed(2)
                    .replace('.', ',')}</li>`
              )
              .join('')

            const trocoHtml =
              pedidoFinal.formaPagamento === 'Dinheiro'
                ? `<p><strong>Troco para:</strong> ${pedidoFinal.troco}</p><p><strong>Troco devido:</strong> ${pedidoFinal.trocoDevido}</p>`
                : ''

            resumoPedidoDiv.innerHTML = `
                            <h4>Itens:</h4>
                            <ul>${itensHtml}</ul>
                            <p><strong>Forma de Pagamento:</strong> ${formaPagamento}</p>
                            ${trocoHtml}
                            <p class="resumo-total"><strong>Total:</strong> ${pedidoFinal.total}</p>
                        `
            if (modalResumoGarcom) {
              modalResumoGarcom.style.display = 'flex'
            }
          }
        }

        carrinho = []
        pedidoTemp = {}
        localStorage.removeItem('carrinhoSalvo')
        atualizarCarrinho()

        if (nomeClienteInput) nomeClienteInput.value = ''
        if (enderecoClienteInput) enderecoClienteInput.value = ''
        if (bairroClienteInput) bairroClienteInput.value = ''
        if (complementoClienteInput) complementoClienteInput.value = ''
        if (telefoneClienteInput) telefoneClienteInput.value = ''
        if (retiradaCheckbox) retiradaCheckbox.checked = false
        if (enderecoContainer) enderecoContainer.style.display = 'flex'
      })
      .catch(error => {
        console.error('Erro ao enviar pedido para o Firebase: ', error)
        alert('Ocorreu um erro ao enviar seu pedido. Tente novamente.')
      })
  }

  if (btnPagamentoDinheiro) {
    btnPagamentoDinheiro.addEventListener('click', () => {
      modalPagamento.style.display = 'none'
      modalTroco.style.display = 'flex'
    })
  }

  if (btnPagamentoCartao) {
    btnPagamentoCartao.addEventListener('click', () => {
      enviarPedidoFinal('Cartão', 'N/A', 'N/A')
    })
  }

  if (btnConfirmarTroco) {
    btnConfirmarTroco.addEventListener('click', () => {
      const valorTrocoNumerico = parseFloat(valorTrocoInput.value)
      const totalPedidoNumerico = pedidoTemp.total

      let trocoDevido = 'Não precisa de troco.'
      if (valorTrocoNumerico >= totalPedidoNumerico) {
        trocoDevido = valorTrocoNumerico - totalPedidoNumerico
        trocoDevido = `R$ ${trocoDevido.toFixed(2).replace('.', ',')}`
      }

      let valorTrocoFormatado = valorTrocoInput.value.trim()
      if (valorTrocoFormatado === '') {
        valorTrocoFormatado = 'Não informado.'
      } else {
        valorTrocoFormatado = `R$ ${parseFloat(valorTrocoFormatado)
          .toFixed(2)
          .replace('.', ',')}`
      }

      modalTroco.style.display = 'none'
      enviarPedidoFinal('Dinheiro', valorTrocoFormatado, trocoDevido)
    })
  }

  function trocarLogoPorTema() {
    const logo = document.getElementById('logo')
    if (!logo) return
    const temaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
    logo.src = temaEscuro ? '12.jpg' : '10.jpg'
  }

  trocarLogoPorTema()
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', trocarLogoPorTema)

  const fundo = new Image()
  fundo.src = '11.jpg'
  fundo.onload = () => {
    document.body.classList.add('fundo-carregado')
  }

  if (btnTopo) {
    window.addEventListener('scroll', () => {
      btnTopo.style.display = window.scrollY > 200 ? 'block' : 'none'
      btnTopo.classList.toggle('show', window.scrollY > 200)
    })
    btnTopo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const headerLinks = document.querySelectorAll('.header-rotativo a')
  headerLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault()
      const targetId = link.getAttribute('href')
      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - headerHeight
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
    })
  })

  /* Substitua a sua função de busca por esta: */
  if (searchInput) {
    let debounceTimer
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const termoBusca = this.value.toLowerCase().trim()
        const todosItens = document.querySelectorAll('.sublista li')

        let resultados = []
        const msgBusca = document.getElementById('msgBusca')

        if (termoBusca === '') {
          // Se a busca estiver vazia, reexibe todos os itens e esconde a lista de destaque
          todosItens.forEach(item => (item.style.display = 'flex'))
          if (buscaDestaque) buscaDestaque.style.display = 'none'
          if (msgBusca) msgBusca.style.display = 'none'
        } else {
          // Filtra os itens com base no termo de busca
          todosItens.forEach(item => {
            const nomeItemEl = item.querySelector('.nome-item')
            const descItemEl = item.querySelector('.desc')
            const nomeItem = nomeItemEl
              ? nomeItemEl.textContent.toLowerCase()
              : ''
            const descItem = descItemEl
              ? descItemEl.textContent.toLowerCase()
              : ''

            if (
              nomeItem.includes(termoBusca) ||
              descItem.includes(termoBusca)
            ) {
              item.style.display = 'flex' // Exibe o item
              // Adiciona o item à lista de destaque
              resultados.push(
                `<li data-idx="${Array.from(todosItens).indexOf(item)}">
                                <div style="display:flex;justify-content:space-between;align-items:center;gap:20px;">
                                    <strong>${nomeItemEl.textContent}</strong>
                                </div>
                            </li>`
              )
            } else {
              item.style.display = 'none' // Esconde o item
            }
          })

          // Lógica para a lista de destaque e mensagem de "não encontrado"
          if (buscaDestaque) {
            if (resultados.length > 0) {
              buscaDestaque.innerHTML = `<ul>${resultados.join('')}</ul>`
              buscaDestaque.style.display = 'block'
              buscaDestaque.querySelectorAll('li').forEach(li => {
                li.addEventListener('click', function () {
                  const idx = this.getAttribute('data-idx')
                  const item = todosItens[idx]
                  if (item) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    item.style.background = '#f500003f'
                    setTimeout(() => {
                      item.style.background = ''
                    }, 1500)
                  }
                  buscaDestaque.style.display = 'none'
                })
              })
            } else {
              buscaDestaque.style.display = 'none'
            }
          }

          if (msgBusca) {
            msgBusca.style.display = resultados.length === 0 ? 'block' : 'none'
          }
        }
      }, 200)
    })

    searchInput.addEventListener('blur', function () {
      setTimeout(() => {
        if (buscaDestaque) buscaDestaque.style.display = 'none'
      }, 200)
    })
  }

  const secoesComID = document.querySelectorAll('.secao[id]')
  const observerOptions = {
    root: null,
    rootMargin: `-${headerHeight}px 0px 0px 0px`,
    threshold: 0
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const secaoId = entry.target.id
      const linkCorrespondente = document.querySelector(
        `.header-rotativo a[href="#${secaoId}"]`
      )
      if (linkCorrespondente) {
        if (entry.isIntersecting) {
          linkCorrespondente.classList.add('link-ativo')
        } else {
          linkCorrespondente.classList.remove('link-ativo')
        }
      }
    })
  }, observerOptions)
  secoesComID.forEach(secao => {
    observer.observe(secao)
  })

  // --- LÓGICA DO CHAT E ENVIO DE MENSAGENS ---
  const chatToggleBtn = document.getElementById('chat-toggle-btn')
  const chatContainer = document.getElementById('chat-container')
  const chatCloseBtn = document.getElementById('chat-close-btn')
  const chatMessages = document.getElementById('chat-messages')
  const chatInput = document.getElementById('chat-input')
  const chatSendBtn = document.getElementById('chat-send-btn')

  if (
    chatToggleBtn &&
    chatContainer &&
    chatCloseBtn &&
    chatMessages &&
    chatInput &&
    chatSendBtn
  ) {
    chatToggleBtn.addEventListener('click', () => {
      chatContainer.classList.toggle('hidden')
    })
    chatCloseBtn.addEventListener('click', () => {
      chatContainer.classList.add('hidden')
    })

    function sendMessage() {
      const messageText = chatInput.value.trim()
      if (messageText !== '') {
        const now = new Date()
        const timestamp = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        push(messagesRef, {
          text: messageText,
          timestamp: timestamp,
          sender: 'user'
        })
        chatInput.value = ''
      }
    }
    chatSendBtn.addEventListener('click', sendMessage)
    chatInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        sendMessage()
      }
    })
    onValue(messagesRef, snapshot => {
      chatMessages.innerHTML = ''
      snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val()
        const messageElement = document.createElement('div')
        messageElement.classList.add('chat-message')
        messageElement.classList.add(
          message.sender === 'user' ? 'sent' : 'received'
        )
        messageElement.innerHTML = `<p>${message.text}</p><span class="timestamp">${message.timestamp}</span>`
        chatMessages.appendChild(messageElement)
      })
      chatMessages.scrollTop = chatMessages.scrollHeight
    })
  }

  if (mensagensPedido) {
    onValue(ordersRef, snapshot => {
      const pedidos = []
      snapshot.forEach(childSnapshot => {
        pedidos.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })

      mensagensPedido.innerHTML = ''

      if (pedidos.length === 0) {
        mensagensPedido.innerHTML =
          '<p class="msg-sem-pedidos">Nenhum pedido recebido ainda.</p>'
      } else {
        pedidos.reverse().forEach(pedido => {
          const pedidoDiv = document.createElement('div')
          pedidoDiv.classList.add('pedido-item')

          const isWhatsapp = pedido.finalizacao === 'whatsapp'
          const telefone = pedido.cliente.telefone
          const endereco = pedido.cliente.endereco

          const listaItensHtml = pedido.itens
            .map(
              item => `
                        <li>${
                          item.nome
                        } <span class="item-preco">R$ ${item.preco
                .toFixed(2)
                .replace('.', ',')}</span></li>
                    `
            )
            .join('')

          const taxaHtml =
            pedido.taxaEntrega > 0
              ? `<p class="pedido-taxa"><strong>Taxa de Entrega:</strong> R$ ${pedido.taxaEntrega
                  .toFixed(2)
                  .replace('.', ',')}</p>`
              : ''

          const trocoHtml =
            pedido.formaPagamento === 'Dinheiro'
              ? `<p class="pedido-troco"><strong>Troco para:</strong> ${pedido.troco}</p><p class="pedido-troco-devido"><strong>Troco devido:</strong> ${pedido.trocoDevido}</p>`
              : ''

          pedidoDiv.innerHTML = `
                        <div class="pedido-header">
                            <span class="pedido-total-valor">Total: ${
                              pedido.total
                            }</span>
                            <span class="pedido-data">${pedido.data}</span>
                        </div>
                        <div class="pedido-detalhes">
                            <p><strong>Cliente:</strong> ${
                              pedido.cliente.nome
                            }</p>
                            ${
                              endereco
                                ? `<p><strong>Endereço:</strong> ${endereco}</p>`
                                : ''
                            }
                            ${
                              telefone
                                ? `<p><strong>Telefone:</strong> ${telefone} ${
                                    isWhatsapp
                                      ? `<a href="https://api.whatsapp.com/send?phone=55${telefone}&text=Ol%C3%A1%20${pedido.cliente.nome}%2C%20recebemos%20seu%20pedido!" target="_blank" class="abrir-wpp-link">Abrir WhatsApp</a>`
                                      : ''
                                  }</p>`
                                : ''
                            }
                            <p><strong>Pagamento:</strong> ${
                              pedido.formaPagamento
                            }</p>
                            ${trocoHtml}
                        </div>
                        ${taxaHtml}
                        <div class="pedido-lista-itens">
                            <p><strong>Itens:</strong></p>
                            <ul>
                                ${listaItensHtml}
                            </ul>
                        </div>
                        <button class="btn-pedido-pronto" data-id="${
                          pedido.id
                        }">Pronto</button>
                    `
          mensagensPedido.appendChild(pedidoDiv)
        })

        document.querySelectorAll('.btn-pedido-pronto').forEach(btn => {
          btn.addEventListener('click', e => {
            const pedidoId = e.target.dataset.id
            const pedidoRef = ref(database, 'pedidos/' + pedidoId)

            push(pedidoRef, { status: 'pronto' })
              .then(() => {
                console.log("Status do pedido atualizado para 'pronto'!")
              })
              .catch(error => {
                console.error('Erro ao atualizar status do pedido: ', error)
              })
          })
        })
      }
    })
  }

  carregarCarrinho()
  atualizarCarrinho()

  console.log(
    '%cDesenvolvido por faeldev-ux 🦊',
    'color:#b30000;font-weight:bold;font-size:14px;'
  )
})
