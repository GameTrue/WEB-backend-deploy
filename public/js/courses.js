document.addEventListener('DOMContentLoaded', function () {
	const panelBtnAdmin = document.getElementById('panel-btn-admin');
	const filterAdminPanel = document.getElementById('filter-admin-panel');
	const coursesGrid = document.getElementById('courses-grid');
	const addCourseForm = document.getElementById('add-course-form');
	const submitBtnAdmin = document.getElementById('submit-btn-admin');
	const filterCourseForm = document.getElementById('filter-course-form');
	const filterBtn = document.getElementById('filter-btn');
	const editBtnAdmin = document.getElementById('edit-btn-admin');
	let inputActive = 0;
	const template = document.getElementById('course-template');

	const preloader = document.getElementById('preloader');
	const userInfo = document.getElementById('user-info');
	const errorMessage = document.getElementById('error-message');


	
	
	// Загружаем курсы из localStorage при загрузке страницы
	defaultCourses()

	// Обработчик нажатия на кнопку "Добавить курс"
	submitBtnAdmin.addEventListener('click', function () {
		const courses = JSON.parse(localStorage.getItem('courses')) || [];

		const courseId = courses[courses.length-1]['id'] + 1;
		const courseName = addCourseForm['course-name'].value.trim();
		const courseAuthor = addCourseForm['course-author'].value.trim();
		const courseCategory = addCourseForm['course-category'].value.trim();
		const courseLevel = addCourseForm['course-level'].value;

		if (!courseName || !courseAuthor || !courseCategory || !courseLevel) {
			alert('Пожалуйста, заполните все поля');
			return;
		}
		
		const newCourse = { id: courseId, name: courseName, author: courseAuthor, category: courseCategory, level: courseLevel };
  
		// Добавляем курс на страницу
		addCourseToPage(newCourse);

		// Сохраняем курс в localStorage
		saveCourseToStorage(newCourse);

		// Очищаем форму после добавления курса
		addCourseForm.reset();
	});

	// Обработчик нажатия на кнопку "Админ панель"
	panelBtnAdmin.addEventListener('click', function () {
		panelBtnAdmin.style.display = 'none';
		filterAdminPanel.style.display = 'flex';
		editBtnAdmin.style.display = 'inline-block';
	});

	// Обработчик нажатия на кнопку "Админ панель"
	filterBtn.addEventListener('click', function () {
		coursesGrid.innerHTML = "";
		const courseLevel = filterCourseForm['level'].value;
		const courseCategory = filterCourseForm['category'].value;
		loadCoursesFromStorage({level: courseLevel, category: courseCategory});
	});

	
	// Функция для обновления полей редактирования
	function updateCourseField(courses, inputs, field) {
		inputs.forEach((element) => {
			const elementVal = element.value;
			const elementId = parseInt(element.id.match(/\d+$/)[0], 10);
			courses[elementId - 1][field] = elementVal;
			element.style.pointerEvents = 'none';
		});
	}

	// Функция для редактирования курсов
	editBtnAdmin.addEventListener('click', function () {
		const inputs = document.getElementsByName("course-card-name");
		const inputAuthors = document.getElementsByName("course-card-author");

		if (inputActive == 0) {
			inputs.forEach(el => (el.style.pointerEvents = 'auto'));
			inputAuthors.forEach(el => (el.style.pointerEvents = 'auto'));
	
			editBtnAdmin.textContent = "Сохранить";
		} else {
			const courses = JSON.parse(localStorage.getItem('courses')) || [];

			updateCourseField(courses, inputs, 'name');
			updateCourseField(courses, inputAuthors, 'author');

			localStorage.setItem('courses', JSON.stringify(courses));
			editBtnAdmin.textContent = 'Редактировать';
		}
		inputActive = 1 - inputActive;
	});

	// Функция для создания элемента с атрибутами
	function createElement(tag, attributes = {}, classes = [], textContent = '') {
		const element = document.createElement(tag);
		Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
		if (classes.length) element.classList.add(...classes);
		if (textContent) element.textContent = textContent;
		return element;
	}

	// Функция для добавления курса на страницу
	function addCourseToPage(course) {
		const clone = template.content.cloneNode(true); 
	  
		const courseCard = clone.querySelector('.course-card');
		courseCard.classList.add(course.level);
	  
		const courseNameInput = clone.querySelector('[name="course-card-name"]');
		courseNameInput.value = course.name;
		courseNameInput.id = `input-courses-${course.id}`;
	  
		const courseAuthorInput = clone.querySelector('[name="course-card-author"]');
		courseAuthorInput.value = course.author;
		courseAuthorInput.id = `input-courses-author-${course.id}`;
	  
		// Добавляем заполненный элемент в контейнер
		coursesGrid.appendChild(clone);
	}
	  

	// Функция для сохранения курса в localStorage
	function saveCourseToStorage(course) {
		let courses = JSON.parse(localStorage.getItem('courses')) || [];
		courses.push(course);
		localStorage.setItem('courses', JSON.stringify(courses));
	}

	// Функция для загрузки курсов из localStorage
	function loadCoursesFromStorage(filters={level: "all", category: "all"}) {
		const courses = JSON.parse(localStorage.getItem('courses')) || [];

		courses
			.filter(course => 
				(filters.level === 'all' || course.level === filters.level) &&
				(filters.category === 'all' || course.category === filters.category)
			)
			.forEach(course => addCourseToPage(course));
	}

	function defaultCourses() {
		const courses = JSON.parse(localStorage.getItem('courses')) || [];
		preloader.style.display = 'block'; // Показываем preloader
		
		fetch('https://jsonplaceholder.typicode.com/users') // Получаем данные пользователя с ID 1
			.then(response => {
				if (!response.ok) {
					throw new Error('Ошибка сети');
				}
				return response.json(); // Парсим ответ как JSON
			})
			.then(data => {
				if (courses.length == 0) {
					// Загружаем пользователя при загрузке страницы
					const template = [{ id: 1, name: "Course 1", level: "beginner", author: data[0].name, category: "programming" }, 
						{ id: 2, name: "Course 2", level: "intermediate", author: data[1].name, category: "programming" }, 
						{ id: 3, name: "Course 3", level: "advanced", author: data[2].name, category: "design" }, 
						{ id: 4, name: "Course 4", level: "advanced", author: data[3].name, category: "programming" }, 
						{ id: 5, name: "Course 5", level: "intermediate", author: data[4].name, category: "marketing" }, 
						{ id: 6, name: "Course 6", level: "beginner", author: data[5].name, category: "marketing" }, 
						{ id: 7, name: "Course 7", level: "beginner", author: data[6].name, category: "marketing" }, 
						{ id: 8, name: "Course 8", level: "intermediate", author: data[7].name, category: "design" }
					];
					template.forEach(course => {
						courses.push(course);
					})
					localStorage.setItem('courses', JSON.stringify(courses));
				}

				preloader.style.display = 'none'; // Скрываем preloader
				coursesGrid.style.display = 'grid';
				loadCoursesFromStorage();
				loadComments();
			})
			.catch(error => {
				preloader.textContent = '⚠ Что-то пошло не так: ' + error.message;
				preloader.style.color = 'red';
				errorMessage.textContent = '⚠ Что-то пошло не так: ' + error.message; // Обрабатываем ошибку
			});
	}

	
	// Функция для загрузки данных о пользователе
	function loadUser() {
		
	}

	function loadComments() {
		//preloader.style.display = 'block';
		const randomFilter = Math.random() > 0.5 ? '?id_gte=100' : '?id_lte=200';
	
		fetch(`https://jsonplaceholder.typicode.com/comments${randomFilter}`)
			.then(response => response.json())
			.then(data => {
				//preloader.style.display = 'none';
				console.log('Комментарии:', data);
				// Логика для отображения комментариев
			})
			.catch(error => {
				//preloader.style.display = 'none';
				errorMessage.textContent = '⚠ Что-то пошло не так: ' + error.message;
			});
	}
	
});