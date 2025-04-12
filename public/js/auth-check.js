document.addEventListener('DOMContentLoaded', function() {
  function getCookie(name) {
    const val = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return val ? decodeURIComponent(val.pop()) : null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  function validateToken() {
    const token = getCookie('auth_token');
    
    if (!token) {
      return false;
    }
    
    const authTokens = JSON.parse(localStorage.getItem('auth_tokens')) || {};
    
    if (!authTokens[token] || authTokens[token].expires < Date.now()) {
      deleteCookie('auth_token');
      return false;
    }
    
    return {
      userId: authTokens[token].userId,
      name: authTokens[token].name
    };
  }

  const authButtons = document.querySelector('.auth-buttons');

  if (authButtons) {
    const user = validateToken();
    
    if (user) {
      authButtons.innerHTML = `
        <div class="user-panel">
          <span class="user-greeting">Привет, ${user.name}!</span>
          <button class="register-btn main-button" id="logout-btn">Выйти</button>
        </div>
      `;
      
      document.getElementById('logout-btn').addEventListener('click', function() {
        const token = getCookie('auth_token');
        
        if (token) {
          const authTokens = JSON.parse(localStorage.getItem('auth_tokens')) || {};
          delete authTokens[token];
          localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
        }
        
        deleteCookie('auth_token');
        window.location.reload();
      });
    } else {
      authButtons.innerHTML = `
        <button class="login-btn main-button" id="login-btn">Login</button>
        <button class="register-btn main-button" id="register-btn">Register</button>
      `;
      
      document.getElementById('login-btn').addEventListener('click', function() {
        document.getElementById('login-modal').style.display = 'block';
      });
      
      document.getElementById('register-btn').addEventListener('click', function() {
        document.getElementById('register-modal').style.display = 'block';
      });
    }
  }
});
