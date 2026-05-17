const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalImage = document.getElementById("modal-image");
const commentsList = document.getElementById("comments-list");
const commentText = document.getElementById("comment-text");
const publishComment = document.getElementById("publish-comment");
const modalStars = document.getElementById("modal-stars");
const modalFavoriteBtn = document.getElementById("modal-favorite-btn");

const topbar = document.querySelector(".topbar");

const searchTrigger = document.getElementById("search-trigger");
const searchOverlay = document.getElementById("search-overlay");
const searchDialogClose = document.getElementById("search-dialog-close");
const searchInput = document.getElementById("search-input");
const searchClear = document.getElementById("search-clear");
const searchStatus = document.getElementById("search-status");
const searchResults = document.getElementById("search-results");

let tituloAtualId = null;
let tituloAtualFavorito = false;
let searchTimeout = null;
let ultimoScroll = window.scrollY;

function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute("content") : "";
}

/* =========================
   TOAST
========================= */

function mostrarToastSistema(icone, titulo, texto) {
    const antigo = document.querySelector(".recommendation-toast");

    if (antigo) {
        antigo.remove();
    }

    const aviso = document.createElement("div");
    aviso.className = "recommendation-toast";

    aviso.innerHTML = `
        <div class="recommendation-toast-icon">${icone}</div>

        <div>
            <strong>${titulo}</strong>
            <span>${texto}</span>
        </div>
    `;

    document.body.appendChild(aviso);

    setTimeout(() => {
        aviso.classList.add("show");
    }, 20);

    setTimeout(() => {
        aviso.classList.remove("show");

        setTimeout(() => {
            aviso.remove();
        }, 280);
    }, 2300);
}

function mostrarAvisoRecomendacao() {
    mostrarToastSistema(
        "✨",
        "Recomendações atualizadas",
        "Estamos ajustando os títulos ao seu gosto..."
    );
}

/* =========================
   TOPBAR
========================= */

function controlarTopbarNoScroll() {
    if (!topbar) return;

    const scrollAtual = window.scrollY;
    const modalAberto = document.body.classList.contains("modal-open");
    const pesquisaAberta = document.body.classList.contains("search-open");

    if (modalAberto || pesquisaAberta) {
        topbar.classList.remove("topbar-hidden");
        topbar.classList.add("topbar-soft");
        ultimoScroll = scrollAtual;
        return;
    }

    if (scrollAtual > 120 && scrollAtual > ultimoScroll) {
        topbar.classList.add("topbar-hidden");
    } else {
        topbar.classList.remove("topbar-hidden");
    }

    if (scrollAtual > 40) {
        topbar.classList.add("topbar-soft");
    } else {
        topbar.classList.remove("topbar-soft");
    }

    ultimoScroll = scrollAtual;
}

window.addEventListener("scroll", controlarTopbarNoScroll);

/* =========================
   FAVORITOS
========================= */

function atualizarBotaoFavorito(botao, favoritado) {
    if (!botao) return;

    botao.dataset.favorited = favoritado ? "true" : "false";

    if (favoritado) {
        botao.classList.add("active");
        botao.innerText = "♥";
        botao.setAttribute("aria-label", "Remover dos favoritos");
    } else {
        botao.classList.remove("active");
        botao.innerText = "♡";
        botao.setAttribute("aria-label", "Favoritar");
    }
}

function atualizarModalFavorito(favoritado) {
    tituloAtualFavorito = favoritado;

    if (!modalFavoriteBtn) return;

    modalFavoriteBtn.dataset.favorited = favoritado ? "true" : "false";

    const span = modalFavoriteBtn.querySelector("span");
    const strong = modalFavoriteBtn.querySelector("strong");

    if (favoritado) {
        modalFavoriteBtn.classList.add("active");
        span.innerText = "♥";
        strong.innerText = "Favoritado";
    } else {
        modalFavoriteBtn.classList.remove("active");
        span.innerText = "♡";
        strong.innerText = "Favoritar";
    }
}

