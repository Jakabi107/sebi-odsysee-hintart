var questions = {}

var questions_url = "https://raw.githubusercontent.com/Jakabi107/sebi-odsysee-hintart/outsource-questions/questions/sebiGeburtstag.json"

var question_progress = 0;

var userInput;

// Basic JS initializer for the app container
document.addEventListener('DOMContentLoaded', () => {

    // Wire up the text input
    userInput = document.getElementById('user-input');

    // Wire up reset button if present
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            console.log('reset-btn: clicked');
            // Clear and focus the input if present
            if (window.App && window.App.userInput) {
                window.App.userInput.value = '';
                window.App.userInput.focus();
            }
            resetProgress();
        });
    }

    // Handle Enter key presses: log and emit a custom event on the app root
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
        // Prevent any default behavior (no form present, but safe)
        e.preventDefault();
        const value = e.target.value;
        
        onUserInputEnter(value);
        }
    });

    fetchQuestions()
        .then(
        () => {       
            loadProgress(); 
            displayQuestion()}
    )
});


async function fetchQuestions(){
    await fetch(questions_url)
        .then(response => response.json())
        .then(data => {
            questions = data;
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Fehler beim Laden der Fragen. Bitte versuche es später erneut.');
        });
}


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
        alert('Gewonnen - Alles gute zum geburtstag!');
        return;
    }
    question_progress++;
    saveProgress();
    displayQuestion();
}


function onUserInputEnter(value){
    if (checkAnswer(value)) {
        userInput.value = '';
        goToNextQuestion();
    }
    else {
        alert('Falsche Antwort!heheha');
    }
}


// --- Progress Persistence ---
function saveProgress(){
    localStorage.setItem('question_progress', question_progress);
}

function loadProgress(){
    const savedProgress = localStorage.getItem('question_progress');
    if(savedProgress !== null){
        question_progress = parseInt(savedProgress, 10);
    }
}

function resetProgress(){
    question_progress = 0;
    saveProgress();
    displayQuestion();
}
