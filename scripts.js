// --- Progress Persistence ---


// TODO issue loading
// save progress to localstorage 
class Progress {
    constructor(currentIndex) {
        this.currentIndex = currentIndex;
        this.currentUrl;
    }

    get(){
        return this.currentIndex;
    }

    set(currentIndex){
        this.currentIndex = currentIndex;
        this.save();
    }

    setUrl(url){
        this.currentUrl = url;
    }

    inc(){
        this.set(this.currentIndex + 1);
    }

    reset() {
        this.set(0);
    }

    // saving and loading from localstorage
    save(){
        this.saveFor(this.currentUrl);
    }

    saveFor(url) {
        localStorage.setItem('question_progress_' + url, this.currentIndex);
    }

    load() {
        this.loadFor(this.currentUrl);
    }

    loadFor(url) {
        const savedProgress = localStorage.getItem('question_progress_' + url);
        this.set(parseInt(savedProgress, 10) || 0);
    }

    isInBounds(length) {
        return this.currentIndex >= 0 && this.currentIndex < length;
    }
}


class URLManager {
    constructor() {
        this.recentUrls = [];
        this.currentUrl;
        this.selectElement;
    }

    addSelectElement(selectElement) {
        this.selectElement = selectElement;
    }

    // --- Recent URLs management ---
    addToRecent(url) {
        if (!this.recentUrls.includes(url)) {
            this.recentUrls.push(url);
            this.saveToRecent();
        }
        this.addRecentURLsToSelect();
    }

    saveToRecent() {
        localStorage.setItem('recent_urls', JSON.stringify(this.recentUrls));
    }

    loadRecent() {
        const urls = localStorage.getItem('recent_urls');
        if (urls)
            {
            this.recentUrls = JSON.parse(urls);
        }
    }

    addRecentURLsToSelect(selectElement = this.selectElement) {
        if (!selectElement) return;
        selectElement.innerHTML = "";
        this.recentUrls.forEach(url => {
            const option = document.createElement('option');
            option.value = url;
            option.textContent = this.urlToName(url);
            selectElement.appendChild(option);
        });
    }

    urlToName(url){
        return url.split('/').pop();
    }   

    // --- Current URL management ---
    setCurrent(url) {
        this.currentUrl = url;
        this.addToRecent(url);
        this.saveCurrentUrl();
    }

    getCurrent() {
        return this.currentUrl;
    }
    
    saveCurrentUrl() {
        localStorage.setItem('current_url', this.currentUrl);
    }

    loadCurrentUrl() {
        const url = localStorage.getItem('current_url');
        if (url) {
            this.currentUrl = url;
        } 
    }
}


var questions = {}

var urlManager = new URLManager();

var question_progress = new Progress(0);

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
    urlManager.addSelectElement(select);
    urlManager.loadRecent();
    urlManager.loadCurrentUrl();
    if (urlManager.getCurrent()) {
        urlInput.value = urlManager.getCurrent();
    } else {
        urlManager.setCurrent(urlInput.value);
    }

    urlManager.addRecentURLsToSelect(select);

    // load questions from url
    loadFrom(urlManager.getCurrent());

    // -- event listeners ---
    resetBtn.addEventListener('click', (e) => {
        // Clear and focus the input if present
        if (window.App && window.App.userInput) {
            window.App.userInput.value = '';
            window.App.userInput.focus();
        }

        question_progress.reset();
        displayQuestion();
    });

    confirmUrlBtn.addEventListener('click', (e) => {
        loadFrom(urlInput.value);
    });
    
    // Populate the select with recent URLs
    select.addEventListener('change', (e) => {
        const selectedUrl = e.target.value;
        urlInput.value = selectedUrl;
    });

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

            question_progress.setUrl(url);
            question_progress.loadFor(url);
            // reset progress if question Progress is out of bounds 
            if (!question_progress.isInBounds(questions.order.length)) {
                question_progress.reset();
                console.warn("Question progress was out of bounds, resetting to 0.");
            }
            
            displayQuestion(force=true);
            // successfully loaded, so add to recent urls
            urlManager.setCurrent(url);
        }
        return result.success;
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

