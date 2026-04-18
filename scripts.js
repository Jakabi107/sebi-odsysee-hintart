// Basic JS initializer for the app container
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  console.log('App container initialized:', app);

  // Expose for quick debugging in the browser console
  window.App = window.App || {};
  window.App.root = app;

  // Placeholder: you can initialize UI components here
});
