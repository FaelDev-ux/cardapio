// =========================================================
// ADMIN.JS - VISUALIZAÇÃO DE DADOS EM TEMPO REAL E EXCLUSÃO
// =========================================================

// Importa as funções necessárias do Firebase, incluindo 'remove'
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAn9EvaVb-GLvh4-60B4oKKQznuJteM_do",
    authDomain: "supremo-oriente-chat-45c03.firebaseapp.com",
    projectId: "supremo-oriente-chat-45c03",
    storageBucket: "supremo-oriente-chat-45c03.firebasestorage.app",
    messagingSenderId: "246020177422",
    appId: "1:246020177422:web:8108b666088f15b26c465f"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referências para os caminhos dos dados no banco de dados
const ordersRef = ref(database, 'pedidos');
const messagesRef = ref(database, 'messages');

// Referências para os elementos HTML
const ordersList = document.getElementById('orders-list');
const chatList = document.getElementById('chat-list');

// Função para remover um pedido do banco de dados
function removeOrder(orderId) {
    const orderRef = ref(database, `pedidos/${orderId}`);
    remove(orderRef)
        .then(() => {
            console.log("Pedido removido com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao remover pedido: ", error);
        });
}

// --- NOVO: Função para imprimir um pedido ---
// --- NOVO: Função para imprimir um pedido ---
function printOrder(order) {
    if (!order) {
        alert("Não há pedido para imprimir.");
        return;
    }
    
    // Converte os itens para HTML
    const itensHtml = order.itens.map(item => {
        // Verifica se o item é um objeto com nome e preço
        if (typeof item === 'object' && item.nome && item.preco) {
            return `<li>${item.nome} &nbsp; &nbsp; &nbsp; &nbsp; R$ ${item.preco.toFixed(2).replace('.', ',')}</li>`;
        } else {
            // Se não for, assume que é uma string simples
            return `<li>${item}</li>`;
        }
    }).join('');

    // Prepara o conteúdo do troco
    const trocoHtml = order.formaPagamento === 'Dinheiro' ? `
        <p><strong>Troco para:</strong> ${order.troco}</p>
        <p><strong>Troco devido:</strong> ${order.trocoDevido}</p>
    ` : '';
    
    // Prepara o conteúdo da taxa de entrega
    const taxaHtml = (order.taxaEntrega > 0) ? `
        <p><strong>Taxa de Entrega:</strong> R$ ${order.taxaEntrega.toFixed(2).replace('.', ',')}</p>
    ` : '';

    // Cria o conteúdo HTML completo para impressão
    const conteudoImpressao = `
        <style>
            body { 
                font-family: 'Courier New', Courier, monospace; 
                font-size: 20px; 
                color: black;
            }
            .recibo { 
                width: 300px; 
                margin: 0 auto; 
                padding: 10px; 
                border: 1px solid black; 
            }
            h3 { 
                text-align: center; 
                margin-bottom: 5px;
            }
            .linha { 
                border-bottom: 1px dashed black; 
                margin: 10px 0;
            }
            ul { 
                list-style: none; 
                padding: 0; 
                margin: 0; 
            }
            li { 
                margin-bottom: 5px; 
            }
            .total { 
                font-weight: bold;
                text-align: right; 
            }
            p { 
                margin: 5px 0; 
            }
            p strong {
                font-weight: bold;
            }
        </style>
        <div class="recibo">
            <h3>Recibo do Pedido</h3>
            <p><strong>Data:</strong> ${order.data}</p>
            <div class="linha"></div>
            <p><strong>Cliente:</strong> ${order.cliente.nome}</p>
            <p><strong>Endereço:</strong> ${order.cliente.endereco}</p>
            <p><strong>Telefone:</strong> ${order.cliente.telefone}</p>
            <div class="linha"></div>
            <p><strong>Itens:</strong></p>
            <ul>
                ${itensHtml}
            </ul>
            <div class="linha"></div>
            <p><strong>Subtotal:</strong> R$ ${order.itens.reduce((sum, item) => sum + (typeof item === 'object' && item.preco ? item.preco : 0), 0).toFixed(2).replace('.', ',')}</p>
            ${taxaHtml}
            <p><strong>Forma de Pagamento:</strong> ${order.formaPagamento}</p>
            ${trocoHtml}
            <div class="linha"></div>
            <p class="total"><strong>TOTAL:</strong> R$ ${typeof order.total === 'number' ? order.total.toFixed(2).replace('.', ',') : order.total}</p>
        </div>
    `;

    // Abre uma nova janela, escreve o conteúdo e imprime
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(conteudoImpressao);
    janelaImpressao.document.close();
    janelaImpressao.print();
}

