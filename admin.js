// =========================================================
// ADMIN.JS - VISUALIZAÇÃO DE DADOS EM TEMPO REAL E EXCLUSÃO
// =========================================================

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const ordersRef = ref(database, 'pedidos');
const messagesRef = ref(database, 'messages');

const ordersList = document.getElementById('orders-list');
const chatList = document.getElementById('chat-list');

// Variáveis para a notificação sonora
let lastOrderCount = 0;
// A linha abaixo foi atualizada com o nome do seu arquivo de som
const notificationSound = new Audio('ding-sound-effect_2.mp3');

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

function printOrder(order) {
    if (!order) {
        alert("Não há pedido para imprimir.");
        return;
    }
    
    const itensHtml = order.itens.map(item => {
        if (typeof item === 'object' && item.nome && item.preco) {
            return `<li>${item.nome} &nbsp; &nbsp; &nbsp; &nbsp; R$ ${item.preco.toFixed(2).replace('.', ',')}</li>`;
        } else {
            return `<li>${item}</li>`;
        }
    }).join('');

    const trocoHtml = order.formaPagamento === 'Dinheiro' ? `
        <p><strong>Troco para:</strong> ${order.troco}</p>
        <p><strong>Troco devido:</strong> ${order.trocoDevido}</p>
    ` : '';
    
    const taxaHtml = (order.taxaEntrega > 0) ? `
        <p><strong>Taxa de Entrega:</strong> R$ ${order.taxaEntrega.toFixed(2).replace('.', ',')}</p>
    ` : '';

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

    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(conteudoImpressao);
    janelaImpressao.document.close();
    janelaImpressao.print();
    janelaImpressao.onafterprint = function() {
        janelaImpressao.close();
    };
}

// --- FUNÇÃO PARA ENVIAR MENSAGEM VIA WHATSAPP ---
function sendWhatsAppMessage(order) {
    if (!order || !order.cliente.telefone) {
        alert("Informações do cliente ausentes para enviar mensagem.");
        return;
    }

    // Remove caracteres não numéricos do telefone
    const telefone = order.cliente.telefone.replace(/\D/g, '');
    const nomeCliente = order.cliente.nome.split(' ')[0]; // Pega apenas o primeiro nome
    const mensagem = `Olá, ${nomeCliente}! Gostaríamos de informar que seu pedido já está sendo preparado. Em breve estará a caminho!`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`;

    window.open(whatsappUrl, '_blank');
}

onValue(ordersRef, (snapshot) => {
    ordersList.innerHTML = '';
    if (snapshot.exists()) {
        const orders = snapshot.val();
        
        // Lógica do som de notificação
        const currentOrderCount = Object.keys(orders).length;
        if (currentOrderCount > lastOrderCount && lastOrderCount !== 0) {
            notificationSound.play().catch(error => {
                console.error("Erro ao tocar o som: ", error);
            });
        }
        lastOrderCount = currentOrderCount;

        const orderKeys = Object.keys(orders).reverse();
        
        orderKeys.forEach(key => {
            const order = orders[key];
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            
            const clienteInfo = order.cliente || { nome: 'Não informado', endereco: 'Não informado', telefone: 'Não informado' };
            if (clienteInfo.endereco === "Retirada no Local") {
                orderItem.classList.add('pedido-retirada');
            }

            let itemsHtml = '';
            if (Array.isArray(order.itens) && order.itens.length > 0 && typeof order.itens[0] === 'object') {
                itemsHtml = order.itens.map(item => `<li>${item.nome} - R$ ${item.preco.toFixed(2).replace('.', ',')}</li>`).join('');
            } else if (Array.isArray(order.itens)) {
                itemsHtml = order.itens.map(item => `<li>${item}</li>`).join('');
            } else {
                itemsHtml = `<li>${order.itens}</li>`;
            }

            const telefoneFormatado = clienteInfo.telefone ? clienteInfo.telefone.replace(/\D/g, '') : '';
            const whatsappLink = `https://wa.me/55${telefoneFormatado}`;
            const trocoHtml = order.formaPagamento === 'Dinheiro' ? `<p><strong>Troco para:</strong> ${order.troco}</p><p><strong>Troco devido:</strong> ${order.trocoDevido}</p>` : '';
            
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
                    <button class="btn-whatsapp" data-order-id="${key}">Enviar Mensagem</button>
                </div>
            `;
            ordersList.appendChild(orderItem);
        });

        document.querySelectorAll('.btn-ready').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                if (confirm("Tem certeza que deseja marcar este pedido como pronto?")) {
                    removeOrder(orderId);
                }
            });
        });
        
        document.querySelectorAll('.btn-print').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                const orderToPrint = orders[orderId];
                printOrder(orderToPrint);
            });
        });

        document.querySelectorAll('.btn-whatsapp').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderId = event.target.dataset.orderId;
                const orderToMessage = orders[orderId];
                sendWhatsAppMessage(orderToMessage);
            });
        });

    } else {
        ordersList.innerHTML = '<p>Nenhum pedido novo.</p>';
        lastOrderCount = 0;
    }
});

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