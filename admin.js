// =========================================================
// ADMIN.JS - VISUALIZAÇÃO DE DADOS EM TEMPO REAL
// =========================================================

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsflRlDu2Zkoab40bB6C5mXc_y2LmS420",
  authDomain: "supremo-oriente-chat.firebaseapp.com",
  projectId: "supremo-oriente-chat",
  storageBucket: "supremo-oriente-chat.firebasestorage.app",
  messagingSenderId: "897375368955",
  appId: "1:897375368955:web:486c54475de7e916f0a25e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referências para os caminhos dos dados no banco de dados
const ordersRef = ref(database, 'pedidos');
const messagesRef = ref(database, 'messages');

// Referências para os elementos HTML
const ordersList = document.getElementById('orders-list');
const chatList = document.getElementById('chat-list');

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
            
            // Adicionamos o botão de apagar e um data-key para referenciar o pedido
            orderItem.innerHTML = `
                <div class="order-header">
                    <span>Pedido de <strong>R$ ${order.total}</strong></span>
                    <button class="delete-btn" data-key="${key}">Apagar</button>
                    <span class="order-date">${order.data}</span>
                </div>
                <div class="order-details">
                    <ul>${itemsHtml}</ul>
                </div>
            `;
            ordersList.appendChild(orderItem);
        });

        // Adicionamos um ouvinte de evento para todos os botões de apagar
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderKey = event.target.dataset.key;
                const orderRefToDelete = ref(database, `pedidos/${orderKey}`);
                
                if (confirm('Tem certeza que deseja apagar este pedido?')) {
                    remove(orderRefToDelete)
                        .then(() => {
                            console.log('Pedido apagado com sucesso!');
                        })
                        .catch((error) => {
                            console.error('Erro ao apagar o pedido:', error);
                        });
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