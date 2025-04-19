// Функция для очистки кэша курсов
async function clearCoursesCache() {
  try {
    const response = await fetch('/courses/api/cache/clear', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin' 
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showNotification('Успех', 'Кэш курсов успешно очищен', 'success');
      console.log('Cache cleared successfully');
    } else {
      showNotification('Ошибка', result.message || 'Не удалось очистить кэш', 'error');
      console.error('Failed to clear cache:', result);
    }
  } catch (error) {
    showNotification('Ошибка', 'Произошла ошибка при очистке кэша', 'error');
    console.error('Error clearing cache:', error);
  }
}

// Функция для отображения уведомления
function showNotification(title, message, type) {
  // Проверка наличия элемента уведомлений
  let notificationContainer = document.getElementById('notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }
  
  // Создание уведомления
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
  notification.style.color = 'white';
  notification.style.padding = '15px 20px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Заголовок уведомления
  const titleElement = document.createElement('div');
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '5px';
  titleElement.textContent = title;
  
  // Текст уведомления
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  
  // Добавление элементов в уведомление
  notification.appendChild(titleElement);
  notification.appendChild(messageElement);
  
  // Добавление уведомления на страницу
  notificationContainer.appendChild(notification);
  
  // Автоматическое удаление через 5 секунд
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 500);
  }, 5000);
}