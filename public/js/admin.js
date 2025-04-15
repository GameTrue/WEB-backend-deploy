/**
 * Основной JavaScript файл для функциональности админ-панели
 */
class AdminPanel {
  constructor() {
    this.tabs = document.querySelectorAll('.admin-tab');
    this.tabContents = document.querySelectorAll('.admin-tab-content');
    this.activeModule = null;
    
    this.modules = {
      users: null,
      courses: null,
      categories: null,
      statistics: null,
    };
    
    this.init();
  }

  init() {
    // Инициализация переключения вкладок
    this.initTabs();
    
    const activeTabId = localStorage.getItem('adminActiveTab') || 'users';
    this.activateTab(activeTabId);
    
    // Слушатель событий для модальных окон
    document.addEventListener('click', (e) => {
      if (e.target.matches('.admin-modal') || e.target.matches('.admin-modal-close')) {
        this.closeAllModals();
      }
    });
  }

  initTabs() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        this.activateTab(tabId);
        localStorage.setItem('adminActiveTab', tabId);
      });
    });
  }

  activateTab(tabId) {
    this.tabs.forEach(tab => tab.classList.remove('active'));
    this.tabContents.forEach(content => content.classList.remove('active'));
    
    const activeTab = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(`${tabId}-content`);
    
    if (activeTab && activeContent) {
      activeTab.classList.add('active');
      activeContent.classList.add('active');
      
      this.loadModule(tabId);
    }
  }

  async loadModule(moduleId) {
    if (this.modules[moduleId]) {
      await this.modules[moduleId].refresh();
      this.activeModule = this.modules[moduleId];
      return;
    }
    
    try {
      switch (moduleId) {
        case 'users':
          this.modules.users = new AdminUsers();
          await this.modules.users.init();
          break;
        case 'courses':
          this.modules.courses = new AdminCourses();
          await this.modules.courses.init();
          break;
        case 'categories':
          this.modules.categories = new AdminCategories();
          await this.modules.categories.init();
          break;
        case 'statistics':
          this.modules.statistics = new AdminStatistics();
          await this.modules.statistics.init();
          break;
      }
      
      this.activeModule = this.modules[moduleId];
    } catch (error) {
      console.error(`Error loading admin module ${moduleId}:`, error);
      this.showError(`Не удалось загрузить модуль "${moduleId}"`);
    }
  }

  showError(message) {
    alert(message);
  }

  closeAllModals() {
    document.querySelectorAll('.admin-modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.adminPanel = new AdminPanel();
});
