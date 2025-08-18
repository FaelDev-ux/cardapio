document.addEventListener('DOMContentLoaded', () => {

  // --- LÓGICA DO CARDÁPIO (Aprimorada) ---

  // Seleciona todas as seções que podem ser expandidas/recolhidas
  const secoes = document.querySelectorAll('.secao');

  secoes.forEach(secao => {
    const sublista = secao.nextElementSibling;
    
    if (sublista && sublista.classList.contains('sublista')) {
      sublista.classList.add('show');
      sublista.style.maxHeight = sublista.scrollHeight + 'px';

      secao.addEventListener('click', () => {
        if (sublista.style.maxHeight) {
          sublista.style.maxHeight = null;
          sublista.classList.remove('show');
        } else {
          sublista.style.maxHeight = sublista.scrollHeight + 'px';
          sublista.classList.add('show');
        }
      });
    }
  });


  // --- LÓGICA DO POP-UP (NOVA) ---

  const popupContainer = document.getElementById('popup-container');
  const closeBtn = document.querySelector('.close-btn');
  const popupLinks = document.querySelectorAll('.popup-link');

  // Seleciona o cabeçalho para obter a altura
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


  // --- OUTRAS FUNÇÕES DO SEU CÓDIGO ORIGINAL (Mantidas) ---

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

  // --- LÓGICA DO CABEÇALHO ROTATIVO (Sticky) ---
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
        const itens = document.querySelectorAll('.sublista li');
        let resultados = [];

        itens.forEach((item, idx) => {
          const nomeSpan = item.querySelector('.nome-item');
          const nome = nomeSpan?.textContent.toLowerCase() || '';
          if (nome.includes(termoBusca) && termoBusca.length > 0) {
            resultados.push(
              `<li data-idx="${idx}">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:20px;">
                      <strong>${nomeSpan.textContent}</strong>
                  </div>
              </li>`
            );
          }
        });

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

  console.log('%cDesenvolvido por faeldev-ux 🦊', 'color:#b30000;font-weight:bold;font-size:14px;');

});