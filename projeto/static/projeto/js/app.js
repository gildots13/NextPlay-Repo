const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalImage = document.getElementById("modal-image");

function abrirModal(titulo, descricao, imagem) {
    if (!modal) return;

    modal.classList.add("show");

    modalTitle.innerText = titulo || "Sem título";
    modalDescription.innerText = descricao || "Sem descrição disponível.";

    if (imagem) {
        modalImage.src = imagem;
        modalImage.style.display = "block";
    } else {
        modalImage.src = "";
        modalImage.style.display = "none";
    }
}

function fecharModal() {
    if (!modal) return;

    modal.classList.remove("show");
}

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
        const titulo = card.dataset.title;
        const descricao = card.dataset.description;
        const imagem = card.dataset.image;

        abrirModal(titulo, descricao, imagem);
    });
});

if (modal) {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            fecharModal();
        }
    });
}

document.querySelectorAll(".stars").forEach(container => {
    const estrelas = container.querySelectorAll("span");

    estrelas.forEach((estrela, index) => {
        estrela.addEventListener("mouseenter", () => {
            estrelas.forEach((s, i) => {
                s.classList.remove("hovered");

                if (i <= index) {
                    s.classList.add("hovered");
                }
            });
        });

        container.addEventListener("mouseleave", () => {
            estrelas.forEach(s => {
                s.classList.remove("hovered");
            });
        });

        estrela.addEventListener("click", event => {
            event.stopPropagation();

            estrelas.forEach(s => {
                s.classList.remove("active");
            });

            estrelas.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add("active");
                }
            });

            container.dataset.rating = index + 1;
        });
    });
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