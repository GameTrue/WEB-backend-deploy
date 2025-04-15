/**
 * Функционал для детальной страницы курса преподавателя
 */
class CourseDetail {
  constructor(courseId) {
    this.courseId = courseId;
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    this.init();
  }
  
  init() {
    // Инициализируем переключение вкладок
    this.initTabs()
    this.initActionButtons();
    this.initSettingsForm();
    
    this.loadCategories();
    
    // Подключаемся к SSE
    this.connectToSSE();
  }
  
  initTabs() {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        
        const tabName = button.getAttribute('data-tab');
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
          tabContent.classList.add('active');
        }
        
        if (tabName === 'submissions') {
          this.loadSubmissions();
        }
      });
    });
  }
  
  initActionButtons() {
    // Публикация/снятие с публикации
    const togglePublishBtn = document.getElementById('toggle-publish');
    if (togglePublishBtn) {
      togglePublishBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const isPublished = togglePublishBtn.querySelector('.action-content h3').textContent === 'Снять с публикации';
        
        try {
          const response = await fetch(`/courses/api/${this.courseId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              published: !isPublished
            }),
            credentials: 'include'
          });
          
          if (response.ok) {
            localStorage.setItem('course_notification', JSON.stringify({
              type: 'success',
              title: 'Изменения сохранены',
              message: 'Настройки курса были успешно обновлены',
              timestamp: Date.now()
            }));

            window.location.reload();
          } else {
            alert('Не удалось изменить статус публикации');
          }
        } catch (error) {
          console.error('Error toggling publish status:', error);
          alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
        }
      });
    }
    
    // Редактирование - перейти на вкладку настроек
    const editCourseBtn = document.getElementById('edit-course');
    if (editCourseBtn) {
      editCourseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const settingsTab = document.querySelector('[data-tab="settings"]');
        if (settingsTab) {
          settingsTab.click();
        }
        
        const titleInput = document.getElementById('course-title');
        if (titleInput) {
          titleInput.focus();
        }
      });
    }
    
    // Удаление курса
    const deleteCourseBtn = document.getElementById('delete-course');
    if (deleteCourseBtn) {
      deleteCourseBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) {
          try {
            const response = await fetch(`/courses/api/${this.courseId}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            
            if (response.ok) {
              window.location.href = '/courses/my';
            } else {
              alert('Не удалось удалить курс');
            }
          } catch (error) {
            console.error('Error deleting course:', error);
            alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
          }
        }
      });
    }
    
    // Инициализируем кнопки удаления уроков
    document.querySelectorAll('.lesson-action.delete').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const lessonId = button.getAttribute('data-id');
        
        if (confirm('Вы уверены, что хотите удалить этот урок? Это действие нельзя отменить.')) {
          try {
            const response = await fetch(`/lessons/api/${lessonId}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            
            if (response.ok) {
              const lessonRow = button.closest('.lesson-row');
              lessonRow.style.opacity = '0';
              setTimeout(() => {
                lessonRow.remove();
                
                const lessonRows = document.querySelectorAll('.lesson-row:not(.header)');
                if (lessonRows.length === 0) {
                  this.showEmptyLessonsState();
                }
              }, 300);
            } else {
              alert('Не удалось удалить урок');
            }
          } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
          }
        }
      });
    });
    
    // Инициализируем кнопки удаления студентов
    document.querySelectorAll('.student-action.remove').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const enrollmentId = button.getAttribute('data-id');
        
        if (confirm('Вы уверены, что хотите удалить этого студента из курса?')) {
          try {
            const response = await fetch(`/enrollments/${enrollmentId}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            
            if (response.ok) {
              const studentRow = button.closest('.student-row');
              studentRow.style.opacity = '0';
              setTimeout(() => {
                studentRow.remove();
                
                const studentRows = document.querySelectorAll('.student-row:not(.header)');
                if (studentRows.length === 0) {
                  this.showEmptyStudentsState();
                }
              }, 300);
            } else {
              alert('Не удалось удалить студента');
            }
          } catch (error) {
            console.error('Error removing student:', error);
            alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
          }
        }
      });
    });
  }
  
  initSettingsForm() {
    const courseSettingsForm = document.getElementById('course-settings-form');
    if (courseSettingsForm) {
      courseSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(courseSettingsForm);
        const courseData = {
          title: formData.get('title'),
          description: formData.get('description'),
          categoryId: formData.get('categoryId'),
          level: formData.get('level'),
          price: parseFloat(formData.get('price') || '0'),
          published: formData.get('published') === 'on'
        };
        
        try {
          const response = await fetch(`/courses/api/${this.courseId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(courseData),
            credentials: 'include'
          });
          
          if (response.ok) {
            localStorage.setItem('course_notification', JSON.stringify({
              type: 'success',
              title: 'Изменения сохранены',
              message: 'Настройки курса были успешно обновлены',
              timestamp: Date.now()
            }));
            
            window.location.reload();
          } else {
            alert('Не удалось сохранить изменения');
          }
        } catch (error) {
          console.error('Error updating course:', error);
          alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
        }
      });
    }
    
    // Кнопка отмены в настройках
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    if (cancelSettingsBtn) {
      cancelSettingsBtn.addEventListener('click', () => {
        // Возвращаемся на вкладку обзора
        const overviewTab = document.querySelector('[data-tab="overview"]');
        if (overviewTab) {
          overviewTab.click();
        }
      });
    }
  }
  
  async loadCategories() {
    const categorySelect = document.getElementById('course-category');
    if (!categorySelect) return;
    
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const categories = await response.json();
        const currentCategoryId = categorySelect.getAttribute('data-current-category');
        
        if (categories.length > 0) {
          categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            option.selected = category.id === currentCategoryId;
            categorySelect.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }
  
  async loadSubmissions() {
    const submissionsContainer = document.getElementById('submissions-container');
    if (!submissionsContainer) return;
    
    try {
      const response = await fetch('/submissions/ungraded', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const submissions = await response.json();
        
        const courseSubmissions = submissions.filter(submission => 
          submission.assignment.lesson.course.id === this.courseId
        );
        
        if (courseSubmissions.length > 0) {
          let html = `
            <div class="submissions-table">
              <div class="submission-row header">
                <div class="submission-cell">Студент</div>
                <div class="submission-cell">Задание</div>
                <div class="submission-cell">Дата отправки</div>
                <div class="submission-cell">Действия</div>
              </div>
          `;
          
          courseSubmissions.forEach(submission => {
            html += `
              <div class="submission-row">
                <div class="submission-cell">${submission.user.name}</div>
                <div class="submission-cell">${submission.assignment.title}</div>
                <div class="submission-cell">${this.formatDate(submission.submittedAt)}</div>
                <div class="submission-cell actions">
                  <a href="/submissions/${submission.id}/grade" class="submission-action grade">📝</a>
                </div>
              </div>
            `;
          });
          
          html += '</div>';
          submissionsContainer.innerHTML = html;
        } else {
          this.showEmptySubmissionsState();
        }
      } else {
        submissionsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">❌</div>
            <h3>Не удалось загрузить работы</h3>
            <p>Пожалуйста, попробуйте еще раз.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      submissionsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">❌</div>
          <h3>Ошибка загрузки</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
  
  showEmptyLessonsState() {
    const lessonsListElement = document.getElementById('lessons-list');
    if (lessonsListElement) {
      lessonsListElement.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>В этом курсе пока нет уроков</h3>
          <p>Добавьте первый урок, чтобы начать создание контента</p>
          <a href="/lessons/course/${this.courseId}" class="button-blue">+ Добавить урок</a>
        </div>
      `;
    }
  }
  
  showEmptyStudentsState() {
    const studentsTabElement = document.getElementById('students-tab');
    if (studentsTabElement) {
      studentsTabElement.innerHTML = `
        <h2>Студенты курса</h2>
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>На курс еще никто не записался</h3>
          <p>Когда студенты запишутся на курс, они появятся здесь</p>
        </div>
      `;
    }
  }
  
  showEmptySubmissionsState() {
    const submissionsContainer = document.getElementById('submissions-container');
    if (submissionsContainer) {
      submissionsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✓</div>
          <h3>Непроверенных работ нет</h3>
          <p>Все работы студентов проверены.</p>
        </div>
      `;
    }
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  showNotification(type, title, message) {
    let notificationsContainer = document.querySelector('.notifications');
    if (!notificationsContainer) {
      notificationsContainer = document.createElement('div');
      notificationsContainer.className = 'notifications';
      document.body.appendChild(notificationsContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
    `;
    
    notificationsContainer.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(50px)';
      setTimeout(() => {
        notification.remove();
        if (notificationsContainer.children.length === 0) {
          notificationsContainer.remove();
        }
      }, 300);
    }, 5000);
  }
  
  connectToSSE() {
    console.log('Connecting to SSE endpoint for course:', this.courseId);
    
    if (this.eventSource) {
      this.eventSource.close();
    }
    
    this.eventSource = new EventSource('/courses/events', { withCredentials: true });
    
    this.eventSource.addEventListener('open', () => {
      console.log('SSE connection established for course detail page');
      
      this.checkStoredNotifications();
    });
    
    this.eventSource.addEventListener('course-update', (event) => {
      try {
        console.log('Raw SSE event received:', event);
        const data = JSON.parse(event.data);
        console.log('SSE course-update event received:', data);
        
        if (data.courseId === this.courseId) {
          if (data.action === 'create') {
            this.showNotification('success', 'Курс создан', `Курс "${data.title}" был создан`);
          } else if (data.action === 'update') {
            this.showNotification('info', 'Курс обновлен', `Информация о курсе "${data.title}" была обновлена`);
          } else if (data.action === 'delete') {
            this.showNotification('warning', 'Курс удален', `Курс "${data.title}" был удален`);
          }
        }
      } catch (error) {
        console.error('Error parsing SSE event data:', error, event.data);
      }
    });
    
    this.eventSource.addEventListener('message', (event) => {
      // Handle default message event
      console.log('SSE default message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('Parsed message data:', data);
      } catch (error) {
        console.error('Error parsing default message:', error);
      }
    });
    
    this.eventSource.addEventListener('heartbeat', (event) => {
      console.log('SSE heartbeat received:', event.data);
    });
    
    this.eventSource.addEventListener('error', (error) => {
      console.error('SSE connection error in course detail page:', error);
      this.eventSource.close();
      
      console.log('Attempting to reconnect in 5 seconds...');
      setTimeout(() => this.connectToSSE(), 5000);
    });
  }
  
  checkStoredNotifications() {
    const storedNotification = localStorage.getItem('course_notification');
    if (storedNotification) {
      try {
        const notification = JSON.parse(storedNotification);
        
        // Only show notifications that are less than 3 seconds old
        if (Date.now() - notification.timestamp < 3000) {
          this.showNotification(
            notification.type,
            notification.title,
            notification.message
          );
        }
        
        localStorage.removeItem('course_notification');
      } catch (error) {
        console.error('Error parsing stored notification:', error);
        localStorage.removeItem('course_notification');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const pathSegments = window.location.pathname.split('/');
  const courseId = pathSegments[pathSegments.length - 1];
  
  const courseDetail = new CourseDetail(courseId);
});