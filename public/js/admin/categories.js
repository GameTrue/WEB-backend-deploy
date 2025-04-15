/**
 * Модуль управления категориями в админ-панели
 */
class AdminCategories {
  constructor() {
    this.categories = [];
    this.categoriesGrid = document.getElementById('categories-grid');
    this.categoriesPreloader = document.getElementById('categories-preloader');
    this.searchInput = document.getElementById('categories-search');
    this.addCategoryBtn = document.getElementById('add-category-btn');
  }

  async init() {
    this.bindEvents();
    await this.loadCategories();
  }

  bindEvents() {
    // Поиск
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
    
    // Кнопка добавления категории
    if (this.addCategoryBtn) {
      this.addCategoryBtn.addEventListener('click', this.showAddCategoryModal.bind(this));
    }
    
    // Делегирование событий для действий в сетке категорий
    if (this.categoriesGrid) {
      this.categoriesGrid.addEventListener('click', this.handleGridActions.bind(this));
    }
  }

  async loadCategories() {
    if (this.categoriesPreloader) {
      this.categoriesPreloader.style.display = 'block';
    }
    if (this.categoriesGrid) {
      this.categoriesGrid.style.display = 'none';
    }
    
    try {
      const response = await fetch('/api/admin/categories', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load categories');
      
      this.categories = await response.json();
      this.renderCategories(this.categories);
      
      if (this.categoriesPreloader) {
        this.categoriesPreloader.style.display = 'none';
      }
      if (this.categoriesGrid) {
        this.categoriesGrid.style.display = 'grid';
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      if (this.categoriesPreloader) {
        this.categoriesPreloader.innerHTML = `<p>Ошибка загрузки категорий: ${error.message}</p>`;
      }
    }
  }

  renderCategories(categories) {
    if (!this.categoriesGrid) return;
    
    this.categoriesGrid.innerHTML = '';
    
    if (categories.length === 0) {
      this.categoriesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Категории не найдены</h3>
          <p>Создайте первую категорию, чтобы организовать ваши курсы</p>
        </div>
      `;
      return;
    }
    
    categories.forEach(category => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.setAttribute('data-id', category.id);
      
      card.innerHTML = `
        <div class="category-header">
          <h3 class="category-name">${category.name}</h3>
        </div>
        <div class="category-body">
          <p class="category-description">${category.description || 'Нет описания'}</p>
          <div class="category-stats">
            <div class="category-stat">
              <span>Курсов: </span>
              <strong>${category.courses ? category.courses.length : 0}</strong>
            </div>
            <div class="category-stat">
              <span>Подкатегорий: </span>
              <strong>${category.children ? category.children.length : 0}</strong>
            </div>
          </div>
        </div>
        <div class="category-actions">
          <button class="admin-action edit" title="Редактировать" data-action="edit" data-id="${category.id}">✏️</button>
          <button class="admin-action delete" title="Удалить" data-action="delete" data-id="${category.id}">🗑️</button>
        </div>
      `;
      
      this.categoriesGrid.appendChild(card);
    });
  }

  handleSearch() {
    const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
    
    let filteredCategories = [...this.categories];
    
    // Применяем поиск
    if (searchTerm) {
      filteredCategories = filteredCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm) ||
        (category.description && category.description.toLowerCase().includes(searchTerm))
      );
    }
    
    this.renderCategories(filteredCategories);
  }

  async handleGridActions(e) {
    const actionButton = e.target.closest('[data-action]');
    if (!actionButton) return;
    
    const action = actionButton.getAttribute('data-action');
    const categoryId = actionButton.getAttribute('data-id');
    
    switch (action) {
      case 'edit':
        this.editCategory(categoryId);
        break;
      case 'delete':
        this.confirmDeleteCategory(categoryId);
        break;
    }
  }

  editCategory(categoryId) {
    const category = this.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    this.showEditCategoryModal(category);
  }

  confirmDeleteCategory(categoryId) {
    if (confirm('Вы уверены, что хотите удалить эту категорию? Это действие нельзя отменить.')) {
      this.deleteCategory(categoryId);
    }
  }

  async deleteCategory(categoryId) {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      
      alert('Категория успешно удалена');
      await this.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(`Ошибка при удалении категории: ${error.message}`);
    }
  }

  showAddCategoryModal() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    
    modal.innerHTML = `
      <div class="admin-modal-content">
        <div class="admin-modal-header">
          <h2 class="admin-modal-title">Добавить категорию</h2>
          <button class="admin-modal-close">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form id="add-category-form">
            <div class="admin-form-group">
              <label for="category-name">Название категории*</label>
              <input type="text" id="category-name" name="name" required>
            </div>
            
            <div class="admin-form-group">
              <label for="category-description">Описание</label>
              <textarea id="category-description" name="description"></textarea>
            </div>
            
            <div class="admin-form-group">
              <label for="category-parent">Родительская категория</label>
              <select id="category-parent" name="parentId">
                <option value="">Нет родительской категории</option>
                ${this.categories.map(category => 
                  `<option value="${category.id}">${category.name}</option>`
                ).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-button" id="save-category-btn">Сохранить</button>
          <button class="admin-modal-close button-grey">Отмена</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Анимационная задержка
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    
    // Привязываем события
    const closeButtons = modal.querySelectorAll('.admin-modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
        }, 300);
      });
    });
    
