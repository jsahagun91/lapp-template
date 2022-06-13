const signinButton = document.getElementById('signin-button');
const qrButton = document.getElementById('qr-button');
const weblnButton = document.getElementById('webln-button');
const loginModal = new bootstrap.Modal('#signin');
let signinActive = false;

async function signin() {

    if(signinActive)
        return;

    signinActive = true;

    loginModal.show();

    document.getElementById('signin').addEventListener('hidden.bs.modal', (event) => {
        signinButton.disabled = false;
        signinButton.innerHTML = '<i class="bi bi-currency-bitcoin"></i> Sign in';
        signinActive = false;
    });

    signinButton.disabled = true;
    signinButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only"> Connecting...</span>`;

    const request = await fetch('/do-login');
    const result = await request.json();

    document.getElementById('qr-link').href = "lightning:" + result.lnurl;
    document.getElementById('qr').src = result.qrCode;

    if (window.webln) {
        weblnButton.href = "lightning:" + result.lnurl;
        weblnButton.classList.remove('d-none');
    }

    startPolling(1000, function () {
        signinActive = false;
        window.location.reload();
    });
}

function loading() {
    document.querySelector('.modal-footer').classList.remove('d-none');
}

function startQr() {
    loading();
    document.querySelector('#qr-container').classList.remove('d-none');
}

function startWebLN() {
    loading();
    weblnButton.disabled = true;
}

async function isSignedIn() {
    const response = await fetch('/me');
    const result = await response.json();

    return result.user != null;
}

function startPolling(timeout, onSuccess) {
    if(!signinActive)
        return;
        
    setTimeout(async function () {
        const result = await isSignedIn();

        if (!result) {
            startPolling(timeout, onSuccess);
        } else {
            onSuccess();
        }
    }, timeout);
}