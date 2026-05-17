document.addEventListener('DOMContentLoaded', () => {

    window.addEventListener("pageshow", event => {
    if (event.persisted) {
        window.location.reload();
    }
}); 
    console.log('SCRIPT DE LOGIN CARREGADO');

    const loginSec = document.getElementById('login-state');
    const signupSec = document.getElementById('signup-state');
    const subtitle = document.getElementById('form-subtitle');

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    const goToSignup = document.getElementById('go-to-signup');
    const goToLogin = document.getElementById('go-to-login');

    if (!loginForm || !signupForm) {
        console.error('Formulários não encontrados.');
        return;
    }

    function mostrarAviso(titulo, mensagem, tipo = 'info') {
        const avisoAntigo = document.querySelector('.aviso-overlay');

        if (avisoAntigo) {
            avisoAntigo.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'aviso-overlay';

        overlay.innerHTML = `
            <div class="aviso-card">
                <button type="button" class="aviso-close">×</button>
                <div class="aviso-icon ${tipo}">
                    ${tipo === 'sucesso' ? '✓' : tipo === 'erro' ? '×' : '!'}
                </div>
                <h2>${titulo}</h2>
                <p>${mensagem}</p>
                <button type="button" class="aviso-btn">Entendi</button>
            </div>
        `;

        document.body.appendChild(overlay);

        function fecharAviso() {
            overlay.classList.add('fechando');

            setTimeout(() => {
                overlay.remove();
            }, 200);
        }

        overlay.querySelector('.aviso-close').addEventListener('click', fecharAviso);
        overlay.querySelector('.aviso-btn').addEventListener('click', fecharAviso);

        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                fecharAviso();
            }
        });
    }

    function mostrarCadastro() {
        loginSec.classList.replace('state-active', 'state-hidden');
        signupSec.classList.replace('state-hidden', 'state-active');
        subtitle.innerText = 'Crie sua conta em segundos';
    }

    function mostrarLogin() {
        signupSec.classList.replace('state-active', 'state-hidden');
        loginSec.classList.replace('state-hidden', 'state-active');
        subtitle.innerText = 'Faça login para continuar';
    }

    function setLoading(form, loading) {
        const button = form.querySelector('.btn-primary');

        if (!button) return;

        button.classList.toggle('is-loading', loading);
        button.disabled = loading;
    }

    function getCSRFToken() {

    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {

        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {

            const cookie = cookies[i].trim();

            if (cookie.startsWith('csrftoken=')) {

                cookieValue = cookie.substring('csrftoken='.length);

                break;
            }
        }
    }

    return cookieValue;
}

async function enviarDados(url, dados) {

    const csrfToken = getCSRFToken();

    const response = await fetch(url, {
        method: 'POST',

        credentials: 'same-origin',

        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },

        body: JSON.stringify(dados)
    });

    const texto = await response.text();

    let resultado;

    try {

        resultado = JSON.parse(texto);

    } catch (error) {

        console.error('Resposta não JSON:', texto);

        return {
            ok: false,
            statusHttp: response.status,
            resultado: {
                status: 'erro',
                mensagem: `O servidor respondeu em formato inválido. HTTP ${response.status}`
            }
        };
    }

    return {
        ok: response.ok,
        statusHttp: response.status,
        resultado
    };
}

   function redirecionarLoginSucesso(email) {
    window.location.replace("/app/");
}
    goToSignup.addEventListener('click', event => {
        event.preventDefault();
        mostrarCadastro();
    });

    goToLogin.addEventListener('click', event => {
        event.preventDefault();
        mostrarLogin();
    });

    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.parentElement.querySelector('.password-input');
            const isPass = input.type === 'password';

            input.type = isPass ? 'text' : 'password';
            this.innerText = isPass ? 'Ocultar' : 'Ver';
        });
    });

    signupForm.addEventListener('submit', async event => {
        event.preventDefault();
        event.stopPropagation();

        const email = document.getElementById('reg-email').value.trim();
        const senha = document.getElementById('reg-pass').value.trim();

        setLoading(signupForm, true);

        try {
            const resposta = await enviarDados('/api/cadastrar/', {
                email,
                senha
            });

            if (resposta.resultado.status === 'conta_criada') {
                mostrarAviso(
                    'Conta criada com sucesso',
                    'Sua conta foi cadastrada. Agora faça login para entrar.',
                    'sucesso'
                );

                document.getElementById('login-email').value = email;
                document.getElementById('login-pass').value = '';
                document.getElementById('reg-pass').value = '';

                mostrarLogin();
                return;
            }

            if (resposta.resultado.status === 'conta_existente') {
                mostrarAviso(
                    'Conta já existente',
                    'Esse e-mail já está cadastrado. Tente fazer login.',
                    'info'
                );

                document.getElementById('login-email').value = email;
                mostrarLogin();
                return;
            }

            mostrarAviso(
                'Erro ao cadastrar',
                resposta.resultado.mensagem || 'Não foi possível criar sua conta.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarAviso(
                'Erro de conexão',
                'Não foi possível conectar com o servidor.',
                'erro'
            );
        } finally {
            setLoading(signupForm, false);
        }
    });

    loginForm.addEventListener('submit', async event => {
        event.preventDefault();
        event.stopPropagation();

        const email = document.getElementById('login-email').value.trim();
        const senha = document.getElementById('login-pass').value.trim();

        setLoading(loginForm, true);

        try {
            const resposta = await enviarDados('/api/login/', {
                email,
                senha
            });

            if (resposta.resultado.status === 'conta_logada') {
                redirecionarLoginSucesso();
                return;
            }

            if (resposta.resultado.status === 'conta_nao_existente') {
                mostrarAviso(
                    'Conta não encontrada',
                    'Esse e-mail não está cadastrado. Crie uma conta antes de fazer login.',
                    'erro'
                );
                return;
            }

            if (resposta.resultado.status === 'senha_incorreta') {
                mostrarAviso(
                    'Senha incorreta',
                    'A senha digitada está errada. Verifique e tente novamente.',
                    'erro'
                );
                return;
            }

            mostrarAviso(
                'Erro ao fazer login',
                resposta.resultado.mensagem || 'Não foi possível fazer login.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarAviso(
                'Erro de conexão',
                'Não foi possível conectar com o servidor.',
                'erro'
            );
        } finally {
            setLoading(loginForm, false);
        }
    });
});