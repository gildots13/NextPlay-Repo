const loginState = document.getElementById("login-state")

const signupState = document.getElementById("signup-state")

const goToSignup = document.getElementById("go-to-signup")

const goToLogin = document.getElementById("go-to-login")

const subtitle = document.getElementById("form-subtitle")

/* TROCAR TELAS */

goToSignup.addEventListener("click", () => {

    loginState.classList.remove("state-active")

    loginState.classList.add("state-hidden")

    signupState.classList.remove("state-hidden")

    signupState.classList.add("state-active")

    subtitle.innerText = "Crie sua conta"
})

goToLogin.addEventListener("click", () => {

    signupState.classList.remove("state-active")

    signupState.classList.add("state-hidden")

    loginState.classList.remove("state-hidden")

    loginState.classList.add("state-active")

    subtitle.innerText = "Faça login para continuar"
})

/* PEGAR CSRF */

function getCSRFToken(){

    return document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content")
}

/* LOGIN */

document
.getElementById("loginForm")
.addEventListener("submit", async function(e){

    e.preventDefault()

    const email =
    document.getElementById("login-email").value

    const senha =
    document.getElementById("login-pass").value

    const response = await fetch("/api/login/", {

        method:"POST",

        headers:{

            "Content-Type":"application/json",

            "X-CSRFToken": getCSRFToken()
        },

        body: JSON.stringify({

            email:email,
            senha:senha
        })
    })

    const data = await response.json()

    if(response.ok){

        window.location.href = "/app/"

    }else{

        alert("Erro no login")
    }
})

/* CADASTRO */

document
.getElementById("signupForm")
.addEventListener("submit", async function(e){

    e.preventDefault()

    const email =
    document.getElementById("reg-email").value

    const senha =
    document.getElementById("reg-pass").value

    const response = await fetch("/api/cadastrar/", {

        method:"POST",

        headers:{

            "Content-Type":"application/json",

            "X-CSRFToken": getCSRFToken()
        },

        body: JSON.stringify({

            email:email,
            senha:senha
        })
    })

    const data = await response.json()

    if(response.ok){

        window.location.href = "/app/"

    }else{

        alert("Erro ao cadastrar")
    }
})

/* VER SENHA */

document
.querySelectorAll(".toggle-password")
.forEach(button => {

    button.addEventListener("click", () => {

        const input =
        button.parentElement.querySelector("input")

        if(input.type === "password"){

            input.type = "text"

            button.innerText = "Ocultar"

        }else{

            input.type = "password"

            button.innerText = "Ver"
        }
    })
})