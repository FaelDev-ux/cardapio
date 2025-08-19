// Importe as funções necessárias do Firebase SDKs que você precisa
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Sua configuração do Firebase
// SUBSTITUA PELAS SUAS PRÓPRIAS CREDENCIAIS
const firebaseConfig = {
  apiKey: "AIzaSyDsflR1Du2Zkoab40bB6C5mxc_y2LMS420",
  authDomain: "supremo-oriente-chat.firebaseapp.com",
  projectId: "supremo-oriente-chat",
  storageBucket: "supremo-oriente-chat.appspot.com",
  messagingSenderId: "897375368955",
  appId: "1:897375368955:web:486c54475de7e916f0a25e"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referência para os dados no banco de dados
const ordersRef = ref(database, 'pedidos');

// Referências para os elementos HTML
const ordersList = document.getElementById('orders-list');

// Escuta e exibe os pedidos em tempo real
onValue(ordersRef, (snapshot) => {
  ordersList.innerHTML = ''; // Limpa a lista antes de atualizar

  if (snapshot.exists()) {
    const orders = snapshot.val();
    
    // Converte o objeto de pedidos em um array e reverte para mostrar o mais recente primeiro
    const ordersArray = Object.keys(orders).map(key => ({
      ...orders[key],
      id: key
    })).reverse();

    ordersArray.forEach((order) => {
      const orderItem = document.createElement('div');
      orderItem.classList.add('order-item');
      
      const orderHeader = document.createElement('div');
      orderHeader.classList.add('order-header');
      orderHeader.innerHTML = `Pedido #${order.id.slice(0, 5)}`;
      
      const orderDate = document.createElement('span');
      orderDate.classList.add('order-date');
      orderDate.textContent = order.data;
      
      const orderDetails = document.createElement('div');
      orderDetails.classList.add('order-details');
      
      const itemList = document.createElement('ul');
      if (order.itens && Array.isArray(order.itens)) {
        order.itens.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `${item.quantidade}x ${item.nome} - R$ ${item.preco.toFixed(2)}`;
          itemList.appendChild(li);
        });
      }

      const total = document.createElement('p');
      total.textContent = `Total: R$ ${order.total.toFixed(2)}`;
      
      orderItem.appendChild(orderHeader);
      orderHeader.appendChild(orderDate);
      orderDetails.appendChild(itemList);
      orderDetails.appendChild(total);
      orderItem.appendChild(orderDetails);
      ordersList.appendChild(orderItem);
    });
  } else {
    ordersList.innerHTML = '<p>Nenhum pedido novo.</p>';
  }
});