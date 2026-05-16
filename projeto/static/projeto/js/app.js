const modal =
document.getElementById("modal")

const modalTitle =
document.getElementById("modal-title")

const modalDescription =
document.getElementById("modal-description")

const modalImage =
document.getElementById("modal-image")

/* =========================
   ABRIR MODAL
========================= */

function abrirModal(
    titulo,
    descricao,
    imagem
){

    modal.classList.add("show")

    modalTitle.innerText = titulo

    modalDescription.innerText = descricao

    modalImage.src = imagem
}

/* =========================
   FECHAR MODAL
========================= */

function fecharModal(){

    modal.classList.remove("show")
}

/* =========================
   FECHAR AO CLICAR FORA
========================= */

modal.addEventListener("click", (e) => {

    if(e.target === modal){

        fecharModal()
    }
})

/* =========================
   AVALIAÇÃO ESTRELAS
========================= */

document
.querySelectorAll(".stars")
.forEach(container => {

    const estrelas =
    container.querySelectorAll("span")

    estrelas.forEach((estrela, index) => {

        /* HOVER */

        estrela.addEventListener("mouseenter", () => {

            estrelas.forEach((s, i) => {

                s.classList.remove("hovered")

                if(i <= index){

                    s.classList.add("hovered")
                }
            })
        })

        /* SAIR HOVER */

        container.addEventListener("mouseleave", () => {

            estrelas.forEach(s => {

                s.classList.remove("hovered")
            })
        })

        /* AVALIAR */

        estrela.addEventListener("click", (event) => {

            event.stopPropagation()

            estrelas.forEach(s => {

                s.classList.remove("active")
            })

            estrelas.forEach((s, i) => {

                if(i <= index){

                    s.classList.add("active")
                }
            })

            container.dataset.rating =
            index + 1
        })
    })
})
/* =========================
   ABAS
========================= */

const tabs =
document.querySelectorAll(".nav-btn")

const sections =
document.querySelectorAll(".section")

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(btn => {

            btn.classList.remove("active")
        })

        tab.classList.add("active")

        const target =
        tab.dataset.tab

        sections.forEach(section => {

            section.classList.remove(
                "active-section"
            )

            section.classList.add(
                "hidden-section"
            )
        })

        document
        .getElementById(target)
        .classList.remove("hidden-section")

        document
        .getElementById(target)
        .classList.add("active-section")
    })
})
/*A*/
const grids = document.querySelectorAll(".content-grid")
grids.forEach(section => {

    let visible = 12

    const cards = section.querySelectorAll(".media-card")

    function updateCards(){

        cards.forEach((card, index) => {

            if(index < visible){
                card.style.display = "block"
            }else{
                card.style.display = "none"
            }
        })
    }

    updateCards()

    section.addEventListener("scroll", () => {

        const end =
        section.scrollLeft + section.clientWidth

        if(end >= section.scrollWidth - 200){

            visible += 8

            updateCards()
        }
    })
})