/**
 * Функционал для страницы "Мои курсы" преподавателя
 */
class TeacherCourses {
  constructor() {
    this.coursesGrid = document.getElementById('teacher-courses-grid');
    this.preloader = document.getElementById('courses-preloader');
    this.emptyState = document.getElementById('courses-empty');
    this.courseFilter = document.getElementById('course-filter');
    this.totalCoursesElement = document.getElementById('total-courses');
    this.totalStudentsElement = document.getElementById('total-students');
    this.publishedCoursesElement = document.getElementById('published-courses');
    this.notificationsContainer = document.getElementById('notifications');
    
    this.courses = [];
    
    this.init();
  }
  
  async init() {
    // Check for stored notifications
    this.checkStoredNotifications();
    
    // Загружаем курсы
    await this.loadCourses();
    
    // Устанавливаем обработчики событий
    if (this.courseFilter) {
      this.courseFilter.addEventListener('change', () => {
        this.displayCourses(this.courses, this.courseFilter.value);
      });
    }
    
    // Подключаемся к SSE для обновлений в реальном времени
    this.connectToSSE();
  }
  
  async loadCourses() {
    try {
      const response = await fetch('/courses/api/my', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load courses');
      }
      
      this.courses = await response.json();
      
      // Обновляем статистику
      this.updateStats(this.courses);
      
      // Отображаем курсы
      this.displayCourses(this.courses);
      
      if (this.preloader) {
        this.preloader.style.display = 'none';
      }
      
      if (this.courses.length === 0 && this.emptyState) {
        this.emptyState.style.display = 'block';
      } else if (this.coursesGrid) {
        this.coursesGrid.style.display = 'grid';
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      if (this.preloader) {
        this.preloader.innerHTML = `<p class="error-message">Не удалось загрузить курсы. ${error.message}</p>`;
      }
    }
  }
  
  updateStats(coursesList) {
    const totalCourses = coursesList.length;
    
    // Считаем уникальных студентов
    let totalStudents = 0;
    const studentIds = new Set();
    coursesList.forEach(course => {
      if (course.enrollments) {
        course.enrollments.forEach(enrollment => {
          studentIds.add(enrollment.userId);
        });
      }
    });
    totalStudents = studentIds.size;
    
    // Считаем опубликованные курсы
    const published = coursesList.filter(course => course.published).length;
    
    // Обновляем UI
    if (this.totalCoursesElement) this.totalCoursesElement.textContent = totalCourses;
    if (this.totalStudentsElement) this.totalStudentsElement.textContent = totalStudents;
    if (this.publishedCoursesElement) this.publishedCoursesElement.textContent = published;
  }
  
  displayCourses(coursesList, filter = 'all') {
    if (!this.coursesGrid) return;
    
    this.coursesGrid.innerHTML = '';
    
    let filteredCourses = coursesList;
    
    // Применяем фильтр
    if (filter === 'published') {
      filteredCourses = coursesList.filter(course => course.published);
    } else if (filter === 'draft') {
      filteredCourses = coursesList.filter(course => !course.published);
    }
    
    // if (filteredCourses.length === 0) {
    //   this.coursesGrid.innerHTML = `
    //     <div class="empty-filter">
    //       <p>Нет курсов, соответствующих выбранному фильтру.</p>
    //     </div>
    //   `;
    //   return;
    // }
    
    filteredCourses.forEach(course => {
      const courseCard = document.createElement('div');
      courseCard.className = 'course-card';
      courseCard.id = `course-${course.id}`;
      
      courseCard.innerHTML = `
        <span class="course-status ${course.published ? 'status-published' : 'status-draft'}">
            ${course.published ? 'Опубликован' : 'Черновик'}
        </span>
        <div class="course-header">
          <h3 class="course-title">${course.title}</h3>
          <div class="course-category">${course.category ? course.category.name : 'Без категории'}</div>
        </div>
        <div class="course-info">
          <div class="info-item">
            <span class="info-icon">📚</span>
            <span>${course.lessons ? course.lessons.length : 0} уроков</span>
          </div>
          <div class="info-item">
            <span class="info-icon">👨‍🎓</span>
            <span>${course.enrollments ? course.enrollments.length : 0} студентов</span>
          </div>
        </div>
        <div class="course-actions">
          <a href="/courses/my/${course.id}" class="course-btn btn-edit">Управление</a>
          <button class="course-btn btn-delete" data-id="${course.id}">Удалить</button>
        </div>
      `;
      
      // Добавляем обработчик для кнопки удаления
      const deleteBtn = courseCard.querySelector('.btn-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
          await this.deleteCourse(e, course.id, courseCard);
        });
      }
      
      this.coursesGrid.appendChild(courseCard);
    });
  }
  
  async deleteCourse(event, courseId, courseCard) {
    if (confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) {
      try {
        const response = await fetch(`/courses/api/${courseId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete course');
        }
        
        // Удаляем из списка
        this.courses = this.courses.filter(c => c.id !== courseId);
        
        // Обновляем статистику
        this.updateStats(this.courses);
        
        // Удаляем с анимацией
        courseCard.style.opacity = '0';
        setTimeout(() => {
          courseCard.remove();
          if (this.courses.length === 0) {
            if (this.coursesGrid) this.coursesGrid.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'block';
          }
        }, 300);
        
        // this.showNotification('success', 'Курс удален', 'Курс был успешно удален.');
      } catch (error) {
        console.error('Error deleting course:', error);
        this.showNotification('error', 'Ошибка', 'Не удалось удалить курс. Пожалуйста, попробуйте еще раз.');
      }
    }
  }
  
  showNotification(type, title, message) {
    if (!this.notificationsContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';
    
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
    `;
    
    this.notificationsContainer.appendChild(notification);
    
    // Скрываем уведомление через 5 секунд
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(50px)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
  
  connectToSSE() {
    console.log('Connecting to SSE endpoint...');
    if (this.eventSource) {
      this.eventSource.close();
    }
    
    this.eventSource = new EventSource('/courses/events', { withCredentials: true });
    
    this.eventSource.addEventListener('open', () => {
      console.log('SSE connection established');
      this.showNotification('info', 'Соединение установлено', 'Режим реального времени активирован');
    });
    
    this.eventSource.addEventListener('course-update', (event) => {
      try {
        console.log('Raw SSE event received:', event);
        const data = JSON.parse(event.data);
        console.log('SSE course-update event received:', data);
        
        if (data.action === 'create') {
          this.showNotification('info', 'Новый курс', `Создан новый курс: "${data.title}"`);
          this.loadCourses();
        } else if (data.action === 'update') {
          this.showNotification('success', 'Курс обновлен', `Курс "${data.title}" был обновлен`);
          this.loadCourses();
        } else if (data.action === 'delete') {
          this.showNotification('warning', 'Курс удален', `Курс "${data.title}" был удален`);
          this.loadCourses();
        }
        else {
          this.showNotification('success', 'Тест', `Тест`);
        }
      } catch (error) {
        console.error('Error parsing SSE event data:', error, event.data);
      }
    });
    
    this.eventSource.addEventListener('message', (event) => {
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
      console.error('SSE connection error:', error);
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
  const teacherCourses = new TeacherCourses();
});
