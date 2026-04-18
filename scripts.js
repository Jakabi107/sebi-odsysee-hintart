const questions = {
    "order":["puzzle", "bilderraten","pole", "music", "kaperung"],

    "pole": {
        "title": "Speedrunknowledge",
        "text": "Wie geißt der Mond den Mann nach der Kaperung folgenden Objektes als nächstes erhält?",
        "image": "pole.png",
        "answer": "Bankfreundschaft"
    },

    "music": {
        "title": "Jump up in your Bed!",
        "text": "Wo hört man eine man eine \"Spielbox\" Version von Jump up Superstar?",
        "image": "music.png",
        "answer": "Globus"
    },

    "bilderraten": {
        "title": "Bilderraten",
        "text": "Im Küstenland - gehe zur Subarea welche folgender Tipp daarstellt. Das Lösungswort ist dort zu Haufen vorhanden. Es beginnt mit N.",
        "image": "rocket.png",
        "answer": "Nebel"
    },

    "kaperung":{
        "title": "Beste Kaperung",
        "text": "Nenne die Nummer der objektiv besten Kapernung im Spiel",
        "answer": "52",
        "image": "dino.png",
    },

    "puzzle":{
        "title": "Puzzle",
        "text": "2. Buchstabe des Mondes;). https://puzzel.org/en/jigsaw/play?p=-OqWO0eUc5ztu_yoMBBn",
        "answer": "darf",
        "image": "puzzle.png"
    }
}

var question_progress = 0;


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
        
        onUserInputEnter(value);
      }
    });
  }

  displayQuestion();
});


function getCurrentQuestion(){
  const currentQuestionKey = questions.order[question_progress];
  return questions[currentQuestionKey];
}


function displayQuestion(){
    const question = getCurrentQuestion();
    if(!question) return;

    const questionTitle = document.getElementById('question-title');
    questionTitle.textContent = question.title;

    const questionText = document.getElementById('question-text');
    questionText.textContent = question.text;

    const questionImage = document.getElementById('question-image');
    questionImage.src = "images/" + question.image;
}


function checkAnswer(userAnswer){
    const question = getCurrentQuestion();
    if(!question) return false;

    return userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
}


function goToNextQuestion(){
    if (question_progress >= questions.order.length - 1) {
        alert('Congratulations! You have completed all the questions!');
        return;
    }
    question_progress++;
    displayQuestion();
}


function onUserInputEnter(userInput){
    if (checkAnswer(userInput)) {
        goToNextQuestion();
    }
    else {
        alert('Incorrect answer, please try again!');
    }
}