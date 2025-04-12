document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы модальных окон
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const closeBtns = document.querySelectorAll('.close');

  // Формы авторизации и регистрации
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Сообщения об ошибках
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  // Показываем модальное окно входа
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      loginModal.style.display = 'block';
    });
  }

  // Показываем модальное окно регистрации
  if (registerBtn) {
    registerBtn.addEventListener('click', function() {
      registerModal.style.display = 'block';
    });
  }

  // Закрываем модальные окна при клике на крестик
  closeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
      // Сбрасываем сообщения об ошибках
      loginError.textContent = '';
      registerError.textContent = '';
      // Сбрасываем формы
      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
    });
  });

  // Закрываем модальные окна при клике вне их области
  window.addEventListener('click', function(event) {
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
      loginError.textContent = '';
      if (loginForm) loginForm.reset();
    }
    if (event.target === registerModal) {
      registerModal.style.display = 'none';
      registerError.textContent = '';
      if (registerForm) registerForm.reset();
    }
  });

  function generateToken(length = 32) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

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

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      loginError.textContent = '';
      
      const email = this.email.value.trim();
      const password = this.password.value;
      const hashedPassword = await hashPassword(password);
      
      // Получаем пользователей из localStorage
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && u.password === hashedPassword);
      
      if (user) {
        // Генерируем случайный токен
        const token = generateToken();
        
        // Сохраняем токен в localStorage с привязкой к пользователю
        const authTokens = JSON.parse(localStorage.getItem('auth_tokens')) || {};
        authTokens[token] = {
          userId: user.email,
          name: user.name,
          expires: Date.now() + 7 * 86400000 // 7 дней
        };
        localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
        
        // Устанавливаем только токен в cookie
        setCookie('auth_token', token, 7);
        loginModal.style.display = 'none';
        
        // Перезагружаем страницу для обновления UI
        window.location.reload();
      } else {
        loginError.textContent = 'Неверный email или пароль';
      }
    });
  }

  // Обработка отправки формы регистрации
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      registerError.textContent = '';
      
      const name = this.name.value.trim();
      const email = this.email.value.trim();
      const password = this.password.value;
      
      if (password.length < 6) {
        registerError.textContent = 'Пароль должен содержать минимум 6 символов';
        return;
      }
      
      const hashedPassword = await hashPassword(password);
      
      // Получаем пользователей из localStorage
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      // Проверяем, существует ли пользователь с таким email
      if (users.find(u => u.email === email)) {
        registerError.textContent = 'Пользователь с таким email уже существует';
        return;
      }
      
      // Добавляем нового пользователя
      users.push({ name, email, password: hashedPassword });
      localStorage.setItem('users', JSON.stringify(users));
      
      // Генерируем случайный токен
      const token = generateToken();
      
      // Сохраняем токен в localStorage с привязкой к пользователю
      const authTokens = JSON.parse(localStorage.getItem('auth_tokens')) || {};
      authTokens[token] = {
        userId: email,
        name: name,
        expires: Date.now() + 7 * 86400000 // 7 дней
      };
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
      
      // Устанавливаем только токен в cookie
      setCookie('auth_token', token, 7);
      registerModal.style.display = 'none';
      
      // Перезагружаем страницу для обновления UI
      window.location.reload();
    });
  }

  // Обработка выхода из аккаунта
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Получаем текущий токен
      const token = getCookie('auth_token');
      
      // Удаляем токен из localStorage
      if (token) {
        const authTokens = JSON.parse(localStorage.getItem('auth_tokens')) || {};
        delete authTokens[token];
        localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
      }
      
      // Удаляем куки
      deleteCookie('auth_token');
      window.location.reload();
    });
  }
});
