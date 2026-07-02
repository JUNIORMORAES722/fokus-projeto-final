// SELETORES: Pegamos todos os elementos da parte de tarefas
const btnAdicionarTarefa = document.querySelector('.app__button--add-task') // Botão + Adicionar
const formAdicionarTarefa = document.querySelector('.app__form-add-task') // O form que aparece/esconde
const textarea = document.querySelector('.app__form-textarea') // Campo de texto
const ulTarefas = document.querySelector('.app__section-task-list') // A <ul> onde as <li> vão entrar
const paragrafoDescricaoTarefa = document.querySelector('.app__section-active-task-description') // #Em andamento:
const btnRemoverConcluidas = document.querySelector('#btn-remover-concluidas')
const btnRemoverTodas = document.querySelector('#btn-remover-todas')

// ESTADO: Variáveis globais desse módulo
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [] // Carrega do navegador. Se vazio, cria []
let tarefaSelecionada = null // Guarda qual tarefa tá ativa agora
let liTarefaSelecionada = null // Guarda a <li> visual da tarefa ativa

/**
 * FUNÇÃO: atualizarTarefas
 * PRA QUE: Salvar o array `tarefas` no localStorage do navegador
 * localStorage só aceita string, então usamos JSON.stringify
 */
function atualizarTarefas () {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
}

/**
 * FUNÇÃO: criarElementoTarefa
 * PRA QUE: Pega 1 objeto {descricao: '', completa: false} e vira uma <li> bonita na tela
 * RECEBE: tarefa = objeto da tarefa
 * RETORNA: li = elemento HTML pronto
 */
function criarElementoTarefa(tarefa) {
    // 1. Cria a <li> principal
    const li = document.createElement('li')
    li.classList.add('app__section-task-list-item')

    // 2. Cria o SVG do check. Ele fica cinza ou verde depois
    const svg = document.createElement('svg')
    svg.innerHTML = `
        <svg class="app__section-task-icon-status" width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#FFF"></circle>
            <path d="M9 16.1719L19.5938 5.57812L21 6.98438L9 18.9844L3.42188 13.4062L4.82812 12L9 16.1719Z"
                fill="#01080E"></path>
        </svg>
    `
    // 3. Cria o <p> com o texto da tarefa
    const paragrafo = document.createElement('p')
    paragrafo.textContent = tarefa.descricao
    paragrafo.classList.add('app__section-task-list-item-description')

    // 4. Cria o botão de editar lápis
    const botao = document.createElement('button')
    botao.classList.add('app_button-edit')

    botao.onclick = () => {
        // prompt: Janela que pede texto pro usuário
        const novaDescricao = prompt("Qual é o novo nome da tarefa?")
        if (novaDescricao) { // Só atualiza se não for vazio/cancelar            
            paragrafo.textContent = novaDescricao // Atualiza na tela
            tarefa.descricao = novaDescricao // Atualiza no array
            atualizarTarefas() // Salva no localStorage
        }
    }

    const imagemBotao = document.createElement('img')
    imagemBotao.setAttribute('src', './imagens/edit.png') // CORRIGIDO: era /imagens
    botao.append(imagemBotao)

    // Monta a <li>: SVG + Texto + Botão
    li.append(svg)
    li.append(paragrafo)
    li.append(botao)

   // Se a tarefa já tá completa, deixa cinza e trava o botão
   if (tarefa.completa) {
        li.classList.add('app__section-task-list-item-complete')
        botao.setAttribute('disabled', 'disabled') // disabled = não clica
    } else {
        // Se não tá completa, deixa clicar pra selecionar
        li.onclick = () => {
            // Remove a seleção de todas as outras <li>
            document.querySelectorAll('.app__section-task-list-item-active')
                .forEach(elemento => {
                    elemento.classList.remove('app__section-task-list-item-active')
                })
            // Se clicou 2x na mesma, desseleciona
            if (tarefaSelecionada == tarefa) {
                paragrafoDescricaoTarefa.textContent = ''
                tarefaSelecionada = null
                liTarefaSelecionada = null
                return
            }
            // Seleciona a nova
            tarefaSelecionada = tarefa
            liTarefaSelecionada = li
            paragrafoDescricaoTarefa.textContent = tarefa.descricao // Mostra em "#Em andamento:"

            li.classList.add('app__section-task-list-item-active') // Borda azul
        }
    }

    return li
}   

// EVENTO: Clicar em "Adicionar nova tarefa" mostra/esconde o form
btnAdicionarTarefa.addEventListener('click', () => {
    formAdicionarTarefa.classList.toggle('hidden') // toggle = se tem, tira. Se não tem, põe.
})

// EVENTO: Enviar o form de nova tarefa
formAdicionarTarefa.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Evita que a página recarregue
    const tarefa = {
        descricao: textarea.value // Pega o texto digitado
        // completa: false // Se não definir, fica undefined = false na prática
    }
    tarefas.push(tarefa) // Adiciona no array
    const elementoTarefa = criarElementoTarefa(tarefa) // Vira HTML
    ulTarefas.append(elementoTarefa) // Joga na tela
    atualizarTarefas() // Salva
    textarea.value = '' // Limpa o campo
    formAdicionarTarefa.classList.add('hidden') // Esconde o form de novo
})

// READ: Quando a página carrega, lê o localStorage e monta tudo na tela
tarefas.forEach(tarefa => {
    const elementoTarefa = criarElementoTarefa(tarefa)
    ulTarefas.append(elementoTarefa)
});

// EVENTO CUSTOMIZADO: Vem do script.js quando o timer de Foco acaba
document.addEventListener('FocoFinalizado', () => {
    if (tarefaSelecionada && liTarefaSelecionada) {
        liTarefaSelecionada.classList.remove('app__section-task-list-item-active') // Tira azul
        liTarefaSelecionada.classList.add('app__section-task-list-item-complete') // Põe cinza/verde
        liTarefaSelecionada.querySelector('button').setAttribute('disabled', 'disabled') // Trava lápis
        tarefaSelecionada.completa = true // Marca no array
        atualizarTarefas() // Salva
    }
})

/**
 * FUNÇÃO: removerTarefas
 * PRA QUE: Apaga tarefas da tela e do array
 * RECEBE: somenteCompletas = true apaga só as cinzas. false apaga tudo.
 */
const removerTarefas = (somenteCompletas) => {
    let seletor = ".app__section-task-list-item"
    if (somenteCompletas) {
        seletor = ".app__section-task-list-item-complete"
    }
    // Remove da tela
    document.querySelectorAll(seletor).forEach(elemento => {
        elemento.remove()
    })
    // Remove do array
    tarefas = somenteCompletas ? tarefas.filter(tarefa => !tarefa.completa) : [] // CORRIGIDO: era `tarefa.completa`
    atualizarTarefas()
} 

// EVENTOS: Botões do menu "..."
btnRemoverConcluidas.onclick = () => removerTarefas(true) // true = só concluídas
btnRemoverTodas.onclick = () => removerTarefas(false) // false = todas