    const saveButton = modal.querySelector('#save-category-btn');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        await this.addCategory(modal);
      });
    }
  }

  async addCategory(modal) {
    const form = modal.querySelector('#add-category-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const categoryData = {
      name: formData.get('name'),
      description: formData.get('description'),
      parentId: formData.get('parentId') || null
    };
    
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }
      
      // Закрываем модальное окно
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
      }, 300);
      
      // Обновляем список категорий
      await this.refresh();
      
      alert('Категория успешно создана');
    } catch (error) {
      console.error('Error creating category:', error);
      alert(`Ошибка при создании категории: ${error.message}`);
    }
  }

  showEditCategoryModal(category) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    
    modal.innerHTML = `
      <div class="admin-modal-content">
        <div class="admin-modal-header">
          <h2 class="admin-modal-title">Редактировать категорию</h2>
          <button class="admin-modal-close">&times;</button>
        </div>
        <div class="admin-modal-body">
          <form id="edit-category-form">
            <div class="admin-form-group">
              <label for="category-name">Название категории*</label>
              <input type="text" id="category-name" name="name" value="${category.name}" required>
            </div>
            
            <div class="admin-form-group">
              <label for="category-description">Описание</label>
              <textarea id="category-description" name="description">${category.description || ''}</textarea>
            </div>
            
            <div class="admin-form-group">
              <label for="category-parent">Родительская категория</label>
              <select id="category-parent" name="parentId">
                <option value="">Нет родительской категории</option>
                ${this.categories
                  .filter(c => c.id !== category.id) // Исключаем текущую категорию
                  .map(c => 
                    `<option value="${c.id}" ${category.parentId === c.id ? 'selected' : ''}>${c.name}</option>`
                  ).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-button" id="update-category-btn" data-id="${category.id}">Обновить</button>
          <button class="admin-modal-close button-grey">Отмена</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Анимационная задержка
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    
    // Привязываем события
    const closeButtons = modal.querySelectorAll('.admin-modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
        }, 300);
      });
    });
    
    const updateButton = modal.querySelector('#update-category-btn');
    if (updateButton) {
      updateButton.addEventListener('click', async () => {
        await this.updateCategory(modal, category.id);
      });
    }
  }

  async updateCategory(modal, categoryId) {
    const form = modal.querySelector('#edit-category-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const categoryData = {
      name: formData.get('name'),
      description: formData.get('description'),
      parentId: formData.get('parentId') || null
    };
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }
      
      // Закрываем модальное окно
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
      }, 300);
      
      // Обновляем список категорий
      await this.refresh();
      
      alert('Категория успешно обновлена');
    } catch (error) {
      console.error('Error updating category:', error);
      alert(`Ошибка при обновлении категории: ${error.message}`);
    }
  }

  async refresh() {
    await this.loadCategories();
  }
}
