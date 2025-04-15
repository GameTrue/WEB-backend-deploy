/**
 * Модуль статистики в админ-панели
 */
class AdminStatistics {
  constructor() {
    this.totalUsers = document.getElementById('total-users');
    this.totalCourses = document.getElementById('total-courses');
    this.totalEnrollments = document.getElementById('total-enrollments');
    this.totalCompleted = document.getElementById('total-completed');
    
    this.userStatsChart = null;
    this.activityChart = null;
    this.rolesChart = null;
    
    this.userStatsPeriod = document.getElementById('user-stats-period');
    this.activityStatsPeriod = document.getElementById('activity-stats-period');
  }

  async init() {
    this.bindEvents();
    await this.loadSummary();
    await this.loadCharts();
  }

  bindEvents() {
    // Период статистики пользователей
    if (this.userStatsPeriod) {
      this.userStatsPeriod.addEventListener('change', () => {
        this.loadUsersChart(this.userStatsPeriod.value);
      });
    }
    
    // Период статистики активности
    if (this.activityStatsPeriod) {
      this.activityStatsPeriod.addEventListener('change', () => {
        this.loadActivityChart(this.activityStatsPeriod.value);
      });
    }
  }

  async loadSummary() {
    try {
      const response = await fetch('/api/admin/statistics/summary', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load statistics summary');
      
      const data = await response.json();
      
      // Обновляем цифры статистики
      if (this.totalUsers) this.totalUsers.textContent = data.usersCount;
      if (this.totalCourses) this.totalCourses.textContent = data.coursesCount;
      if (this.totalEnrollments) this.totalEnrollments.textContent = data.enrollmentsCount;
      if (this.totalCompleted) this.totalCompleted.textContent = data.completedEnrollments;
      
    } catch (error) {
      console.error('Error loading statistics summary:', error);
    }
  }

  async loadCharts() {
    // Загружаем все графики
    await Promise.all([
      this.loadUsersChart('month'),
      this.loadActivityChart('month'),
      this.loadRolesChart()
    ]);
  }

  async loadUsersChart(period = 'month') {
    try {
      const response = await fetch(`/api/admin/statistics/users?period=${period}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load users statistics');
      
      const data = await response.json();
      
      const ctx = document.getElementById('user-registration-chart');
      if (!ctx) return;
      
      // Если график уже существует, уничтожаем его
      if (this.userStatsChart) {
        this.userStatsChart.destroy();
      }
      
      // Создаем новый график
      this.userStatsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Новые пользователи',
            data: data.data,
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Регистрация новых пользователей'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error loading users statistics:', error);
    }
  }

  async loadActivityChart(period = 'month') {
    try {
      const response = await fetch(`/api/admin/statistics/activity?period=${period}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load activity statistics');
      
      const data = await response.json();
      
      const ctx = document.getElementById('user-activity-chart');
      if (!ctx) return;
      
      // Если график уже существует, уничтожаем его
      if (this.activityChart) {
        this.activityChart.destroy();
      }
      
      // Создаем новый график
      this.activityChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Активные сессии',
            data: data.data,
            backgroundColor: '#3a86ff',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Активность пользователей'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error loading activity statistics:', error);
    }
  }

  async loadRolesChart() {
    try {
      const response = await fetch('/api/admin/statistics/roles', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load roles statistics');
      
      const data = await response.json();
      
      const ctx = document.getElementById('user-roles-chart');
      if (!ctx) return;
      
      // Если график уже существует, уничтожаем его
      if (this.rolesChart) {
        this.rolesChart.destroy();
      }
      
      // Создаем новый график
      this.rolesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Пользователи',
            data: data.data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',  // Красный для администраторов
              'rgba(54, 162, 235, 0.7)',  // Синий для преподавателей
              'rgba(255, 206, 86, 0.7)'   // Желтый для студентов
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Распределение пользователей по ролям'
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error loading roles statistics:', error);
    }
  }

  async refresh() {
    await this.loadSummary();
    await this.loadCharts();
  }
}
