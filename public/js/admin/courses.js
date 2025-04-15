/**
 * Модуль управления курсами в админ-панели
 */
class AdminCourses {
  constructor() {
    this.courses = [];
    this.coursesTable = document.getElementById('courses-table');
    this.coursesTableBody = document.getElementById('courses-tbody');
    this.coursesPreloader = document.getElementById('courses-preloader');
    this.searchInput = document.getElementById('courses-search');
    this.categoryFilter = document.getElementById('courses-category-filter');
    this.statusFilter = document.getElementById('courses-status-filter');
    
    this.categories = [];
    
    // Модальные окна
    this.editCourseModal = document.getElementById('edit-course-modal');
    this.viewCourseModal = document.getElementById('view-course-modal');
  }

  async init() {
    await Promise.all([
      this.loadCategories(),
      this.loadCourses()
    ]);
    
    this.bindEvents();
  }

  bindEvents() {
    // Поиск
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
    
    // Фильтры
    if (this.categoryFilter) {
      this.categoryFilter.addEventListener('change', this.applyFilters.bind(this));
    }
    
    if (this.statusFilter) {
      this.statusFilter.addEventListener('change', this.applyFilters.bind(this));
    }
    
    // Делегирование событий для действий в таблице
    if (this.coursesTableBody) {
      this.coursesTableBody.addEventListener('click', this.handleTableActions.bind(this));
    }
    
    // События для модального окна редактирования
    if (this.editCourseModal) {
      // Кнопка сохранения
      const saveBtn = this.editCourseModal.querySelector('#save-course-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', this.updateCourse.bind(this));
      }
      
      // Кнопки закрытия
      const closeButtons = this.editCourseModal.querySelectorAll('.admin-modal-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.closeModal(this.editCourseModal);
        });
      });
    }
    
    // События для модального окна просмотра
    if (this.viewCourseModal) {
      // Кнопка редактирования
      const editBtn = this.viewCourseModal.querySelector('#edit-course-profile-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          const courseId = editBtn.getAttribute('data-id');
          this.closeModal(this.viewCourseModal);
          this.editCourse(courseId);
        });
      }
      
      // Кнопки закрытия
      const closeButtons = this.viewCourseModal.querySelectorAll('.admin-modal-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.closeModal(this.viewCourseModal);
        });
      });
    }
  }

  async loadCategories() {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load categories');
      
      this.categories = await response.json();
      
      this.fillCategorySelects();
      
      this.fillCategoryFilter();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }
  
  fillCategorySelects() {
    // Заполняем селект в модальном окне редактирования
    const categorySelect = this.editCourseModal?.querySelector('#course-category');
    if (categorySelect && this.categories.length > 0) {
      categorySelect.innerHTML = '<option value="">Без категории</option>';
      this.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
  }
  
  fillCategoryFilter() {
    // Заполняем селект для фильтрации
    if (this.categoryFilter && this.categories.length > 0) {
      this.categoryFilter.innerHTML = '<option value="all">Все категории</option>';
      console.log(this.categories);
      this.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        this.categoryFilter.appendChild(option);
      });
    }
  }

  async loadCourses() {
    if (this.coursesPreloader) {
      this.coursesPreloader.style.display = 'block';
    }
    if (this.coursesTable) {
      this.coursesTable.style.display = 'none';
    }
    
    try {
      const response = await fetch('/api/admin/courses', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load courses');
      
      this.courses = await response.json();
      this.renderCourses(this.courses);
      
      if (this.coursesPreloader) {
        this.coursesPreloader.style.display = 'none';
      }
      if (this.coursesTable) {
        this.coursesTable.style.display = 'table';
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      if (this.coursesPreloader) {
        this.coursesPreloader.innerHTML = `<p>Ошибка загрузки курсов: ${error.message}</p>`;
      }
    }
  }

  renderCourses(courses) {
    if (!this.coursesTableBody) return;
    
    this.coursesTableBody.innerHTML = '';
    
    if (courses.length === 0) {
      this.coursesTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">Курсы не найдены</td>
        </tr>
      `;
      return;
    }
    
    courses.forEach(course => {
      const statusClass = course.published ? 'status-active' : 'status-inactive';
      const statusText = course.published ? 'Опубликован' : 'Черновик';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="course-info">
            <div class="course-title">${course.title}</div>
          </div>
        </td>
        <td>${course.author ? course.author.name : 'Не указан'}</td>
        <td>${course.category ? course.category.name : 'Без категории'}</td>
        <td><span class="status-pill ${statusClass}">${statusText}</span></td>
        <td>${course.price > 0 ? `${course.price} руб.` : 'Бесплатный'}</td>
        <td>${course.enrollments ? course.enrollments.length : 0}</td>
        <td>${new Date(course.createdAt).toLocaleDateString()}</td>
        <td>
          <div class="admin-actions">
            <button class="admin-action view" title="Просмотр" data-action="view" data-id="${course.id}">👁️</button>
            <button class="admin-action edit" title="Редактировать" data-action="edit" data-id="${course.id}">✏️</button>
            <button class="admin-action delete" title="Удалить" data-action="delete" data-id="${course.id}">🗑️</button>
          </div>
        </td>
      `;
      
      this.coursesTableBody.appendChild(row);
    });
  }

  handleSearch() {
    this.applyFilters();
  }

  applyFilters() {
    const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
    const categoryFilter = this.categoryFilter ? this.categoryFilter.value : 'all';
    const statusFilter = this.statusFilter ? this.statusFilter.value : 'all';
    
    let filteredCourses = [...this.courses];
    
    // Применяем поиск
    if (searchTerm) {
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm)
      );
    }
    
    if (categoryFilter !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.categoryId === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      const isPublished = statusFilter === 'published';
      filteredCourses = filteredCourses.filter(course => course.published === isPublished);
    }
    
    this.renderCourses(filteredCourses);
  }

  async handleTableActions(e) {
    const actionButton = e.target.closest('[data-action]');
    if (!actionButton) return;
    
    const action = actionButton.getAttribute('data-action');
    const courseId = actionButton.getAttribute('data-id');
    
    switch (action) {
      case 'view':
        this.viewCourse(courseId);
        break;
      case 'edit':
        this.editCourse(courseId);
        break;
      case 'delete':
        this.confirmDeleteCourse(courseId);
        break;
    }
  }

  async viewCourse(courseId) {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch course details');
      
      const course = await response.json();
      this.fillViewCourseModal(course);
      this.openModal(this.viewCourseModal);
    } catch (error) {
      console.error('Error fetching course details:', error);
      alert('Не удалось загрузить данные курса');
    }
  }

  fillViewCourseModal(course) {
    if (!this.viewCourseModal) return;
    
    // Заполняем основные данные
    this.viewCourseModal.querySelector('#course-profile-title').textContent = course.title;
    
    const statusElem = this.viewCourseModal.querySelector('#course-profile-status');
    statusElem.textContent = course.published ? 'Опубликован' : 'Черновик';
    statusElem.className = `status-pill ${course.published ? 'status-active' : 'status-inactive'}`;
    
    this.viewCourseModal.querySelector('#course-profile-id').textContent = course.id;
    this.viewCourseModal.querySelector('#course-profile-author').textContent = course.author ? course.author.name : 'Не указан';
    this.viewCourseModal.querySelector('#course-profile-category').textContent = course.category ? course.category.name : 'Без категории';
    this.viewCourseModal.querySelector('#course-profile-created').textContent = new Date(course.createdAt).toLocaleDateString();
    this.viewCourseModal.querySelector('#course-profile-price').textContent = course.price > 0 ? `${course.price} руб.` : 'Бесплатный';
    this.viewCourseModal.querySelector('#course-profile-level').textContent = this.formatLevel(course.level);
    
    // Заполняем описание
    const descElem = this.viewCourseModal.querySelector('#course-profile-description');
    descElem.textContent = course.description || 'Описание отсутствует';
    
    // Заполняем уроки
    const lessonsElem = this.viewCourseModal.querySelector('#course-profile-lessons');
    const lessonsHeaderElem = this.viewCourseModal.querySelector('#course-profile-lessons-header');
    lessonsHeaderElem.textContent = `Уроки (${course.lessons ? course.lessons.length : 0})`;
    
    if (course.lessons && course.lessons.length > 0) {
      lessonsElem.innerHTML = `
        <ul class="lessons-list">
          ${course.lessons.map(lesson => 
            `<li>
              <span class="lesson-title">${lesson.title}</span>
            </li>`
          ).join('')}
        </ul>
      `;
    } else {
      lessonsElem.innerHTML = '<p>В этом курсе пока нет уроков</p>';
    }
    
    // Заполняем студентов
    const studentsElem = this.viewCourseModal.querySelector('#course-profile-students');
    const studentsHeaderElem = this.viewCourseModal.querySelector('#course-profile-students-header');
    studentsHeaderElem.textContent = `Студенты (${course.enrollments ? course.enrollments.length : 0})`;
    
    if (course.enrollments && course.enrollments.length > 0) {
      studentsElem.innerHTML = `
        <ul class="students-list">
          ${course.enrollments.map(enrollment => 
            `<li>
              <span class="student-name">${enrollment.user ? enrollment.user.name : 'Неизвестный студент'}</span>
              <span class="enrollment-date">${new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
            </li>`
          ).join('')}
        </ul>
      `;
    } else {
      studentsElem.innerHTML = '<p>На этот курс еще никто не записался</p>';
    }
    
    // Устанавливаем ID для кнопки редактирования
    this.viewCourseModal.querySelector('#edit-course-profile-btn').setAttribute('data-id', course.id);
  }

  editCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;
    
    this.fillEditCourseModal(course);
    this.openModal(this.editCourseModal);
  }

  fillEditCourseModal(course) {
    if (!this.editCourseModal) return;
    
    this.editCourseModal.querySelector('#course-id').value = course.id;
    this.editCourseModal.querySelector('#course-title').value = course.title;
    this.editCourseModal.querySelector('#course-description').value = course.description || '';
    this.editCourseModal.querySelector('#course-category').value = course.categoryId || '';
    this.editCourseModal.querySelector('#course-level').value = course.level || 'beginner';
    this.editCourseModal.querySelector('#course-price').value = course.price || 0;
    
    const publishedCheckbox = this.editCourseModal.querySelector('#course-published');
    if (publishedCheckbox) {
      publishedCheckbox.checked = course.published;
    }
  }

  formatLevel(level) {
    const levels = {
      beginner: 'Начинающий',
      intermediate: 'Средний',
      advanced: 'Продвинутый'
    };
    
    return levels[level] || level;
  }

  async updateCourse(e) {
    if (!this.editCourseModal) return;
    
    const form = this.editCourseModal.querySelector('#edit-course-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const courseId = formData.get('id');
    
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId') || null,
      level: formData.get('level'),
      price: parseFloat(formData.get('price') || '0'),
      published: formData.get('published') === 'on'
    };
    
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course');
      }
      
      // Закрываем модальное окно
      this.closeModal(this.editCourseModal);
      
      // Обновляем список курсов
      await this.refresh();
      
      // Показываем уведомление об успехе
      alert('Курс успешно обновлен');
    } catch (error) {
      console.error('Error updating course:', error);
      alert(`Ошибка при обновлении курса: ${error.message}`);
    }
  }

  confirmDeleteCourse(courseId) {
    if (confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) {
      this.deleteCourse(courseId);
    }
  }

  async deleteCourse(courseId) {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to delete course');
      
      alert('Курс успешно удален');
      await this.refresh();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Ошибка при удалении курса');
    }
  }

  openModal(modal) {
    if (!modal) return;
    
    // Добавляем класс для анимации с небольшой задержкой
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  closeModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('active');
  }

  async refresh() {
    await this.loadCourses();
  }
}
