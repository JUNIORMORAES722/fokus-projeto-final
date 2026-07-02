// SELETORES: Pegamos os elementos do HTML pra mexer neles via JS
const html = document.querySelector('html') // A tag <html> inteira
const focoBt = document.querySelector('.app__card-button--foco') // Botão Foco
const curtoBt = document.querySelector('.app__card-button--curto') // Botão Descanso Curto
const longoBt = document.querySelector('.app__card-button--longo') // Botão Descanso Longo
const banner = document.querySelector('.app__image') // A imagem do cara com fone
const titulo = document.querySelector('.app__title') // O H1 de texto
const botoes = document.querySelectorAll('.app__card-button') // Todos os 3 botões
const startPauseBt = document.querySelector('#start-pause') // Botão Começar/Pausar
const musicaFocoInput = document.querySelector('#alternar-musica') // Checkbox da música
const iniciarOuPausarBt = document.querySelector('#start-pause span') // O texto "Começar"
const iniciarOuPausarBtIcone = document.querySelector(".app__card-primary-butto-icon") // O ícone Play/Pause
const tempoNaTela = document.querySelector('#timer') // O div 00:30

// AUDIOS: Criamos objetos Audio. O ./ é caminho relativo = funciona no Pages
const musica = new Audio('./sons/luna-rise-part-one.mp3') // CORRIGIDO: era /sons
const audioPlay = new Audio('./sons/play.wav');            // CORRIGIDO: era /sons
const audioPausa = new Audio('./sons/pause.mp3');          // CORRIGIDO: era /sons
const audioTempoFinalizado = new Audio('./sons/beep.mp3')  // Já tava certo

// VARIÁVEIS DE ESTADO: Guardam dados do app enquanto ele roda
let tempoDecorridoEmSegundos = 30 // Começa em 30s só pra teste. Era 1500 = 25min
let intervaloId = null // Vai guardar o ID do setInterval pra poder parar depois

musica.loop = true // Faz a música de fundo repetir infinitamente

// EVENTO: Toggle da Música. CORRIGIDO: Só toca depois do 1º clique no site
musicaFocoInput.addEventListener('change', () => {
    // BUG CORRIGIDO: Navegador só deixa tocar audio depois de interação do usuário.
    // Como o usuário clicou no checkbox, agora pode tocar.
    if(musica.paused) {
        musica.play().catch(() => { 
            // .catch: Se o Chrome bloquear, não quebra o site. Só ignora.
            console.log("Autoplay bloqueado. Clique em Começar primeiro.")
        })
    } else {
        musica.pause()
    }
})

// EVENTOS: Botões de contexto. Trocam o timer e o tema
focoBt.addEventListener('click', () => {
    tempoDecorridoEmSegundos = 30 // 25min = 1500. 30s = teste
    alterarContexto('foco')
    focoBt.classList.add('active') // Adiciona borda roxa no botão ativo
})

curtoBt.addEventListener('click', () => {
    tempoDecorridoEmSegundos = 5 // 5min = 300. 5s = teste
    alterarContexto('descanso-curto')
    curtoBt.classList.add('active')
})

longoBt.addEventListener('click', () => {
    tempoDecorridoEmSegundos = 15 // 15min = 900. 15s = teste
    alterarContexto('descanso-longo')
    longoBt.classList.add('active')
})

/**
 * FUNÇÃO: alterarContexto
 * PRA QUE: Troca o tema da tela: imagem, cor e texto
 * RECEBE: contexto = 'foco' | 'descanso-curto' | 'descanso-longo'
 */
function alterarContexto(contexto) {
    mostrarTempo() // Atualiza o timer na tela
    // Remove .active de todos os botões pra só 1 ficar aceso
    botoes.forEach(function (botao){ // Mudei 'contexto' pra 'botao' pra não confundir
        botao.classList.remove('active')
    })
    html.setAttribute('data-contexto', contexto) // O CSS usa isso pra trocar cor de fundo
    banner.setAttribute('src', `./imagens/${contexto}.png`) // CORRIGIDO: ./imagens
    
    // Troca o texto do H1 dependendo do contexto
    switch (contexto) {
        case "foco":
            titulo.innerHTML = `
            Otimize sua produtividade,<br>
                <strong class="app__title-strong">mergulhe no que importa.</strong>
            `
            break;
        case "descanso-curto":
            titulo.innerHTML = `
            Que tal dar uma respirada? <strong class="app__title-strong">Faça uma pausa curta!</strong>
            ` 
            break;
        case "descanso-longo":
            titulo.innerHTML = `
            Hora de voltar à superfície.<strong class="app__title-strong"> Faça uma pausa longa.</strong>
            `
            break; // Adicionei o break que tava faltando
        default:
            break;
    }
}

/**
 * FUNÇÃO: contagemRegressiva
 * PRA QUE: Roda a cada 1 segundo. Diminui o timer.
 */
const contagemRegressiva = () => {
    if(tempoDecorridoEmSegundos <= 0){ // Acabou o tempo
        audioTempoFinalizado.play()
        alert('Tempo finalizado!')
        const focoAtivo = html.getAttribute('data-contexto') == 'foco'
        if (focoAtivo) {
            // Dispara evento pro script-crud.js saber que foco acabou
            const evento = new CustomEvent('FocoFinalizado')
            document.dispatchEvent(evento)
        }
        zerar() // Para o timer
        return
    }
    tempoDecorridoEmSegundos -= 1 // -1 segundo
    mostrarTempo() // Atualiza na tela
}

// EVENTO: Clique no botão Começar/Pausar
startPauseBt.addEventListener('click', iniciarOuPausar)

/**
 * FUNÇÃO: iniciarOuPausar
 * PRA QUE: Inicia ou pausa o setInterval
 */
function iniciarOuPausar() {
    if(intervaloId){ // Se já tem um timer rodando = PAUSAR
        audioPausa.play()
        zerar()
        return
    }
    // Se não tem timer = INICIAR. CORRIGIDO: Só aqui pode tocar som sem bloqueio
    audioPlay.play()
    intervaloId = setInterval(contagemRegressiva, 1000) // Roda contagemRegressiva a cada 1000ms = 1s
    iniciarOuPausarBt.textContent = "Pausar"
    iniciarOuPausarBtIcone.setAttribute('src', `./imagens/pause.png`) // CORRIGIDO: ./
}

/**
 * FUNÇÃO: zerar
 * PRA QUE: Para o timer e volta o botão pra "Começar"
 */
function zerar() {
    clearInterval(intervaloId) // Para o setInterval
    iniciarOuPausarBt.textContent = "Começar"
    iniciarOuPausarBtIcone.setAttribute('src', `./imagens/play_arrow.png`) // CORRIGIDO: ./
    intervaloId = null // Limpa o ID
}

/**
 * FUNÇÃO: mostrarTempo
 * PRA QUE: Converte segundos -> 00:30 e joga na tela
 */
function mostrarTempo() {
    const tempo = new Date(tempoDecorridoEmSegundos * 1000) // Date precisa de ms
    const tempoFormatado = tempo.toLocaleTimeString('pt-Br', {minute: '2-digit', second: '2-digit'})
    tempoNaTela.innerHTML = `${tempoFormatado}`
}

mostrarTempo() // Roda 1 vez no início pra mostrar 00:30