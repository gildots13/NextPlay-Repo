document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalImage = document.getElementById("modal-image");

    const commentsList = document.getElementById("comments-list");
    const commentText = document.getElementById("comment-text");
    const publishComment = document.getElementById("publish-comment");

    const modalStars = document.getElementById("modal-stars");
    const modalFavoriteBtn = document.getElementById("modal-favorite-btn");
    const modalRatingNumber = document.getElementById("modal-rating-number");

    const topbar = document.querySelector(".topbar");

    const searchTrigger = document.getElementById("search-trigger");
    const searchOverlay = document.getElementById("search-overlay");
    const searchDialogClose = document.getElementById("search-dialog-close");
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");
    const searchStatus = document.getElementById("search-status");
    const searchResults = document.getElementById("search-results");

    const profileMenuTrigger = document.getElementById("profile-menu-trigger");
    const profileMenuPanel = document.getElementById("profile-menu-panel");
    const profileStatFavoritos = document.getElementById("profile-stat-favoritos");
    const favoritesCountBadge = document.getElementById("favorites-count-badge");

    const tabs = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".section");

    let tituloAtualId = null;
    let tituloAtualFavorito = false;
    let tituloAtualDados = null;
    let searchTimeout = null;
    let ultimoScroll = window.scrollY;

    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');

        if (!meta) {
            return "";
        }

        return meta.getAttribute("content") || "";
    }

    function mostrarToast(icone, titulo, texto) {
        const antigo = document.querySelector(".recommendation-toast");

        if (antigo) {
            antigo.remove();
        }

        const toast = document.createElement("div");
        toast.className = "recommendation-toast";

        toast.innerHTML = `
            <div class="recommendation-toast-icon">${icone}</div>

            <div>
                <strong>${titulo}</strong>
                <span>${texto}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 30);

        setTimeout(() => {
            toast.classList.remove("show");

            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2500);
    }

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
       MENU PERFIL
    ========================= */

    if (profileMenuTrigger && profileMenuPanel) {
        profileMenuTrigger.addEventListener("click", event => {
            event.stopPropagation();

            profileMenuTrigger.classList.toggle("active");
            profileMenuPanel.classList.toggle("open");
        });

        profileMenuPanel.addEventListener("click", event => {
            event.stopPropagation();
        });

        document.addEventListener("click", () => {
            profileMenuTrigger.classList.remove("active");
            profileMenuPanel.classList.remove("open");
        });
    }

    /* =========================
       FAVORITOS
    ========================= */

    function atualizarContadorFavoritos(delta) {
        if (profileStatFavoritos) {
            const atual = Number(profileStatFavoritos.innerText || 0);
            const novoValor = Math.max(0, atual + delta);

            profileStatFavoritos.innerText = novoValor;
        }

        if (favoritesCountBadge) {
            const textoAtual = favoritesCountBadge.innerText || "0";
            const numeroAtual = Number(textoAtual.match(/\d+/)?.[0] || 0);
            const novoValor = Math.max(0, numeroAtual + delta);

            favoritesCountBadge.innerText = `${novoValor} salvo(s)`;
        }
    }

    function atualizarBotaoFavorito(botao, favoritado) {
        if (!botao) return;

        botao.dataset.favorited = favoritado ? "true" : "false";

        if (favoritado) {
            botao.classList.add("active");
            botao.innerText = "♥";
        } else {
            botao.classList.remove("active");
            botao.innerText = "♡";
        }
    }

    function atualizarModalFavorito(favoritado) {
        tituloAtualFavorito = favoritado;

        if (!modalFavoriteBtn) return;

        modalFavoriteBtn.dataset.favorited = favoritado ? "true" : "false";

        let span = modalFavoriteBtn.querySelector("span");
        let strong = modalFavoriteBtn.querySelector("strong");

        if (!span || !strong) {
            modalFavoriteBtn.innerHTML = `
                <span>♡</span>
                <strong>Favoritar</strong>
            `;

            span = modalFavoriteBtn.querySelector("span");
            strong = modalFavoriteBtn.querySelector("strong");
        }

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

    function verificarFavoritosVazio() {
        const container = document.querySelector("#favoritos .favorites-cards");

        if (!container) return;

        const cards = container.querySelectorAll(".card");

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

    function criarCardFavoritoPorDados(dados) {
        const card = document.createElement("div");

        card.className = "card";
        card.dataset.id = dados.id;
        card.dataset.title = dados.title || "Sem título";
        card.dataset.description = dados.description || "Sem descrição disponível.";
        card.dataset.image = dados.image || "";
        card.dataset.favorite = "true";

        card.innerHTML = `
            <button type="button"
                    class="favorite-card-btn active"
                    data-title-id="${dados.id}"
                    data-favorited="true">♥</button>

            ${
                dados.image
                ? `<img src="${dados.image}" alt="${dados.title || "Título"}">`
                : `<div class="poster-placeholder">Sem imagem</div>`
            }

            <div class="card-info">
                <h4>${dados.title || "Sem título"}</h4>

                <div class="stars"
                     data-title-id="${dados.id}"
                     data-current-rating="0">
                    <span data-star="1">☆</span>
                    <span data-star="2">☆</span>
                    <span data-star="3">☆</span>
                    <span data-star="4">☆</span>
                    <span data-star="5">☆</span>
                </div>

                <div class="rating-number">
                    Sua nota:
                    <span class="rating-value">0/5</span>
                </div>
            </div>
        `;

        return card;
    }

    function adicionarCardFavorito(titleId) {
        const container = document.querySelector("#favoritos .favorites-cards");

        if (!container) return;

        const jaExiste = container.querySelector(`.card[data-id="${titleId}"]`);

        if (jaExiste) return;

        const vazio = container.querySelector(".favorites-empty");

        if (vazio) {
            vazio.remove();
        }

        const origem = document.querySelector(`.section:not(#favoritos) .card[data-id="${titleId}"]`);

        let novoCard = null;

        if (origem) {
            novoCard = origem.cloneNode(true);
            novoCard.dataset.favorite = "true";
            novoCard.dataset.bound = "false";

            const botao = novoCard.querySelector(".favorite-card-btn");

            if (botao) {
                atualizarBotaoFavorito(botao, true);
            }
        } else if (tituloAtualDados) {
            novoCard = criarCardFavoritoPorDados(tituloAtualDados);
        }

        if (!novoCard) return;

        container.appendChild(novoCard);

        registrarEventosCard(novoCard);
        inicializarEstrelasDosCards();
    }

    function removerCardFavorito(titleId) {
        document.querySelectorAll(`#favoritos .card[data-id="${titleId}"]`).forEach(card => {
            card.style.opacity = "0";
            card.style.transform = "scale(0.94)";

            setTimeout(() => {
                card.remove();
                verificarFavoritosVazio();
            }, 220);
        });
    }

    async function alternarFavorito(titleId) {
        if (!titleId) return;

        let estavaFavorito = false;

        document.querySelectorAll(`.card[data-id="${titleId}"]`).forEach(card => {
            if (card.dataset.favorite === "true") {
                estavaFavorito = true;
            }
        });

        if (String(tituloAtualId) === String(titleId) && tituloAtualFavorito) {
            estavaFavorito = true;
        }

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

            if (favoritado) {
                adicionarCardFavorito(titleId);

                if (!estavaFavorito) {
                    atualizarContadorFavoritos(1);
                }

                mostrarToast("♥", "Favorito salvo", "Esse título foi adicionado aos seus favoritos.");
            } else {
                removerCardFavorito(titleId);

                if (estavaFavorito) {
                    atualizarContadorFavoritos(-1);
                }

                mostrarToast("♡", "Favorito removido", "Esse título saiu da sua lista.");
            }

        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor.");
        }
    }

    /* =========================
       ESTRELAS / AVALIAÇÃO
    ========================= */

    function atualizarTextoNota(container, rating) {
        const nota = `${rating}/5`;

        if (container === modalStars && modalRatingNumber) {
            modalRatingNumber.innerText = `Sua nota: ${nota}`;
            return;
        }

        const cardInfo = container.closest(".card-info");

        if (!cardInfo) return;

        const ratingValue = cardInfo.querySelector(".rating-value");

        if (ratingValue) {
            ratingValue.innerText = nota;
        }
    }

    function marcarEstrelas(container, rating) {
        if (!container) return;

        const estrelas = container.querySelectorAll("span");

        estrelas.forEach(estrela => {
            const valor = Number(estrela.dataset.star || 0);

            if (valor <= rating) {
                estrela.classList.add("active");
                estrela.innerText = "★";
            } else {
                estrela.classList.remove("active");
                estrela.innerText = "☆";
            }
        });

        container.dataset.currentRating = rating;

        atualizarTextoNota(container, rating);
    }

    function inicializarEstrelasDosCards() {
        document.querySelectorAll(".stars").forEach(container => {
            const rating = Number(container.dataset.currentRating || 0);
            marcarEstrelas(container, rating);
        });
    }

    function atualizarTodasAsEstrelas(titleId, rating) {
        document.querySelectorAll(`.stars[data-title-id="${titleId}"]`).forEach(container => {
            marcarEstrelas(container, rating);
        });
    }

    function controlarAtualizacaoDeRecomendacao() {
        const chave = "nextplay_avaliacoes_para_recomendar";

        let quantidade = Number(localStorage.getItem(chave) || 0);

        quantidade += 1;

        if (quantidade >= 4) {
            localStorage.removeItem(chave);

            mostrarToast(
                "✨",
                "Recomendações atualizadas",
                "A página vai atualizar para ajustar os títulos ao seu gosto."
            );

            setTimeout(() => {
                window.location.reload();
            }, 1100);

            return;
        }

        localStorage.setItem(chave, quantidade);

        const faltam = 4 - quantidade;

        mostrarToast(
            "★",
            "Avaliação salva",
            `Avalie mais ${faltam} título(s) para atualizar suas recomendações.`
        );
    }

    async function salvarAvaliacao(titleId, stars) {
        if (!titleId || !stars) return;

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

            atualizarTodasAsEstrelas(titleId, stars);

            if (modalStars && String(tituloAtualId) === String(titleId)) {
                marcarEstrelas(modalStars, stars);
            }

            controlarAtualizacaoDeRecomendacao();

        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor.");
        }
    }

    /* =========================
       COMENTÁRIOS
    ========================= */

    async function carregarComentarios(titleId) {
        if (!commentsList) return;

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
        if (!commentsList) return;

        if (!comentarios || comentarios.length === 0) {
            commentsList.innerHTML = `<p class="empty-message">Nenhum comentário ainda.</p>`;
            return;
        }

        commentsList.innerHTML = "";

        comentarios.forEach(comentario => {
            const item = document.createElement("div");
            item.className = "comment-item";
            item.dataset.commentId = comentario.id;

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

            item.appendChild(topo);
            item.appendChild(texto);

            commentsList.appendChild(item);
        });
    }

    async function salvarComentario() {
        if (!tituloAtualId || !commentText) return;

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

    function criarJanelaBase() {
        const overlay = document.createElement("div");
        overlay.className = "custom-dialog-overlay";

        document.body.appendChild(overlay);

        return overlay;
    }

    function fecharJanela(overlay) {
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

                <textarea class="custom-dialog-textarea"></textarea>

                <div class="custom-dialog-actions">
                    <button type="button" class="custom-dialog-btn secondary">Cancelar</button>
                    <button type="button" class="custom-dialog-btn primary">Salvar</button>
                </div>
            </div>
        `;

        const textarea = overlay.querySelector(".custom-dialog-textarea");
        const closeBtn = overlay.querySelector(".custom-dialog-close");
        const cancelBtn = overlay.querySelector(".custom-dialog-btn.secondary");
        const saveBtn = overlay.querySelector(".custom-dialog-btn.primary");

        textarea.value = textoAtual || "";
        textarea.focus();

        closeBtn.addEventListener("click", () => fecharJanela(overlay));
        cancelBtn.addEventListener("click", () => fecharJanela(overlay));

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                fecharJanela(overlay);
            }
        });

        saveBtn.addEventListener("click", async () => {
            const novoTexto = textarea.value.trim();

            if (!novoTexto) {
                textarea.classList.add("input-error");
                return;
            }

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
                    return;
                }

                fecharJanela(overlay);
                carregarComentarios(tituloAtualId);

            } catch (error) {
                console.error(error);
                alert("Erro ao conectar com o servidor.");
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
                <p>Essa ação não pode ser desfeita. Deseja realmente excluir?</p>

                <div class="custom-dialog-actions">
                    <button type="button" class="custom-dialog-btn secondary">Cancelar</button>
                    <button type="button" class="custom-dialog-btn danger">Excluir</button>
                </div>
            </div>
        `;

        const closeBtn = overlay.querySelector(".custom-dialog-close");
        const cancelBtn = overlay.querySelector(".custom-dialog-btn.secondary");
        const deleteBtn = overlay.querySelector(".custom-dialog-btn.danger");

        closeBtn.addEventListener("click", () => fecharJanela(overlay));
        cancelBtn.addEventListener("click", () => fecharJanela(overlay));

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                fecharJanela(overlay);
            }
        });

        deleteBtn.addEventListener("click", async () => {
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
                    return;
                }

                fecharJanela(overlay);
                carregarComentarios(tituloAtualId);

            } catch (error) {
                console.error(error);
                alert("Erro ao conectar com o servidor.");
            }
        });
    }

    /* =========================
       MODAL DO FILME / SÉRIE
    ========================= */

    function abrirModalPorDados(dados) {
        if (!modal) return;

        tituloAtualId = dados.id;
        tituloAtualFavorito = dados.isFavorite === true || dados.isFavorite === "true";
        tituloAtualDados = dados;

        document.body.classList.add("modal-open");

        if (topbar) {
            topbar.classList.add("topbar-modal-mode");
            topbar.classList.remove("topbar-hidden");
        }

        modal.classList.add("show");

        if (modalTitle) {
            modalTitle.innerText = dados.title || "Sem título";
        }

        if (modalDescription) {
            modalDescription.innerText = dados.description || "Sem descrição disponível.";
        }

        if (modalImage) {
            if (dados.image) {
                modalImage.src = dados.image;
                modalImage.style.display = "block";
            } else {
                modalImage.src = "";
                modalImage.style.display = "none";
            }
        }

        if (commentText) {
            commentText.value = "";
        }

        atualizarModalFavorito(tituloAtualFavorito);
        carregarComentarios(tituloAtualId);
    }

    function abrirModalDoCard(card) {
        abrirModalPorDados({
            id: card.dataset.id,
            title: card.dataset.title || "Sem título",
            description: card.dataset.description || "Sem descrição disponível.",
            image: card.dataset.image || "",
            isFavorite: card.dataset.favorite === "true"
        });
    }

    window.fecharModal = function fecharModal() {
        if (!modal) return;

        modal.classList.remove("show");
        document.body.classList.remove("modal-open");

        if (topbar) {
            topbar.classList.remove("topbar-modal-mode");
        }

        tituloAtualId = null;
        tituloAtualFavorito = false;
        tituloAtualDados = null;
    };

    /* =========================
       CARDS
    ========================= */

    function registrarEventosCard(card) {
        if (!card) return;
        if (card.dataset.bound === "true") return;

        card.dataset.bound = "true";

        card.addEventListener("click", event => {
            if (event.target.closest(".stars")) return;
            if (event.target.closest(".favorite-card-btn")) return;

            abrirModalDoCard(card);
        });

        const botaoFavorito = card.querySelector(".favorite-card-btn");

        if (botaoFavorito) {
            botaoFavorito.addEventListener("click", event => {
                event.stopPropagation();

                const titleId = botaoFavorito.dataset.titleId;

                alternarFavorito(titleId);
            });
        }

        const starsContainer = card.querySelector(".stars");

        if (starsContainer) {
            starsContainer.querySelectorAll("span").forEach(estrela => {
                estrela.addEventListener("click", event => {
                    event.stopPropagation();

                    const titleId = starsContainer.dataset.titleId;
                    const stars = Number(estrela.dataset.star || 0);

                    salvarAvaliacao(titleId, stars);
                });
            });
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        registrarEventosCard(card);
    });

    if (modalFavoriteBtn) {
        modalFavoriteBtn.addEventListener("click", () => {
            if (!tituloAtualId) return;

            alternarFavorito(tituloAtualId);
        });
    }

    if (modalStars) {
        modalStars.querySelectorAll("span").forEach(estrela => {
            estrela.addEventListener("click", () => {
                if (!tituloAtualId) return;

                const stars = Number(estrela.dataset.star || 0);

                salvarAvaliacao(tituloAtualId, stars);
            });
        });
    }

    if (publishComment) {
        publishComment.addEventListener("click", salvarComentario);
    }

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                window.fecharModal();
            }
        });
    }

    /* =========================
       PESQUISA
    ========================= */

    function abrirPesquisa() {
        if (!searchOverlay) return;

        searchOverlay.classList.add("open");
        document.body.classList.add("search-open");

        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
            }
        }, 150);
    }

    function fecharPesquisa() {
        if (!searchOverlay) return;

        searchOverlay.classList.remove("open");
        document.body.classList.remove("search-open");

        if (searchInput) {
            searchInput.value = "";
        }

        if (searchResults) {
            searchResults.innerHTML = "";
        }

        if (searchStatus) {
            searchStatus.style.display = "block";
            searchStatus.innerText = "Digite pelo menos duas letras para pesquisar.";
        }
    }

    function limparPesquisa() {
        if (searchInput) {
            searchInput.value = "";
            searchInput.focus();
        }

        if (searchResults) {
            searchResults.innerHTML = "";
        }

        if (searchStatus) {
            searchStatus.style.display = "block";
            searchStatus.innerText = "Digite pelo menos duas letras para pesquisar.";
        }
    }

    async function buscarTitulos(termo) {
        if (!searchResults || !searchStatus) return;

        searchResults.innerHTML = "";
        searchStatus.style.display = "block";
        searchStatus.innerText = "Pesquisando...";

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
        if (!searchResults || !searchStatus) return;

        searchResults.innerHTML = "";

        if (!resultados || resultados.length === 0) {
            searchStatus.style.display = "block";
            searchStatus.innerText = "Nenhum resultado encontrado.";
            return;
        }

        searchStatus.style.display = "none";

        resultados.forEach(item => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "search-card";

            card.innerHTML = `
                <div class="search-card-poster">
                    ${
                        item.image
                        ? `<img src="${item.image}" alt="${item.title || "Título"}">`
                        : `<span>Sem imagem</span>`
                    }
                </div>

                <div class="search-card-content">
                    <div class="search-card-top">
                        <span class="search-card-badge">${item.type_label || "Título"}</span>
                        <span class="search-card-year">${item.release_year || "Ano não informado"}</span>
                    </div>

                    <strong>${item.title || "Sem título"}</strong>

                    <span class="${item.is_favorite ? "search-mini-fav active" : "search-mini-fav"}">
                        ${item.is_favorite ? "♥ Favorito" : "♡ Não salvo"}
                    </span>
                </div>
            `;

            card.addEventListener("click", () => {
                fecharPesquisa();

                abrirModalPorDados({
                    id: item.id,
                    title: item.title || "Sem título",
                    description: item.description || "Sem descrição disponível.",
                    image: item.image || "",
                    isFavorite: item.is_favorite === true
                });
            });

            searchResults.appendChild(card);
        });
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
                if (searchResults) {
                    searchResults.innerHTML = "";
                }

                if (searchStatus) {
                    searchStatus.style.display = "block";
                    searchStatus.innerText = "Digite pelo menos duas letras para pesquisar.";
                }

                return;
            }

            searchTimeout = setTimeout(() => {
                buscarTitulos(termo);
            }, 350);
        });
    }

    /* =========================
       ABAS
    ========================= */

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

    /* =========================
       ESC
    ========================= */

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;

        if (profileMenuPanel) {
            profileMenuPanel.classList.remove("open");
        }

        if (profileMenuTrigger) {
            profileMenuTrigger.classList.remove("active");
        }

        if (searchOverlay && searchOverlay.classList.contains("open")) {
            fecharPesquisa();
            return;
        }

        if (modal && modal.classList.contains("show")) {
            window.fecharModal();
        }
    });

    inicializarEstrelasDosCards();
    verificarFavoritosVazio();
});