function atualizarTodosFavoritos(titleId, favoritado) {
    document.querySelectorAll(`.favorite-card-btn[data-title-id="${titleId}"]`).forEach(botao => {
        atualizarBotaoFavorito(botao, favoritado);
    });

    document.querySelectorAll(`.card[data-id="${titleId}"]`).forEach(card => {
        card.dataset.favorite = favoritado ? "true" : "false";
    });

    if (String(tituloAtualId) === String(titleId)) {
        atualizarModalFavorito(favoritado);
    }
}

function removerCardDaAbaFavoritos(titleId) {
    document.querySelectorAll(`#favoritos .card[data-id="${titleId}"]`).forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "scale(0.94)";

        setTimeout(() => {
            card.remove();
            verificarFavoritosVazio();
        }, 220);
    });
}

function verificarFavoritosVazio() {
    const favoritosSection = document.getElementById("favoritos");

    if (!favoritosSection) return;

    const cards = favoritosSection.querySelectorAll(".card");
    const container = favoritosSection.querySelector(".favorites-cards");

    if (cards.length > 0) return;

    if (!container.querySelector(".favorites-empty")) {
        container.innerHTML = `
            <div class="favorites-empty">
                <div class="favorites-empty-icon">♡</div>
                <h4>Nenhum favorito ainda</h4>
                <p>Clique no coração de um filme ou série para salvar aqui.</p>
            </div>
        `;
    }
}

async function alternarFavorito(titleId) {
    if (!titleId) return;

    try {
        const response = await fetch(`/app/api/titles/${titleId}/favorite/`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken()
            }
        });

        const data = await response.json();

        if (
            data.status !== "favorito_adicionado" &&
            data.status !== "favorito_removido"
        ) {
            alert(data.mensagem || "Erro ao alterar favorito.");
            return;
        }

        const favoritado = data.favorito === true;

        atualizarTodosFavoritos(titleId, favoritado);

        if (!favoritado) {
            removerCardDaAbaFavoritos(titleId);
        }

        if (favoritado) {
            mostrarToastSistema(
                "♥",
                "Adicionado aos favoritos",
                "Esse título foi salvo na sua lista."
            );
        } else {
            mostrarToastSistema(
                "♡",
                "Removido dos favoritos",
                "Esse título saiu da sua lista."
            );
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
    }
}

/* =========================
   PESQUISA
========================= */

function abrirPesquisa() {
    if (!searchOverlay) return;

    searchOverlay.classList.add("open");
    document.body.classList.add("search-open");

    if (topbar) {
        topbar.classList.add("topbar-soft");
    }

    setTimeout(() => {
        searchInput.focus();
    }, 120);
}

function fecharPesquisa() {
    if (!searchOverlay) return;

    searchOverlay.classList.remove("open");
    document.body.classList.remove("search-open");

    searchInput.value = "";
    searchResults.innerHTML = "";
    searchStatus.style.display = "block";
    searchStatus.innerText = "Digite pelo menos duas letras para pesquisar.";

    if (topbar) {
        topbar.classList.remove("topbar-soft");
    }
}

function limparPesquisa() {
    searchInput.value = "";
    searchResults.innerHTML = "";
    searchStatus.style.display = "block";
    searchStatus.innerText = "Digite pelo menos duas letras para pesquisar.";
    searchInput.focus();
}

async function buscarTitulos(termo) {
    searchStatus.style.display = "block";
    searchStatus.innerText = "Pesquisando...";
    searchResults.innerHTML = "";

    try {
        const response = await fetch(`/app/api/search/?q=${encodeURIComponent(termo)}`, {
            method: "GET",
            credentials: "same-origin"
        });

        const data = await response.json();

        if (data.status !== "ok") {
            searchStatus.innerText = "Erro ao pesquisar.";
            return;
        }

        renderizarResultadosBusca(data.resultados);

    } catch (error) {
        console.error(error);
        searchStatus.innerText = "Erro ao conectar com o servidor.";
    }
}

