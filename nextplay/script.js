document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Ativa estado de carregamento
        submitBtn.classList.add('is-loading');

        // Simulação de autenticação (Backend fictício)
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log(`Tentando autenticar: ${email}`);

        // Simulando delay de resposta de rede (2 segundos)
        setTimeout(() => {
            // Reverte o estado do botão
            submitBtn.classList.remove('is-loading');

            // Feedback visual de exemplo
            if (email && password) {
                alert('Login efetuado com sucesso no NextPlay!');
                // Aqui você redirecionaria o usuário: window.location.href = '/dashboard';
            }
        }, 2000);
    });

    // Efeito sutil: brilho segue o mouse (opcional para toque premium)
    // Pode ser implementado aqui futuramente para elevar ainda mais a UX.
});


// 1. Alternar entre Login e Cadastro
const loginSec = document.getElementById('login-state');
const signupSec = document.getElementById('signup-state');
const subtitle = document.getElementById('form-subtitle');

// Trocar para Cadastro
document.getElementById('go-to-signup').addEventListener('click', () => {
    loginSec.classList.replace('state-active', 'state-hidden');
    signupSec.classList.replace('state-hidden', 'state-active');
    subtitle.innerText = 'Crie sua conta em segundos';
});

// Trocar para Login
document.getElementById('go-to-login').addEventListener('click', () => {
    signupSec.classList.replace('state-active', 'state-hidden');
    loginSec.classList.replace('state-hidden', 'state-active');
    subtitle.innerText = 'Faça login para continuar';
});

// Lógica de Ver Senha (mantém a mesma, só confira se as classes batem)
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.parentElement.querySelector('.password-input');
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        this.innerText = isPass ? 'Ocultar' : 'Ver';
    });
});
