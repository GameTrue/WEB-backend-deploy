/**
 * Функционал для страницы создания курса
 */
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('create-course-form');
  const titleInput = document.getElementById('course-title');
  const descriptionTextarea = document.getElementById('course-description');
  const categorySelect = document.getElementById('course-category');
  const levelSelect = document.getElementById('course-level');
  const priceInput = document.getElementById('course-price');
  const publishedCheckbox = document.getElementById('course-published');
  
  // Preview elements
  const previewTitle = document.getElementById('preview-title');
  const previewDescription = document.getElementById('preview-description');
  const previewCategory = document.getElementById('preview-category');
  const previewLevel = document.getElementById('preview-level').querySelector('span:last-child');
  const previewPrice = document.getElementById('preview-price').querySelector('span:last-child');
  const previewStatus = document.getElementById('preview-status');
  
  setupSSE();
  
  // Listen for input changes to update preview
  titleInput.addEventListener('input', updatePreview);
  descriptionTextarea.addEventListener('input', updatePreview);
  categorySelect.addEventListener('change', updatePreview);
  levelSelect.addEventListener('change', updatePreview);
  priceInput.addEventListener('input', updatePreview);
  publishedCheckbox.addEventListener('change', updatePreview);
  
  // Process form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId'),
      level: formData.get('level'),
      price: parseFloat(formData.get('price') || '0'),
      published: formData.get('published') === 'on'
    };
    
    try {
      const response = await fetch('/courses/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        window.location.href = `/courses/my/${result.id}`;
      } else {
        showFormError('Не удалось создать курс. Проверьте введенные данные.');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      showFormError('Произошла ошибка при создании курса. Пожалуйста, попробуйте еще раз.');
    }
  });
  
  function updatePreview() {
    // Update title
    previewTitle.textContent = titleInput.value || 'Название курса';
    
    // Update description
    previewDescription.textContent = descriptionTextarea.value || 'Здесь будет отображаться описание курса...';
    
    // Update category
    const selectedCategory = categorySelect.options[categorySelect.selectedIndex];
    previewCategory.textContent = selectedCategory.textContent !== 'Выберите категорию' 
      ? selectedCategory.textContent 
      : 'Категория';
    
    // Update level
    const levels = {
      'beginner': 'Начинающий',
      'intermediate': 'Средний',
      'advanced': 'Продвинутый'
    };
    previewLevel.textContent = levels[levelSelect.value] || 'Начинающий';
    
    // Update price
    const price = parseFloat(priceInput.value || '0');
    previewPrice.textContent = price > 0 ? `${price} руб.` : 'Бесплатно';
    
    // Update status
    previewStatus.textContent = publishedCheckbox.checked ? 'Опубликован' : 'Черновик';
    previewStatus.className = publishedCheckbox.checked ? 'preview-status published' : 'preview-status draft';
  }
  
  function showFormError(message) {
    let errorElement = form.querySelector('.form-error');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      form.insertBefore(errorElement, form.querySelector('.form-actions'));
    }
    
    errorElement.textContent = message;
    
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  function setupSSE() {
    console.log('Setting up SSE connection on create page...');
    
    const eventSource = new EventSource('/courses/events', { withCredentials: true });
    
    eventSource.addEventListener('open', () => {
      console.log('SSE connection established on create page');
    });
    
    eventSource.addEventListener('course-update', (event) => {
      try {
        console.log('SSE course-update event received on create page:', event.data);
      } catch (error) {
        console.error('Error parsing SSE event data:', error);
      }
    });
    
    eventSource.addEventListener('error', (error) => {
      console.error('SSE connection error on create page:', error);
      eventSource.close();
    });
    
    window.addEventListener('beforeunload', () => {
      eventSource.close();
    });
  }
  
  updatePreview();
});
