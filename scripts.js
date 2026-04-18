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


    // Handle Enter key presses: log and emit a custom event on the app root
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // Prevent any default behavior (no form present, but safe)
        e.preventDefault();
        const value = e.target.value;
        console.log('user-input: Enter pressed ->', value);
        // Emit a custom event with the input value so other modules can listen
        const enterEvent = new CustomEvent('userInputEnter', { detail: value });
        if (window.App && window.App.root) {
          window.App.root.dispatchEvent(enterEvent);
        }
      }
    });
  }

  // Placeholder: you can initialize other UI components here
});