function renderizarResultadosBusca(resultados) {
    searchResults.innerHTML = "";

    if (!resultados.length) {
        searchStatus.style.display = "block";
        searchStatus.innerText = "Nenhum resultado encontrado.";
        return;
    }

    searchStatus.style.display = "none";

    resultados.forEach(item => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "search-card";

        const poster = document.createElement("div");
        poster.className = "search-card-poster";

        if (item.image) {
            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.title;
            poster.appendChild(img);
        } else {
            poster.innerText = "Sem imagem";
        }

        const content = document.createElement("div");
        content.className = "search-card-content";

        const top = document.createElement("div");
        top.className = "search-card-top";

        const badge = document.createElement("span");
        badge.className = "search-card-badge";
        badge.innerText = item.type_label || "Título";

        const year = document.createElement("span");
        year.className = "search-card-year";
        year.innerText = item.release_year ? item.release_year : "Ano não informado";

        top.appendChild(badge);
        top.appendChild(year);

        const title = document.createElement("strong");
        title.innerText = item.title || "Sem título";

        const favMini = document.createElement("span");
        favMini.className = item.is_favorite ? "search-mini-fav active" : "search-mini-fav";
        favMini.innerText = item.is_favorite ? "♥ Favorito" : "♡ Não salvo";

        content.appendChild(top);
        content.appendChild(title);
        content.appendChild(favMini);

        card.appendChild(poster);
        card.appendChild(content);

        card.addEventListener("click", () => {
            fecharPesquisa();

            abrirModalPorDados({
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image,
                isFavorite: item.is_favorite
            });
        });

        searchResults.appendChild(card);
    });
}

/* =========================
   JANELAS PERSONALIZADAS
========================= */

function criarJanelaBase() {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";

    document.body.appendChild(overlay);

    return overlay;
}

function fecharJanelaPersonalizada(overlay) {
    if (!overlay) return;

    overlay.classList.add("closing");

    setTimeout(() => {
        overlay.remove();
    }, 180);
}

function abrirJanelaEditarComentario(commentId, textoAtual) {
    const overlay = criarJanelaBase();

    overlay.innerHTML = `
        <div class="custom-dialog-card">
            <button type="button" class="custom-dialog-close">×</button>

            <div class="custom-dialog-icon edit">✎</div>

            <h2>Editar comentário</h2>

            <p>Altere seu comentário abaixo e salve a nova versão.</p>

            <textarea class="custom-dialog-textarea" placeholder="Digite seu comentário..."></textarea>

            <div class="custom-dialog-actions">
                <button type="button" class="custom-dialog-btn secondary">
                    Cancelar
                </button>

                <button type="button" class="custom-dialog-btn primary">
                    Salvar alteração
                </button>
            </div>
        </div>
    `;

    const textarea = overlay.querySelector(".custom-dialog-textarea");
    const closeBtn = overlay.querySelector(".custom-dialog-close");
    const cancelBtn = overlay.querySelector(".custom-dialog-btn.secondary");
    const saveBtn = overlay.querySelector(".custom-dialog-btn.primary");

    textarea.value = textoAtual;
    textarea.focus();

    closeBtn.addEventListener("click", () => fecharJanelaPersonalizada(overlay));
    cancelBtn.addEventListener("click", () => fecharJanelaPersonalizada(overlay));

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            fecharJanelaPersonalizada(overlay);
        }
    });

    saveBtn.addEventListener("click", async () => {
        const novoTexto = textarea.value.trim();

        if (!novoTexto) {
            textarea.classList.add("input-error");
            textarea.placeholder = "O comentário não pode ficar vazio.";
            return;
        }

        const sucesso = await editarComentario(commentId, novoTexto);

        if (sucesso) {
            fecharJanelaPersonalizada(overlay);
        }
    });
}

