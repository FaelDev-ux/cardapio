document.addEventListener('DOMContentLoaded', () => {
  // Seleciona todas as seções que podem ser expandidas/recolhidas
  const secoes = document.querySelectorAll('.secao')

  secoes.forEach((secao, index) => {
    // Busca a sublista correspondente a cada seção pelo ID
    const sublista = document.getElementById(`sublista${index + 1}`)
    if (!sublista) return // Se não existir, ignora

    // Deixa a sublista visível e ajusta a altura máxima para mostrar o conteúdo
    sublista.classList.add('show')
    sublista.style.maxHeight = sublista.scrollHeight + 'px'

    // Adiciona evento de clique para expandir/recolher a sublista
    secao.addEventListener('click', () => {
      if (sublista.classList.contains('show')) {
        // Se já está aberta, fecha
        sublista.classList.remove('show')
        sublista.style.maxHeight = null
      } else {
        // Se está fechada, abre
        sublista.classList.add('show')
        sublista.style.maxHeight = sublista.scrollHeight + 'px'
      }
    })
  })

  // Função para trocar a logo conforme o tema do sistema (claro/escuro)
  function trocarLogoPorTema() {
    const logo = document.getElementById('logo')
    if (!logo) return // Se não existir, ignora
    const temaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
    logo.src = temaEscuro ? '12.jpg' : '10.jpg' // Define a imagem conforme o tema
  }

  trocarLogoPorTema() // Troca logo ao carregar a página
  // Troca logo automaticamente se o usuário mudar o tema do sistema
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', trocarLogoPorTema)

  // Pré-carrega a imagem de fundo e só adiciona a classe quando estiver carregada
  const fundo = new Image()
  fundo.src = '11.jpg'
  fundo.onload = () => {
    document.body.classList.add('fundo-carregado')
  }

  // Mostra ou esconde o botão "voltar ao topo" conforme o scroll
  const btnTopo = document.getElementById('btn-topo')
  if (btnTopo) {
    window.addEventListener('scroll', () => {
      btnTopo.style.display = window.scrollY > 200 ? 'block' : 'none'
      btnTopo.classList.toggle('show', window.scrollY > 200)
    })

    // Ao clicar no botão, volta suavemente para o topo da página
    btnTopo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // Busca dinâmica: filtra itens das sublistas conforme o texto digitado
  const searchInput = document.getElementById('searchInput')
  const buscaDestaque = document.getElementById('busca-destaque')
  if (searchInput) {
    let debounceTimer
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const termoBusca = this.value.toLowerCase().trim()
        const itens = document.querySelectorAll('.sublista li')
        let resultados = []

        itens.forEach((item, idx) => {
          const nomeSpan = item.querySelector('.nome-item')
          const nome = nomeSpan?.textContent.toLowerCase() || ''
          if (nome.includes(termoBusca) && termoBusca.length > 0) {
            resultados.push(
              `<li data-idx="${idx}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:20px;">
          <strong>${nomeSpan.textContent}</strong>
        </div>
      </li>`
            )
          }
        })

        // Mostra ou esconde o popup de destaque
        if (buscaDestaque) {
          if (resultados.length > 0) {
            buscaDestaque.innerHTML = `<ul>${resultados.join('')}</ul>`
            buscaDestaque.style.display = 'block'

            // Adiciona evento de clique para cada resultado
            buscaDestaque.querySelectorAll('li').forEach(li => {
              li.addEventListener('click', function () {
                const idx = this.getAttribute('data-idx')
                const item = document.querySelectorAll('.sublista li')[idx]
                if (item) {
                  item.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  // Opcional: destaca o item por alguns segundos
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

        // Mostra ou esconde a mensagem de nenhum resultado
        const msgBusca = document.getElementById('msgBusca')
        if (msgBusca) {
          msgBusca.style.display =
            resultados.length === 0 && termoBusca.length > 0 ? 'block' : 'none'
        }
      }, 200)
    })

    // Esconde o popup ao perder o foco
    searchInput.addEventListener('blur', function () {
      setTimeout(() => {
        if (buscaDestaque) buscaDestaque.style.display = 'none'
      }, 200)
    })
  }

  console.log(
    '%cDesenvolvido por faeldev-ux 🦊',
    'color:#b30000;font-weight:bold;font-size:14px;'
  )
})
