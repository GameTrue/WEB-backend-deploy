async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    const val = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return val ? decodeURIComponent(val.pop()) : null;
}

function deleteCookie(name) {
    setCookie(name, '', -1);
}

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const password = this.password.value;
    const hashedPassword = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    users.push({ name, email, password: hashedPassword });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Регистрация прошла успешно. Теперь можете войти.');
    this.reset();
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.email.value.trim();
    const password = this.password.value;
    const hashedPassword = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    if (user) {
        setCookie('session', email, 7); 
        showUserState(user);
    } else {
        alert('Неверные учетные данные');
    }
    this.reset();
});

function showUserState(user) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('user-state').style.display = 'block';
    document.getElementById('welcome-message').textContent = 'Добро пожаловать, ' + user.name;
}

document.getElementById('logoutBtn').addEventListener('click', function() {
    deleteCookie('session');
    location.reload();
});

window.addEventListener('load', function() {
    const sessionEmail = getCookie('session');
    if (sessionEmail) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === sessionEmail);
        if (user) {
            showUserState(user);
        }
    }
});