function abrirJanelaExcluirComentario(commentId) {
    const overlay = criarJanelaBase();

    overlay.innerHTML = `
        <div class="custom-dialog-card">
            <button type="button" class="custom-dialog-close">×</button>

            <div class="custom-dialog-icon delete">!</div>

            <h2>Excluir comentário?</h2>

            <p>Essa ação não pode ser desfeita. Você tem certeza que deseja excluir este comentário?</p>

            <div class="custom-dialog-actions">
                <button type="button" class="custom-dialog-btn secondary">
                    Cancelar
                </button>

                <button type="button" class="custom-dialog-btn danger">
                    Sim, excluir
                </button>
            </div>
        </div>
    `;

    const closeBtn = overlay.querySelector(".custom-dialog-close");
    const cancelBtn = overlay.querySelector(".custom-dialog-btn.secondary");
    const deleteBtn = overlay.querySelector(".custom-dialog-btn.danger");

    closeBtn.addEventListener("click", () => fecharJanelaPersonalizada(overlay));
    cancelBtn.addEventListener("click", () => fecharJanelaPersonalizada(overlay));

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            fecharJanelaPersonalizada(overlay);
        }
    });

    deleteBtn.addEventListener("click", async () => {
        const sucesso = await excluirComentario(commentId);

        if (sucesso) {
            fecharJanelaPersonalizada(overlay);
        }
    });
}

/* =========================
   ESTRELAS
========================= */

function marcarEstrelas(container, rating) {
    const estrelas = container.querySelectorAll("span");

    estrelas.forEach(estrela => {
        const valor = Number(estrela.dataset.star);

        if (valor <= rating) {
            estrela.classList.add("active");
            estrela.innerText = "★";
        } else {
            estrela.classList.remove("active");
            estrela.innerText = "☆";
        }
    });

    container.dataset.currentRating = rating;
}

function inicializarEstrelasDosCards() {
    document.querySelectorAll(".stars").forEach(container => {
        const rating = Number(container.dataset.currentRating || 0);
        marcarEstrelas(container, rating);
    });
}

function atualizarTodasAsEstrelasDoMesmoTitulo(titleId, rating) {
    document.querySelectorAll(`.stars[data-title-id="${titleId}"]`).forEach(container => {
        marcarEstrelas(container, rating);
    });
}

/* =========================
   COMENTÁRIOS
========================= */

async function carregarComentarios(titleId) {
    commentsList.innerHTML = `<p class="empty-message">Carregando comentários...</p>`;

    try {
        const response = await fetch(`/app/api/titles/${titleId}/comments/`, {
            method: "GET",
            credentials: "same-origin"
        });

        const data = await response.json();

        if (data.status !== "ok") {
            commentsList.innerHTML = `<p class="empty-message">Erro ao carregar comentários.</p>`;
            return;
        }

        marcarEstrelas(modalStars, Number(data.minha_avaliacao || 0));
        atualizarModalFavorito(data.favorito === true);
        renderizarComentarios(data.comentarios);

    } catch (error) {
        console.error(error);
        commentsList.innerHTML = `<p class="empty-message">Erro ao conectar com o servidor.</p>`;
    }
}

function renderizarComentarios(comentarios) {
    if (!comentarios.length) {
        commentsList.innerHTML = `<p class="empty-message">Nenhum comentário ainda.</p>`;
        return;
    }

    commentsList.innerHTML = "";

    comentarios.forEach(comentario => {
        const div = document.createElement("div");
        div.className = "comment-item";
        div.dataset.commentId = comentario.id;

        const topo = document.createElement("div");
        topo.className = "comment-top";

        const info = document.createElement("div");

        const usuario = document.createElement("strong");
        usuario.innerText = comentario.usuario;

        const data = document.createElement("span");
        data.innerText = comentario.criado_em;

        info.appendChild(usuario);
        info.appendChild(data);

        topo.appendChild(info);

        if (comentario.pode_editar) {
            const actions = document.createElement("div");
            actions.className = "comment-actions";

            const editar = document.createElement("button");
            editar.type = "button";
            editar.className = "comment-edit";
            editar.innerText = "Editar";
            editar.addEventListener("click", () => {
                abrirJanelaEditarComentario(comentario.id, comentario.texto);
            });

            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.className = "comment-delete";
            excluir.innerText = "Excluir";
            excluir.addEventListener("click", () => {
                abrirJanelaExcluirComentario(comentario.id);
            });

            actions.appendChild(editar);
            actions.appendChild(excluir);

            topo.appendChild(actions);
        }

        const texto = document.createElement("p");
        texto.className = "comment-text";
        texto.innerText = comentario.texto;

        div.appendChild(topo);
        div.appendChild(texto);

        commentsList.appendChild(div);
    });
}

