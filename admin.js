import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'
import {
  getDatabase,
  ref,
  onValue,
  remove,
  update
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js'

const firebaseConfig = {
  apiKey: 'AIzaSyAn9EvaVb-GLvh4-60B4oKKQznuJteM_do',
  authDomain: 'supremo-oriente-chat-45c03.firebaseapp.com',
  projectId: 'supremo-oriente-chat-45c03',
  storageBucket: 'supremo-oriente-chat-45c03.firebasestorage.app',
  messagingSenderId: '246020177422',
  appId: '1:246020177422:web:8108b666088f15b26c465f'
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

const ordersRef = ref(database, 'pedidos')
const messagesRef = ref(database, 'messages')

const ordersList = document.getElementById('orders-list')
const chatList = document.getElementById('chat-list')

let lastOrderCount = 0
const notificationSound = new Audio('ding-sound-effect_2.mp3')

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const normalized = value
      .trim()
      .replace(/\s+/g, '')
      .replace(/R\$/gi, '')
      .replace(/\./g, '')
      .replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(value) {
  return `R$ ${toNumber(value).toFixed(2).replace('.', ',')}`
}

function getClienteInfo(order = {}) {
  const cliente = order.cliente || {}
  return {
    nome: cliente.nome || 'Não informado',
    telefone: cliente.telefone || 'Não informado',
    endereco:
      cliente.enderecoFormatado || cliente.endereco || 'Não informado',
    bairro: cliente.bairro || 'Não informado',
    cep: cliente.cep || ''
  }
}

function getItemData(item) {
  if (typeof item === 'object' && item) {
    return {
      nome: item.nome || item.produto || 'Item sem nome',
      preco: toNumber(item.preco),
      observacao: item.observacao || ''
    }
  }

  return {
    nome: String(item),
    preco: 0,
    observacao: ''
  }
}

function renderItemHtml(item) {
  const itemData = getItemData(item)
  return `
    <li>
      <div>${itemData.nome}${itemData.preco > 0 ? ` - ${formatMoney(itemData.preco)}` : ''}</div>
      ${itemData.observacao ? `<small><strong>Obs:</strong> ${itemData.observacao}</small>` : ''}
    </li>
  `
}

function removeOrder(orderId) {
  const orderRef = ref(database, `pedidos/${orderId}`)
  remove(orderRef)
    .then(() => {
      console.log('Pedido removido com sucesso!')
    })
    .catch(error => {
      console.error('Erro ao remover pedido: ', error)
    })
}

function requestReprint(orderId) {
  const orderRef = ref(database, `pedidos/${orderId}`)
  update(orderRef, {
    impressao_concluida: false,
    reimpressao_solicitada_em: new Date().toISOString()
  })
    .then(() => {
      alert('Reimpressão solicitada com sucesso.')
    })
    .catch(error => {
      console.error('Erro ao solicitar reimpressão: ', error)
      alert('Não foi possível solicitar a reimpressão.')
    })
}

function printOrder(order) {
  if (!order) {
    alert('Não há pedido para imprimir.')
    return
  }

  const clienteInfo = getClienteInfo(order)
  const itensHtml = (order.itens || []).map(renderItemHtml).join('')
  const subtotal = toNumber(order.subtotal) ||
    (order.itens || []).reduce((sum, item) => sum + getItemData(item).preco, 0)

  const trocoHtml = order.formaPagamento === 'Dinheiro'
    ? `
        <p><strong>Troco para:</strong> ${order.troco}</p>
        <p><strong>Troco devido:</strong> ${order.trocoDevido}</p>
      `
    : ''

  const taxaHtml = toNumber(order.taxaEntrega) > 0
    ? `<p><strong>Taxa de Entrega:</strong> ${formatMoney(order.taxaEntrega)}</p>`
    : ''

  const conteudoImpressao = `
    <style>
      body { font-family: 'Courier New', Courier, monospace; font-size: 20px; color: black; }
      .recibo { width: 300px; margin: 0 auto; padding: 10px; border: 1px solid black; }
      h3 { text-align: center; margin-bottom: 5px; }
      .linha { border-bottom: 1px dashed black; margin: 10px 0; }
      ul { list-style: none; padding: 0; margin: 0; }
      li { margin-bottom: 8px; }
      small { display: block; margin-top: 4px; }
      .total { font-weight: bold; text-align: right; }
      p { margin: 5px 0; }
    </style>
    <div class="recibo">
      <h3>Recibo do Pedido</h3>
      <p><strong>Data:</strong> ${order.data}</p>
      <div class="linha"></div>
      <p><strong>Cliente:</strong> ${clienteInfo.nome}</p>
      <p><strong>Endereço:</strong> ${clienteInfo.endereco}</p>
      <p><strong>Telefone:</strong> ${clienteInfo.telefone}</p>
      <div class="linha"></div>
      <p><strong>Itens:</strong></p>
      <ul>${itensHtml}</ul>
      <div class="linha"></div>
      <p><strong>Subtotal:</strong> ${formatMoney(subtotal)}</p>
      ${taxaHtml}
      <p><strong>Forma de Pagamento:</strong> ${order.formaPagamento || 'Não informado'}</p>
      ${trocoHtml}
      <div class="linha"></div>
      <p class="total"><strong>TOTAL:</strong> ${formatMoney(order.total)}</p>
    </div>
  `

  const janelaImpressao = window.open('', '_blank')
  janelaImpressao.document.write(conteudoImpressao)
  janelaImpressao.document.close()
  janelaImpressao.print()
  janelaImpressao.onafterprint = function () {
    janelaImpressao.close()
  }
}

function sendWhatsAppMessage(order) {
  const clienteInfo = getClienteInfo(order)
  if (!clienteInfo.telefone || clienteInfo.telefone === 'Não informado') {
    alert('Informações do cliente ausentes para enviar mensagem.')
    return
  }

  const telefone = clienteInfo.telefone.replace(/\D/g, '')
  const nomeCliente = clienteInfo.nome.split(' ')[0]
  const mensagem = `Olá, ${nomeCliente}! Gostaríamos de informar que seu pedido já está sendo preparado. Em breve estará a caminho!`
  const whatsappUrl = `https://api.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`

  window.open(whatsappUrl, '_blank')
}

onValue(ordersRef, snapshot => {
  ordersList.innerHTML = ''
  if (snapshot.exists()) {
    const orders = snapshot.val()
    const currentOrderCount = Object.keys(orders).length
    if (currentOrderCount > lastOrderCount && lastOrderCount !== 0) {
      notificationSound.play().catch(error => {
        console.error('Erro ao tocar o som: ', error)
      })
    }
    lastOrderCount = currentOrderCount

    const orderKeys = Object.keys(orders).reverse()

    orderKeys.forEach(key => {
      const order = orders[key]
      const orderItem = document.createElement('div')
      orderItem.classList.add('order-item')

      const clienteInfo = getClienteInfo(order)
      if (clienteInfo.endereco === 'Retirada no Local') {
        orderItem.classList.add('pedido-retirada')
      }

      const itemsHtml = Array.isArray(order.itens)
        ? order.itens.map(renderItemHtml).join('')
        : `<li>${order.itens}</li>`

      const telefoneFormatado = clienteInfo.telefone.replace(/\D/g, '')
      const whatsappLink = telefoneFormatado
        ? `https://wa.me/55${telefoneFormatado}`
        : '#'
      const trocoHtml = order.formaPagamento === 'Dinheiro'
        ? `<p><strong>Troco para:</strong> ${order.troco}</p><p><strong>Troco devido:</strong> ${order.trocoDevido}</p>`
        : ''
      const taxaHtml = toNumber(order.taxaEntrega) > 0
        ? `<p><strong>Taxa:</strong> ${formatMoney(order.taxaEntrega)}</p>`
        : ''

      orderItem.innerHTML = `
        <div class="order-header">
          <span>Pedido de <strong>${formatMoney(order.total)}</strong></span>
          <span class="order-date">${order.data}</span>
        </div>
        <div class="order-details">
          <p><strong>Nome:</strong> ${clienteInfo.nome}</p>
          <p><strong>Endereço:</strong> ${clienteInfo.endereco}</p>
          <p><strong>Bairro:</strong> ${clienteInfo.bairro}</p>
          ${clienteInfo.cep ? `<p><strong>CEP:</strong> ${clienteInfo.cep}</p>` : ''}
          <p><strong>Telefone:</strong> ${clienteInfo.telefone} ${telefoneFormatado ? `<a href="${whatsappLink}" target="_blank" class="whatsapp-btn">Abrir WhatsApp</a>` : ''}</p>
          <p><strong>Pagamento:</strong> ${order.formaPagamento || 'Não informado'}</p>
          <p><strong>Subtotal:</strong> ${formatMoney(order.subtotal)}</p>
          ${taxaHtml}
          ${trocoHtml}
          <ul>${itemsHtml}</ul>
        </div>
        <div class="order-actions">
          <button class="btn-ready" data-order-id="${key}">Pronto</button>
          <button class="btn-print" data-order-id="${key}">Imprimir</button>
          <button class="btn-reprint" data-order-id="${key}">Reimprimir Cozinha</button>
          <button class="btn-whatsapp" data-order-id="${key}">Enviar Mensagem</button>
        </div>
      `
      ordersList.appendChild(orderItem)
    })

    document.querySelectorAll('.btn-ready').forEach(button => {
      button.addEventListener('click', event => {
        const orderId = event.target.dataset.orderId
        if (confirm('Tem certeza que deseja marcar este pedido como pronto?')) {
          removeOrder(orderId)
        }
      })
    })

    document.querySelectorAll('.btn-print').forEach(button => {
      button.addEventListener('click', event => {
        const orderId = event.target.dataset.orderId
        printOrder(orders[orderId])
      })
    })

    document.querySelectorAll('.btn-reprint').forEach(button => {
      button.addEventListener('click', event => {
        const orderId = event.target.dataset.orderId
        requestReprint(orderId)
      })
    })

    document.querySelectorAll('.btn-whatsapp').forEach(button => {
      button.addEventListener('click', event => {
        const orderId = event.target.dataset.orderId
        sendWhatsAppMessage(orders[orderId])
      })
    })
  } else {
    ordersList.innerHTML = '<p>Nenhum pedido novo.</p>'
    lastOrderCount = 0
  }
})

onValue(messagesRef, snapshot => {
  chatList.innerHTML = ''
  if (snapshot.exists()) {
    const messages = snapshot.val()
    const messageKeys = Object.keys(messages)

    messageKeys.forEach(key => {
      const message = messages[key]
      const messageItem = document.createElement('div')
      messageItem.classList.add('chat-message-admin')

      if (message.sender === 'user') {
        messageItem.classList.add('user')
      }

      messageItem.innerHTML = `
        <span>${message.text}</span>
        <span class="chat-date">${message.timestamp}</span>
      `
      chatList.appendChild(messageItem)
    })
    chatList.scrollTop = chatList.scrollHeight
  } else {
    chatList.innerHTML = '<p>Nenhuma mensagem nova.</p>'
  }
})
