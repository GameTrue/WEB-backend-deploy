(function() {
	window.addEventListener('load', function() {
        function loadFragment(fragmentId, url) {
            return new Promise((resolve, reject) => {
                fetch(url)
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById(fragmentId).innerHTML = data;
                        resolve(); 
                    })
                    .catch(error => {
                        console.error('Ошибка загрузки фрагмента:', error);
                        reject(error); 
                    });
            });
        }

        Promise.all([
            loadFragment('header-placeholder', 'header.html').then(setActiveLink),
            loadFragment('footer-placeholder', 'footer.html') 
        ]).then(() => {
            loadMap(); 
        }).catch(error => {
            console.error('Ошибка загрузки одного из фрагментов:', error);
        });


		function setActiveLink() {
			const currentPath = window.location.pathname;
			const menuItems = document.querySelectorAll('nav li');

			menuItems.forEach(link => {
				const linkPath = new URL(link.querySelector('a').href).pathname; 

				console.log(linkPath, currentPath);
				if (linkPath === currentPath) {
					link.classList.add('active-link');
				} else {
					link.classList.remove('active-link'); 
				}
			});
		}

		function loadingTime() {
			const timing = performance.timing;



			const pageLoadTime = timing.domComplete - timing.navigationStart - 15; // Время полной загрузки страницы
			const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart - 15; // Время до DOMContentLoaded
			const responseTime = timing.responseEnd - timing.requestStart; // Время отклика сервера
			const connectTime = timing.connectEnd - timing.connectStart; // Время установки соединения
			const dnsTime = timing.domainLookupEnd - timing.domainLookupStart; // Время разрешения DNS

			const stats = `
				<p>Полное время загрузки страницы: <strong>${pageLoadTime} мс</strong></p>
				<p>Время события DOMContentLoaded: <strong>${domContentLoadedTime} мс</strong></p>`

			const performanceDiv = document.getElementById('performance-info');
			performanceDiv.innerHTML += stats;
		}

		function loadMap() {
			loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU')
				.then(() => ymaps.ready(initMap))
				.catch(error => console.error('Ошибка загрузки Yandex Maps API:', error));
		}
		
		function loadScript(url) {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = url;
				script.async = true;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error('Не удалось загрузить скрипт: ' + url));
				document.head.appendChild(script);
			});
		}

		function initMap() {
			var myMap = new ymaps.Map("map", {
				center: [51.533, 46.034],
				zoom: 15,
				theme: "islands#dark", 
				controls: ['zoomControl']
			});
			var myPlacemark = new ymaps.Placemark([51.533, 46.034], {
				hintContent: 'Наша компания',
				balloonContent: 'г.Саратов, ул. Колотушкина, д.7'
			});
			myMap.geoObjects.add(myPlacemark);
		}
	});
})();