// Basic JS initializer for the app container
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  console.log('App container initialized:', app);

  // Expose for quick debugging in the browser console
  window.App = window.App || {};
  window.App.root = app;
  // Wire up the text input (if present)
  const userInput = document.getElementById('user-input');
  if(userInput){
    window.App.userInput = userInput;
    userInput.addEventListener('input', (e) => {
      console.log('user-input:', e.target.value);
    });
  }

  // Placeholder: you can initialize other UI components here
});
