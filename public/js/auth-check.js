document.addEventListener('DOMContentLoaded', function() {
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
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      return null;
    }
  }

  // Элементы для отображения состояния авторизации
  const authButtons = document.querySelector('.auth-buttons');

  if (authButtons) {
    // Информация о текущем пользователе
    fetchApi('/auth/me')
      .then(userData => {
        if (userData) {
          // Сохраняем информацию о пользователе для использования в других скриптах
          window.currentUser = {
            name: userData.name,
            email: userData.email,
            role: userData.role
          };
          
          authButtons.innerHTML = `
            <div class="user-panel">
              <span class="user-greeting">Привет, ${userData.name}!</span>
              <div class="user-avatar">
                <img src="${userData.avatar}" alt="User Avatar">
              </div>
              <button class="register-btn main-button" id="logout-btn">Выйти</button>
            </div>
          `;
          
          const logoutBtn = document.getElementById('logout-btn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', async function() {
              try {
                await fetchApi('/auth/logout', { method: 'POST' });

                window.location.href = '/';
                // window.location.reload();
              } catch (error) {
                console.error('Ошибка при выходе:', error);

                window.location.href = '/';
                // window.location.reload();
              }
            });
          }
        } else {
          window.currentUser = null;
          
          authButtons.innerHTML = `
            <button class="login-btn main-button" id="login-btn">Login</button>
            <button class="register-btn main-button" id="register-btn">Register</button>
          `;
          
          const loginBtn = document.getElementById('login-btn');
          const registerBtn = document.getElementById('register-btn');
          
          if (loginBtn) {
            loginBtn.addEventListener('click', function() {
              const loginModal = document.getElementById('login-modal');
              if (loginModal) loginModal.style.display = 'block';
            });
          }
          
          if (registerBtn) {
            registerBtn.addEventListener('click', function() {
              const registerModal = document.getElementById('register-modal');
              if (registerModal) registerModal.style.display = 'block';
            });
          }
        }
      })
      .catch(() => {
        window.currentUser = null;
        
        authButtons.innerHTML = `
          <button class="login-btn main-button" id="login-btn">Login</button>
          <button class="register-btn main-button" id="register-btn">Register</button>
        `;
      });
  }
});
