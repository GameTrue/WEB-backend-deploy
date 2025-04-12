document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;
  const menuItems = document.querySelectorAll('#menu li');

  menuItems.forEach(item => {
    const link = item.querySelector('a');
    const linkPath = link.getAttribute('href');

    if (linkPath === currentPath || 
        (linkPath === '/' && currentPath === '') || 
        (currentPath !== '/' && linkPath !== '/' && currentPath.startsWith(linkPath))) {
      item.classList.add('active-link');
    } else {
      item.classList.remove('active-link');
    }
  });
});
