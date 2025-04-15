document.addEventListener('DOMContentLoaded', function() {
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const loginModalContent = document.getElementById('login-modal-content');
  const registerModalContent = document.getElementById('register-modal-content');
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

  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      loginModal.style.display = 'block';
    });
  }

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

      if (loginError) loginError.textContent = '';
      if (registerError) registerError.textContent = '';
      
      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
    });
  });

  let isMouseDownInsideModal = false;

  if (loginModal) {
    loginModal.addEventListener('mousedown', function(event) {
      if (event.target === loginModal) {
        isMouseDownInsideModal = true;
      }
    });
  }
  if (registerModal) {
    registerModal.addEventListener('mousedown', function(event) {
      if (event.target === registerModal) {
        isMouseDownInsideModal = true;
      }
    });
  }


  window.addEventListener('mouseup', function(event) {
    if (event.target === loginModal && isMouseDownInsideModal) {
      loginModal.style.display = 'none';
      if (loginError) loginError.textContent = '';
      if (loginForm) loginForm.reset();
    }
    if (event.target === registerModal && isMouseDownInsideModal) {
      registerModal.style.display = 'none';
      if (registerError) registerError.textContent = '';
      if (registerForm) registerForm.reset();
    }
    isMouseDownInsideModal = false;
  });

  // Функция для выполнения HTTP запросов
  async function fetchApi(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include' 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (loginError) loginError.textContent = '';
      
      const email = this.email.value.trim();
      const password = this.password.value;
      
      try {
        await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        if (loginModal) loginModal.style.display = 'none';
        
        
        window.location.reload();
      } catch (error) {
        if (loginError) loginError.textContent = error.message || 'Неверный email или пароль';
      }
    });
  }

  // Обработка отправки формы регистрации
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (registerError) registerError.textContent = '';
      
      const name = this.name.value.trim();
      const email = this.email.value.trim();
      const password = this.password.value;
      
      const selectedRole = document.querySelector('input[name="role"]:checked')?.value || 'student';
      
      if (password.length < 6) {
        if (registerError) registerError.textContent = 'Пароль должен содержать минимум 6 символов';
        return;
      }
      
      try {
        await fetchApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role: selectedRole })
        });
        
        if (registerModal) registerModal.style.display = 'none';
        
        window.location.reload();
      } catch (error) {
        if (registerError) registerError.textContent = error.message || 'Ошибка при регистрации';
      }
    });
  }

  // Обработка выхода из аккаунта
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      try {
        await fetchApi('/auth/logout', {
          method: 'POST'
        });
        
        window.location.href = '/';
        // window.location.reload();
      } catch (error) {
        console.error('Ошибка при выходе:', error);
        
        window.location.href = '/';
        // window.location.reload();
      }
    });
  }
});
