/**
 * Модуль управления пользователями
 */
class AdminUsers {
  constructor() {
    this.users = [];
    this.usersTable = document.getElementById('users-table');
    this.usersTableBody = document.getElementById('users-tbody');
    this.usersPreloader = document.getElementById('users-preloader');
    this.searchInput = document.getElementById('users-search');
    this.roleFilter = document.getElementById('users-role-filter');
    this.statusFilter = document.getElementById('users-status-filter');
    
    // Модальные окна
    this.editUserModal = document.getElementById('edit-user-modal');
    this.viewUserModal = document.getElementById('view-user-modal');
    
    // Элементы загрузки аватара
    this.avatarFile = document.getElementById('avatar-file');
    this.uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    this.avatarPreviewImg = document.getElementById('avatar-preview-img');
    this.currentUserId = null;
  }

  async init() {
    this.bindEvents();
    await this.loadUsers();
  }

  bindEvents() {
    // Поиск
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
    
    // Фильтры
    if (this.roleFilter) {
      this.roleFilter.addEventListener('change', this.applyFilters.bind(this));
    }
    
    if (this.statusFilter) {
      this.statusFilter.addEventListener('change', this.applyFilters.bind(this));
    }
    
    // Делегирование событий для действий в таблице
    if (this.usersTableBody) {
      this.usersTableBody.addEventListener('click', this.handleTableActions.bind(this));
    }
    
    // Кнопка добавления пользователя
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
      addUserBtn.addEventListener('click', this.showAddUserModal.bind(this));
    }
    
    // События для модального окна редактирования
    if (this.editUserModal) {
      // Кнопка сохранения
      const saveBtn = this.editUserModal.querySelector('#save-user-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', this.updateUser.bind(this));
      }
      
