// =========================================================
// ADMIN.JS - VISUALIZAÇÃO DE DADOS EM TEMPO REAL E EXCLUSÃO
// =========================================================

// Importa as funções necessárias do Firebase, incluindo 'remove'
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Sua configuração do Firebase (COPIE E COLE A SUA CONFIGURAÇÃO AQUI)
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
            
            let itemsHtml = order.itens.map(item => `<li>${item}</li>`).join('');
            
            // Adiciona o botão "Pronto" com o ID do pedido
            orderItem.innerHTML = `
                <div class="order-header">
                    <span>Pedido de <strong>R$ ${order.total}</strong></span>
                    <span class="order-date">${order.data}</span>
                </div>
                <div class="order-details">
                    <ul>${itemsHtml}</ul>
                </div>
                <div class="order-actions">
                    <button class="btn-ready" data-order-id="${key}">Pronto</button>
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

    } else {
        ordersList.innerHTML = '<p>Nenhum pedido novo.</p>';
    }
});

// Escuta e exibe as mensagens do chat em tempo real
onValue(messagesRef, (snapshot) => {
    chatList.innerHTML = ''; // Limpa a lista antes de atualizar
    if (snapshot.exists()) {
        const messages = snapshot.val();
        
        // Converte o objeto de mensagens em um array
        const messageKeys = Object.keys(messages);

        messageKeys.forEach(key => {
            const message = messages[key];
            const messageItem = document.createElement('div');
            messageItem.classList.add('chat-message-admin');
            
            // Adiciona classe para diferenciar mensagens do usuário
            if (message.sender === 'user') {
                messageItem.classList.add('user');
            }
            
            messageItem.innerHTML = `
                <span>${message.text}</span>
                <span class="chat-date">${message.timestamp}</span>
            `;
            chatList.appendChild(messageItem);
        });
        chatList.scrollTop = chatList.scrollHeight; // Rola para o final da lista
    } else {
        chatList.innerHTML = '<p>Nenhuma mensagem nova.</p>';
    }
});