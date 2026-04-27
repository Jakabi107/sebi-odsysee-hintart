var questions = {}

var questions_url = ""
var recent_questions_urls = []

var question_progress = Progress(0);

var userInput;
var urlInput;
var resetBtn;
var confirmUrlBtn;
var select;

// Basic JS initializer for the app container
document.addEventListener('DOMContentLoaded', () => {

    // -- wiring up DOM elements ---
    userInput = document.getElementById('user-input');
    urlInput = document.getElementById('user-input-2');
    resetBtn = document.getElementById('reset-btn');
    confirmUrlBtn = document.getElementById('confirm-url');
    select = document.getElementById('header-select');

    // -- Load recent URLs and set the input value if possible --
    var loadedUrl = loadLastURL();

    if (loadedUrl) {
        urlInput.value = loadedUrl;
        questions_url = loadedUrl;
    }
    else questions_url =  urlInput.value
    
    // recent urls system
    recent_questions_urls = loadURLs();
    addRecentURLsToSelect();

    // load questions from url
    loadFrom(questions_url);

    // -- event listeners ---
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            // add event 
            
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
            loadFrom(questions_url).then(success => {
                // if unseccessful, revert url and alert user
                if(!success)questions_url = oldUrl;
            });
        });
    }

    if (select) {
        // Populate the select with recent URLs
        select.addEventListener('change', (e) => {
            const selectedUrl = e.target.value;
            urlInput.value = selectedUrl;
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
});

// --- Questions from resource --- 

// fetch questions and manage initiation
async function loadFrom(url){

    return await fetchQuestionsFrom(url).then(result => {
        if(result.success){

            questions = result.questions;

            Progress.loadFor(url);
            // reset progress if question Progress is out of bounds 
            if (!question_progress.isInBounds(questions.order.length)) {
                Progress.reset();
                console.warn("Question progress was out of bounds, resetting to 0.");
            }
            
            displayQuestion(force=true);

            // successfully loaded, so add to recent urls
            addCurrentURLToRecent();
            saveLastURL();
        }
        return success;
    });
}


class FetchingResult {
    constructor(success, questions = null) {
        this.success = success;
        this.questions = questions;
    }
}


async function fetchQuestionsFrom(url){

    return await fetch(url)
        .then(response => response.json())
        .then(data => {
            return new FetchingResult(true, data);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Fehler beim Laden der Fragen. Bitte überprüfe die URL und versuche es erneut. Details in der Konsole.');
            return new FetchingResult(false);
        });

}

// --- Question loading from local ---
function getCurrentQuestion(){
    // manage out of bounds
    if (!question_progress.isInBounds(questions.order.length)) {
        return null;
    }

    const currentQuestionKey = questions.order[question_progress.get()];
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
    questionTitle.textContent = question.title || "No Title";

    const questionText = document.getElementById('question-text');
    questionText.textContent = question.text || "No Text";
    
    const questionImage = document.getElementById('question-image');
    if (question.imageExternal) {
        questionImage.src = question.image;
    } else {
        questionImage.src = "images/" + question.image;
    }
}

// --- Input Validation ---
function checkAnswer(userAnswer){
    const question = getCurrentQuestion();
    if(!question) return false;

    return userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
}


function goToNextQuestion(){
    if (question_progress.get() >= questions.order.length - 1) {
        onWinning()
        return;
    }
    question_progress.inc();
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
// --- Saving --- 

// --- Progress Persistence ---
// save progress to localstorage 

class Progress {
    constructor(currentIndex) {
        this.currentIndex = currentIndex;
    }

    get(){
        return this.currentIndex;
    }

    set(currentIndex){
        this.currentIndex = currentIndex;
        this.save();
    }

    inc(){
        this.set(this.currentIndex + 1);
    }

    saveFor(url) {
        localStorage.setItem('question_progress_' + url, this.currentIndex);
    }

    loadFor(url) {
        const savedProgress = localStorage.getItem('question_progress_' + url);
        this.set(parseInt(savedProgress, 10) || 0);
    }

    reset() {
        this.set(0);
    }

    isInBounds(length) {
        return this.currentIndex >= 0 && this.currentIndex < length;
    }
}


function addCurrentURLToRecent(){
    if (!recent_questions_urls.includes(questions_url)) {
        recent_questions_urls.push(questions_url);
        saveURLs();
    }
}


function saveURLs(){
    localStorage.setItem('questions_url', JSON.stringify(recent_questions_urls));
    addRecentURLsToSelect();
}


function loadURLs(){
    localStorage.getItem('questions_url');
    var urls = localStorage.getItem('questions_url');
    if (urls) {
        urls = JSON.parse(urls);
    }
    return urls;
}


function urlToName(url){
    return url.split('/').pop();
}


function addRecentURLsToSelect(){
    select.innerHTML = ""

    recent_questions_urls.forEach(url => {
        const option = document.createElement('option');
        option.value = url;
        option.textContent = urlToName(url);
        select.appendChild(option);
    });
}


function saveLastURL(){
    localStorage.setItem('last_questions_url', questions_url);
}


function loadLastURL(){
    const lastUrl = localStorage.getItem('last_questions_url');
    return lastUrl;
}