async function salvarComentario() {
    if (!tituloAtualId) return;

    const texto = commentText.value.trim();

    if (!texto) {
        alert("Digite um comentário antes de publicar.");
        return;
    }

    try {
        const response = await fetch(`/app/api/titles/${tituloAtualId}/comments/create/`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken()
            },
            body: JSON.stringify({
                text: texto
            })
        });

        const data = await response.json();

        if (data.status !== "comentario_criado") {
            alert(data.mensagem || "Erro ao salvar comentário.");
            return;
        }

        commentText.value = "";
        carregarComentarios(tituloAtualId);

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
    }
}

async function editarComentario(commentId, novoTexto) {
    try {
        const response = await fetch(`/app/api/comments/${commentId}/edit/`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken()
            },
            body: JSON.stringify({
                text: novoTexto
            })
        });

        const data = await response.json();

        if (data.status !== "comentario_editado") {
            alert(data.mensagem || "Erro ao editar comentário.");
            return false;
        }

        carregarComentarios(tituloAtualId);
        return true;

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
        return false;
    }
}

async function excluirComentario(commentId) {
    try {
        const response = await fetch(`/app/api/comments/${commentId}/delete/`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken()
            }
        });

        const data = await response.json();

        if (data.status !== "comentario_excluido") {
            alert(data.mensagem || "Erro ao excluir comentário.");
            return false;
        }

        carregarComentarios(tituloAtualId);
        return true;

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
        return false;
    }
}

/* =========================
   AVALIAÇÃO
========================= */

async function salvarAvaliacao(titleId, stars) {
    try {
        const response = await fetch(`/app/api/titles/${titleId}/rating/`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken()
            },
            body: JSON.stringify({
                stars: stars
            })
        });

        const data = await response.json();

        if (data.status !== "avaliacao_salva") {
            alert(data.mensagem || "Erro ao salvar avaliação.");
            return;
        }

        marcarEstrelas(modalStars, stars);
        atualizarTodasAsEstrelasDoMesmoTitulo(titleId, stars);

        mostrarAvisoRecomendacao();

        setTimeout(() => {
            window.location.reload();
        }, 900);

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
    }
}

/* =========================
   MODAL
========================= */

function abrirModalPorDados(dados) {
    tituloAtualId = dados.id;
    tituloAtualFavorito = dados.isFavorite === true || dados.isFavorite === "true";

    document.body.classList.add("modal-open");

    if (topbar) {
        topbar.classList.add("topbar-modal-mode");
        topbar.classList.remove("topbar-hidden");
    }

    modal.classList.add("show");

    modalTitle.innerText = dados.title || "Sem título";
    modalDescription.innerText = dados.description || "Sem descrição disponível.";

    if (dados.image) {
        modalImage.src = dados.image;
        modalImage.style.display = "block";
    } else {
        modalImage.src = "";
        modalImage.style.display = "none";
    }

    atualizarModalFavorito(tituloAtualFavorito);

    commentText.value = "";

    carregarComentarios(tituloAtualId);
}

function abrirModalDoCard(card) {
    abrirModalPorDados({
        id: card.dataset.id,
        title: card.dataset.title,
        description: card.dataset.description,
        image: card.dataset.image,
        isFavorite: card.dataset.favorite === "true"
    });
}

