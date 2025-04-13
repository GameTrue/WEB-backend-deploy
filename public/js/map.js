document.addEventListener('DOMContentLoaded', function() {
  const mapElement = document.getElementById('map');
  
  if (!mapElement) return;
  
  // Функция для загрузки скрипта Яндекс Карт
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
  
  // Функция инициализации карты
  function initMap() {
    var myMap = new ymaps.Map("map", {
      center: [51.533, 46.034],
      zoom: 15,
      controls: ['zoomControl']
    });
    var myPlacemark = new ymaps.Placemark([51.533, 46.034], {
      hintContent: 'Наша компания',
      balloonContent: 'г.Саратов, ул. Колотушкина, д.7'
    });
    myMap.geoObjects.add(myPlacemark);
  }
  
  // Загружаем и инициализируем Яндекс Карты
  loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU')
    .then(() => ymaps.ready(initMap))
    .catch(error => console.error('Ошибка загрузки Yandex Maps API:', error));
});
