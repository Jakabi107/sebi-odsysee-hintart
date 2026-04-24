var questions = {}

var questions_url = ""

var question_progress = 0;

var userInput;
var urlInput;

// Basic JS initializer for the app container
document.addEventListener('DOMContentLoaded', () => {

    // Wire up the text input
    userInput = document.getElementById('user-input');
    // Secondary input (URL) if present
    urlInput = document.getElementById('user-input-2');

    // Wire up reset button if present
    const resetBtn = document.getElementById('reset-btn');

    const confirmUrlBtn = document.getElementById('confirm-url');

    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            // Clear and focus the input if present
            if (window.App && window.App.userInput) {
                window.App.userInput.value = '';
                window.App.userInput.focus();
            }
            resetProgress();
        });
    }

    if (confirmUrlBtn) {
        confirmUrlBtn.addEventListener('click', (e) => {
            var oldUrl = questions_url;
            questions_url = urlInput.value;
            load().then(success => {
                if(!success){
                    questions_url = oldUrl;
                }
            });
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

    questions_url = urlInput.value;
    load();
});

// --- Questions from resource --- 

// fetch questions and manage initiation
async function load(){

    return await fetchQuestions().then(success => {
        if(success){
            loadProgress();

            // reset progress if question Progress is out of bounds 
            if (question_progress >= questions.order.length || question_progress < 0) {
                question_progress = 0;
                saveProgress();
                console.warn("Question progress was out of bounds, resetting to 0.");
            }
            
            displayQuestion(force=true);
        }
        return success;
    });
}


async function fetchQuestions(){

    return await fetch(questions_url)
        .then(response => response.json())
        .then(data => {
            questions = data;
            return true;
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Fehler beim Laden der Fragen. Bitte überprüfe die URL und versuche es erneut. Details in der Konsole.');
            return false;
        });

}

// --- Question loading from local ---
function getCurrentQuestion(){
    // manage out of bounds
    if (question_progress >= questions.order.length || question_progress < 0) {
        return null;
    }
    const currentQuestionKey = questions.order[question_progress];
    return questions[currentQuestionKey];
}

function displayQuestion(force=false){
    var question = getCurrentQuestion();
    if(!question) {
        if (!force) return;
        question = {
            title: "Error",
            text: "Es konnten keine Fragen geladen werden. Die gegebene Fragen Datei scheint Probleme zu haben. Probiere Reset zu drücken und überprüfe das File. ",
            image: ""
        }
    }
    
    const questionTitle = document.getElementById('question-title');
    questionTitle.textContent = question.title;

    const questionText = document.getElementById('question-text');
    questionText.textContent = question.text;

    const questionImage = document.getElementById('question-image');
    questionImage.src = "images/" + question.image;
}

// --- Input Validation ---
function checkAnswer(userAnswer){
    const question = getCurrentQuestion();
    if(!question) return false;

    return userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
}


function goToNextQuestion(){
    if (question_progress >= questions.order.length - 1) {
        onWinning()
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


function onWinning(){
    alert("Gewonnen!")
}

// --- Progress Persistence ---
// save progress to localstorage 
function saveProgress(){
    localStorage.setItem('question_progress_' + questions_url, question_progress);
}

// load progress from local storage
function loadProgress(){
    // name with url
    const savedProgress = localStorage.getItem('question_progress_' + questions_url);
    if(savedProgress !== null){
        question_progress = parseInt(savedProgress, 10);
    } else {
        question_progress = 0;
    }
}

function resetProgress(){
    question_progress = 0;
    saveProgress();
    displayQuestion();
}

