document.addEventListener('click', function(event) {
    if (event.target.closest('#burger')) {
        const menu = document.getElementById('menu');
        menu.classList.toggle('active');
    }
});