function fecharModal() {
    if (!modal) return;

    modal.classList.remove("show");
    document.body.classList.remove("modal-open");

    if (topbar) {
        topbar.classList.remove("topbar-modal-mode");
    }

    tituloAtualId = null;
    tituloAtualFavorito = false;
}

/* =========================
   EVENTOS GERAIS
========================= */

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", event => {
        if (event.target.closest(".stars")) {
            return;
        }

        if (event.target.closest(".favorite-card-btn")) {
            return;
        }

        abrirModalDoCard(card);
    });
});

document.querySelectorAll(".favorite-card-btn").forEach(botao => {
    botao.addEventListener("click", event => {
        event.stopPropagation();

        const titleId = botao.dataset.titleId;

        alternarFavorito(titleId);
    });
});

if (modalFavoriteBtn) {
    modalFavoriteBtn.addEventListener("click", () => {
        if (!tituloAtualId) return;

        alternarFavorito(tituloAtualId);
    });
}

if (modal) {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            fecharModal();
        }
    });
}

document.querySelectorAll(".stars").forEach(container => {
    const estrelas = container.querySelectorAll("span");

    estrelas.forEach(estrela => {
        estrela.addEventListener("click", event => {
            event.stopPropagation();

            const titleId = container.dataset.titleId;
            const stars = Number(estrela.dataset.star);

            salvarAvaliacao(titleId, stars);
        });

        estrela.addEventListener("mouseenter", () => {
            const hoverValue = Number(estrela.dataset.star);
            marcarEstrelas(container, hoverValue);
        });
    });

    container.addEventListener("mouseleave", () => {
        const rating = Number(container.dataset.currentRating || 0);
        marcarEstrelas(container, rating);
    });
});

modalStars.querySelectorAll("span").forEach(estrela => {
    estrela.addEventListener("click", () => {
        if (!tituloAtualId) return;

        const stars = Number(estrela.dataset.star);
        salvarAvaliacao(tituloAtualId, stars);
    });

    estrela.addEventListener("mouseenter", () => {
        const hoverValue = Number(estrela.dataset.star);
        marcarEstrelas(modalStars, hoverValue);
    });
});

modalStars.addEventListener("mouseleave", () => {
    const rating = Number(modalStars.dataset.currentRating || 0);
    marcarEstrelas(modalStars, rating);
});

if (publishComment) {
    publishComment.addEventListener("click", salvarComentario);
}

if (searchTrigger) {
    searchTrigger.addEventListener("click", abrirPesquisa);
}

if (searchDialogClose) {
    searchDialogClose.addEventListener("click", fecharPesquisa);
}

if (searchClear) {
    searchClear.addEventListener("click", limparPesquisa);
}

if (searchOverlay) {
    searchOverlay.addEventListener("click", event => {
        if (event.target === searchOverlay) {
            fecharPesquisa();
        }
    });
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const termo = searchInput.value.trim();

        clearTimeout(searchTimeout);

        if (termo.length < 2) {
            searchResults.innerHTML = "";
            searchStatus.style.display = "block";
            searchStatus.innerText = "Digite pelo menos duas letras para pesquisar.";
            return;
        }

        searchTimeout = setTimeout(() => {
            buscarTitulos(termo);
        }, 350);
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        if (searchOverlay && searchOverlay.classList.contains("open")) {
            fecharPesquisa();
            return;
        }

        if (modal && modal.classList.contains("show")) {
            fecharModal();
        }
    }
});

const tabs = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(btn => {
            btn.classList.remove("active");
        });

        tab.classList.add("active");

        const target = tab.dataset.tab;
        const targetSection = document.getElementById(target);

        sections.forEach(section => {
            section.classList.remove("active-section");
            section.classList.add("hidden-section");
        });

        if (targetSection) {
            targetSection.classList.remove("hidden-section");
            targetSection.classList.add("active-section");
        }
    });
});

inicializarEstrelasDosCards();
verificarFavoritosVazio();