      // Кнопки закрытия
      const closeButtons = this.editUserModal.querySelectorAll('.admin-modal-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.closeModal(this.editUserModal);
        });
      });
      
      // Обработка загрузки аватара
      if (this.avatarFile) {
        this.avatarFile.addEventListener('change', this.handleFileSelect.bind(this));
      }
      
      if (this.uploadAvatarBtn) {
        this.uploadAvatarBtn.addEventListener('click', this.uploadAvatar.bind(this));
      }
    }
    
    // События для модального окна просмотра
    if (this.viewUserModal) {
      const editBtn = this.viewUserModal.querySelector('#edit-profile-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          const userId = editBtn.getAttribute('data-id');
          this.closeModal(this.viewUserModal);
          this.editUser(userId);
        });
      }
      
      // Кнопки закрытия
      const closeButtons = this.viewUserModal.querySelectorAll('.admin-modal-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.closeModal(this.viewUserModal);
        });
      });
      
      // Обработка завершения сессий
      this.viewUserModal.addEventListener('click', async (e) => {
        const terminateBtn = e.target.closest('[data-session-id]');
        if (terminateBtn) {
          const userId = terminateBtn.getAttribute('data-user-id');
          const sessionId = terminateBtn.getAttribute('data-session-id');
          await this.terminateSession(userId, sessionId, terminateBtn);
        }
      });
    }
  }

  async loadUsers() {
    if (this.usersPreloader) {
      this.usersPreloader.style.display = 'block';
    }
    if (this.usersTable) {
      this.usersTable.style.display = 'none';
    }
    
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load users');
      
      this.users = await response.json();
      this.renderUsers(this.users);
      
      if (this.usersPreloader) {
        this.usersPreloader.style.display = 'none';
      }
      if (this.usersTable) {
        this.usersTable.style.display = 'table';
      }
    } catch (error) {
      console.error('Error loading users:', error);
      if (this.usersPreloader) {
        this.usersPreloader.innerHTML = `<p>Ошибка загрузки пользователей: ${error.message}</p>`;
      }
    }
  }

  renderUsers(users) {
    if (!this.usersTableBody) return;
    
    this.usersTableBody.innerHTML = '';
    
    if (users.length === 0) {
      this.usersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Пользователи не найдены</td>
        </tr>
      `;
      return;
    }
    
    users.forEach(user => {
      const statusClass = user.active ? 'status-active' : 'status-inactive';
      const statusText = user.active ? 'Активен' : 'Не активен';
      // console.log(user);
      const row = document.createElement('tr');
      
      let lastSession = null;
      if (user.sessions && user.sessions.length > 0) {
        lastSession = user.sessions.reduce((latest, current) => 
          new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
      }
      
      row.innerHTML = `
        <td>
          <div class="user-info">
        <img src="${user.avatar || 'https://via.placeholder.com/40'}" alt="${user.name}" class="avatar">
        <div>
          <div class="user-name">${user.name}</div>
          <div class="user-email">${user.email}</div>
        </div>
          </div>
        </td>
        <td><span class="user-role">${this.formatRole(user.role)}</span></td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        <td><span class="status-pill ${statusClass}">${statusText}</span></td>
        <td>${user.coursesCount || 0}</td>
        <td>${lastSession ? new Date(lastSession.createdAt).toLocaleString() : 'Никогда'}</td>
        <td>
          <div class="admin-actions">
        <button class="admin-action view" title="Просмотр" data-action="view" data-id="${user.id}">👁️</button>
        <button class="admin-action edit" title="Редактировать" data-action="edit" data-id="${user.id}">✏️</button>
        <button class="admin-action delete" title="Удалить" data-action="delete" data-id="${user.id}">🗑️</button>
          </div>
        </td>
      `;
      // console.log(new Date(user.sessions[user.sessions.length-1].createdAt));
      this.usersTableBody.appendChild(row);
    });
  }

  formatRole(role) {
    const roles = {
      admin: 'Администратор',
      teacher: 'Преподаватель',
      student: 'Студент'
    };
    
    return roles[role] || role;
  }

  handleSearch() {
    this.applyFilters();
  }

  applyFilters() {
    const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
    const roleFilter = this.roleFilter ? this.roleFilter.value : 'all';
    const statusFilter = this.statusFilter ? this.statusFilter.value : 'all';
    
    let filteredUsers = [...this.users];
    
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filteredUsers = filteredUsers.filter(user => user.active === isActive);
    }
    
    this.renderUsers(filteredUsers);
  }

  async handleTableActions(e) {
    const actionButton = e.target.closest('[data-action]');
    if (!actionButton) return;
    
    const action = actionButton.getAttribute('data-action');
    const userId = actionButton.getAttribute('data-id');
    
    switch (action) {
      case 'view':
        this.viewUser(userId);
        break;
      case 'edit':
        this.editUser(userId);
        break;
      case 'delete':
        this.confirmDeleteUser(userId);
        break;
    }
  }

  async viewUser(userId) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const user = await response.json();
      this.fillViewUserModal(user);
      this.openModal(this.viewUserModal);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Не удалось загрузить данные пользователя');
    }
  }

  fillViewUserModal(user) {
    if (!this.viewUserModal) return;

    let lastSession = null;
    if (user.sessions && user.sessions.length > 0) {
      lastSession = user.sessions.reduce((latest, current) => 
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      );
    }
    
    // Заполняем основные данные
    this.viewUserModal.querySelector('#profile-name').textContent = user.name;
    this.viewUserModal.querySelector('#profile-email').textContent = user.email;
    
    const statusElem = this.viewUserModal.querySelector('#profile-status');
    statusElem.textContent = user.active ? 'Активен' : 'Заблокирован';
    statusElem.className = `status-pill ${user.active ? 'status-active' : 'status-inactive'}`;
    
    this.viewUserModal.querySelector('#profile-avatar').src = user.avatar || 'https://via.placeholder.com/100';
    this.viewUserModal.querySelector('#profile-id').textContent = user.id;
    this.viewUserModal.querySelector('#profile-role').textContent = this.formatRole(user.role);
    this.viewUserModal.querySelector('#profile-created').textContent = new Date(user.createdAt).toLocaleDateString();
    this.viewUserModal.querySelector('#profile-last-login').textContent = lastSession ? new Date(lastSession.createdAt).toLocaleString() : 'Никогда';

    // Заполняем курсы
    const coursesElem = this.viewUserModal.querySelector('#profile-courses');
    if (user.courses && user.courses.length > 0) {
      coursesElem.innerHTML = `
        <ul class="user-courses-list">
          ${user.courses.map(course => 
            `<li>
              <span class="course-title">${course.title}</span>
              <span class="course-progress">${course.progress || 0}%</span>
            </li>`
          ).join('')}
        </ul>
      `;
    } else {
      coursesElem.innerHTML = '<p>Пользователь не записан ни на один курс</p>';
    }
    
    // Заполняем сессии
    const sessionsElem = this.viewUserModal.querySelector('#profile-sessions');
    if (user.sessions && user.sessions.length > 0) {
      sessionsElem.innerHTML = `
        <table class="sessions-table">
          <thead>
            <tr>
              <th>Устройство</th>
              <th>IP-адрес</th>
              <th>Последняя активность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            ${user.sessions.map(session => 
              `<tr>
                <td>${session.userAgent}</td>
                <td>${session.ipAddress}</td>
                <td>${new Date(session.createdAt).toLocaleString()}</td>
                <td>
                  <button class="admin-action delete" title="Завершить" data-user-id="${user.id}" data-session-id="${session.id}">❌</button>
                </td>
              </tr>`
            ).join('')}
          </tbody>
        </table>
      `;
    } else {
      sessionsElem.innerHTML = '<p>Нет активных сессий</p>';
    }
    
    // Устанавливаем ID для кнопки редактирования
    this.viewUserModal.querySelector('#edit-profile-btn').setAttribute('data-id', user.id);
  }

  editUser(userId) {
    this.currentUserId = userId; // Сохраняем ID текущего пользователя
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    
    this.fillEditUserModal(user);
    this.openModal(this.editUserModal);
  }

  fillEditUserModal(user) {
    if (!this.editUserModal) return;
    
    this.editUserModal.querySelector('#user-id').value = user.id;
    this.editUserModal.querySelector('#user-name').value = user.name;
    this.editUserModal.querySelector('#user-email').value = user.email;
    this.editUserModal.querySelector('#user-role').value = user.role;
    this.editUserModal.querySelector('#user-avatar').value = user.avatar || '';
    
    const activeCheckbox = this.editUserModal.querySelector('#user-active');
    if (activeCheckbox) {
      activeCheckbox.checked = user.active;
    }
    
    this.editUserModal.querySelector('#user-password').value = '';
    
    // Обновляем превью аватара
    if (this.avatarPreviewImg) {
      this.avatarPreviewImg.src = user.avatar || 'https://i.imgur.com/oxu8p7O.png';
    }
    
    // Сбрасываем поле выбора файла и деактивируем кнопку загрузки
    if (this.avatarFile) {
      this.avatarFile.value = '';
    }
    
    if (this.uploadAvatarBtn) {
      this.uploadAvatarBtn.disabled = true;
    }
  }

  async updateUser(e) {
    if (!this.editUserModal) return;
    
    const form = this.editUserModal.querySelector('#edit-user-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const userId = formData.get('id');
    
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      // active: formData.get('active') === 'on',
      avatar: formData.get('avatar') || null
    };
    
    // Добавляем пароль только если он заполнен
    const password = formData.get('password');
    if (password) {
      userData.password = password;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      // Закрываем модальное окно
      this.closeModal(this.editUserModal);
      
      // Обновляем список пользователей
      await this.refresh();
      
      // Показываем уведомление об успехе
      alert('Пользователь успешно обновлен');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Ошибка при обновлении пользователя: ${error.message}`);
    }
  }

  confirmDeleteUser(userId) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      this.deleteUser(userId);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      
      alert('Пользователь успешно удален');
      await this.refresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка при удалении пользователя');
    }
  }

  showAddUserModal() {
    // TODO: Реализовать модальное окно добавления пользователя
  }

  async terminateSession(userId, sessionId, buttonElement) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to terminate session');
      
      // Обновляем интерфейс
      const row = buttonElement.closest('tr');
      if (row) {
        row.style.backgroundColor = '#ffcccc';
        setTimeout(() => {
          row.remove();
        }, 500);
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      alert('Ошибка при завершении сессии');
    }
  }

  openModal(modal) {
    if (!modal) return;
    
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  closeModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('active');
  }

  async refresh() {
    await this.loadUsers();
  }

  // Обработчик выбора файла
  handleFileSelect() {
    if (!this.avatarFile || !this.uploadAvatarBtn || !this.avatarPreviewImg) return;
    
    const file = this.avatarFile.files[0];
    if (!file) {
      this.uploadAvatarBtn.disabled = true;
      return;
    }
    
    // Активируем кнопку загрузки
    this.uploadAvatarBtn.disabled = false;
    
    // Показываем превью выбранного изображения
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreviewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Загрузка аватара на сервер
  async uploadAvatar() {
    if (!this.avatarFile || !this.currentUserId) return;
    
    const file = this.avatarFile.files[0];
    if (!file) return;
    
    try {
      // Создаем объект FormData для отправки файла
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Отключаем кнопку на время загрузки
      if (this.uploadAvatarBtn) {
        this.uploadAvatarBtn.disabled = true;
        this.uploadAvatarBtn.textContent = 'Загрузка...';
      }
      
      // Отправляем запрос на загрузку аватара
      const response = await fetch(`/api/admin/users/${this.currentUserId}/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка загрузки аватара');
      }
      
      const result = await response.json();
      
      // Обновляем URL аватара в поле ввода
      const avatarUrlInput = this.editUserModal.querySelector('#user-avatar');
      if (avatarUrlInput) {
        avatarUrlInput.value = result.avatar;
      }
      
      // Сбрасываем поле выбора файла
      if (this.avatarFile) {
        this.avatarFile.value = '';
      }
      
      // Возвращаем исходный текст кнопки
      if (this.uploadAvatarBtn) {
        this.uploadAvatarBtn.textContent = 'Загрузить аватар';
        this.uploadAvatarBtn.disabled = true;
      }
      
      // Показываем уведомление об успешной загрузке
      alert('Аватар успешно загружен');
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(`Ошибка при загрузке аватара: ${error.message}`);
      
      // Возвращаем исходный текст кнопки
      if (this.uploadAvatarBtn) {
        this.uploadAvatarBtn.textContent = 'Загрузить аватар';
        this.uploadAvatarBtn.disabled = false;
      }
    }
  }
}