// Escuta e exibe os pedidos em tempo real
onValue(ordersRef, (snapshot) => {
    ordersList.innerHTML = ''; // Limpa a lista antes de atualizar
    if (snapshot.exists()) {
        const orders = snapshot.val();
        
        // Converte o objeto de pedidos em um array e reverte para mostrar o mais recente primeiro
        const orderKeys = Object.keys(orders).reverse();
        
        orderKeys.forEach(key => {
            const order = orders[key];
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            
            // Lógica para adicionar as informações do cliente
            const clienteInfo = order.cliente || { nome: 'Não informado', endereco: 'Não informado', telefone: 'Não informado' };

            // ADICIONA A CLASSE DE DESTAQUE AQUI
            if (clienteInfo.endereco === "Retirada no Local") {
                orderItem.classList.add('pedido-retirada');
            }

            // Lógica para renderizar a lista de itens do pedido
            let itemsHtml = '';
            if (Array.isArray(order.itens) && order.itens.length > 0 && typeof order.itens[0] === 'object') {
                itemsHtml = order.itens.map(item => `<li>${item.nome} - R$ ${item.preco.toFixed(2).replace('.', ',')}</li>`).join('');
            } else if (Array.isArray(order.itens)) {
                itemsHtml = order.itens.map(item => `<li>${item}</li>`).join('');
            } else {
                itemsHtml = `<li>${order.itens}</li>`;
            }

            // Formata o número de telefone para o link do WhatsApp
            const telefoneFormatado = clienteInfo.telefone ? clienteInfo.telefone.replace(/\D/g, '') : '';
            const whatsappLink = `https://wa.me/55${telefoneFormatado}`; // Adicionado o código do país para o WhatsApp

            // Prepara o conteúdo do troco para exibição
            const trocoHtml = order.formaPagamento === 'Dinheiro' ? `<p><strong>Troco para:</strong> ${order.troco}</p><p><strong>Troco devido:</strong> ${order.trocoDevido}</p>` : '';
            
            // Adiciona o botão "Pronto" e o link do WhatsApp
            orderItem.innerHTML = `
                <div class="order-header">
                    <span>Pedido de <strong>${order.total}</strong></span>
                    <span class="order-date">${order.data}</span>
                </div>
                <div class="order-details">
                    <p><strong>Nome:</strong> ${clienteInfo.nome}</p>
                    <p><strong>Endereço:</strong> ${clienteInfo.endereco}</p>
                    <p><strong>Telefone:</strong> ${clienteInfo.telefone} <a href="${whatsappLink}" target="_blank" class="whatsapp-btn">Abrir WhatsApp</a></p>
                    <p><strong>Pagamento:</strong> ${order.formaPagamento}</p>
                    ${trocoHtml}
                    <ul>${itemsHtml}</ul>
                </div>
                <div class="order-actions">
                    <button class="btn-ready" data-order-id="${key}">Pronto</button>
                    <button class="btn-print" data-order-id="${key}">Imprimir</button>
                </div>
            `;
            ordersList.appendChild(orderItem);
        });

        // Adiciona um "ouvinte" de eventos para os botões "Pronto"
        document.querySelectorAll('.btn-ready').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                if (confirm("Tem certeza que deseja marcar este pedido como pronto?")) {
                    removeOrder(orderId);
                }
            });
        });
        
        // --- NOVO: Adiciona um ouvinte para o botão "Imprimir" ---
        document.querySelectorAll('.btn-print').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                const orderToPrint = orders[orderId];
                printOrder(orderToPrint);
            });
        });

    } else {
        ordersList.innerHTML = '<p>Nenhum pedido novo.</p>';
    }
});

// Escuta e exibe as mensagens do chat em tempo real
onValue(messagesRef, (snapshot) => {
    chatList.innerHTML = ''; 
    if (snapshot.exists()) {
        const messages = snapshot.val();
        
        const messageKeys = Object.keys(messages);

        messageKeys.forEach(key => {
            const message = messages[key];
            const messageItem = document.createElement('div');
            messageItem.classList.add('chat-message-admin');
            
            if (message.sender === 'user') {
                messageItem.classList.add('user');
            }
            
            messageItem.innerHTML = `
                <span>${message.text}</span>
                <span class="chat-date">${message.timestamp}</span>
            `;
            chatList.appendChild(messageItem);
        });
        chatList.scrollTop = chatList.scrollHeight; 
    } else {
        chatList.innerHTML = '<p>Nenhuma mensagem nova.</p>';
    }
});