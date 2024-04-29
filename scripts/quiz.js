export class Quiz {
    constructor() {
        this.quizDiv = document.getElementById("quiz");
        this.flashcardsDiv = document.getElementById("flashcards");
        this.score = 0;
        this.incorrectWords = []; 
        this.answeredQuestions = 0;

        // create exit button
        this.exitButton = document.createElement("button");
        this.exitButton.className = "quiz-button";
        this.exitButton.textContent = "Exit Quiz";
        this.exitButton.style.display = "none"; // hide the exit quiz button at the start
        this.exitButton.addEventListener("click", (e) => {
            this.exitQuiz();
        });
        this.quizDiv.appendChild(this.exitButton);

        // create questions container
        this.questionsContainer = document.createElement("div");
        this.questionsContainer.className = "questions-container";
        this.quizDiv.appendChild(this.questionsContainer);

        document.querySelector(".quiz-button").addEventListener("click", () => {
            this.startQuiz();
        });
    }

    startQuiz() {
        // hide the flashcards
        document.getElementById("flashcards").style.display = "none";

        // show the quiz
        // this.quizDiv.style.display = "block";
        
        // show the exit quiz button
        this.exitButton.style.display = "block";

        this.questionsContainer.remove();
        
        // create questions container
        this.questionsContainer = document.createElement("div");
        this.questionsContainer.className = "questions-container";
        this.quizDiv.appendChild(this.questionsContainer);

        chrome.storage.sync.get(null, words => {
            this.generateQuestions(words);
        });
    }

    exitQuiz() {
        // set score to 0 and reset incorrect words
        this.score = 0;
        this.incorrectWords = [];

        // hide the quiz
        // this.quizDiv.style.display = "none";
        this.exitButton.style.display = "none";

        this.questionsContainer.remove();

        // show the flashcards
        document.getElementById("flashcards").style.display = "block";
    }

    generateQuestions(words) {
        let currIndex = 1;
        for (let word in words) {
            this.createQuestion(word, words, currIndex);
            currIndex++;
        }
    }

    createQuestion(word, words, currIndex) {
        let correctWord = word;
        let def = words[word].definitions[words[word].defaultDefIndex];

        // create the div for the question
        let questionDiv = document.createElement("div");
        questionDiv.className = "question";

        // create the p element for the definition
        let definitionP = document.createElement("p");
        definitionP.textContent = `${currIndex}.  ${def}`;
        questionDiv.appendChild(definitionP);

        let answeredQuestions = 0;

        // get 3 other words as wrong choices
        let choices = [correctWord];
        fetch("https://random-word-api.herokuapp.com/word?number=3")
        .then(response => response.json())
        .then(threeWords => {
            for (let w of threeWords) {
                choices.push(w);
            }
            // randomize the choices
            choices = this.fisherYatesShuffle(choices);

            // create buttons for the answer choices
            for (let j = 0; j < choices.length; j++) {
                let choiceButton = document.createElement("button");
                choiceButton.textContent = choices[j];
                choiceButton.addEventListener("click", () => {
                    // check if the selected choice is correct
                    if (choices[j] === correctWord) {
                        this.score++;
                        alert("correct");
                    }
                    else {
                        alert("incorrect");
                        this.incorrectWords.push(correctWord);
                    }
                    // remove the current question
                    this.questionsContainer.removeChild(questionDiv);
                    this.answeredQuestions++;

                    if (this.answeredQuestions === Object.keys(words).length) {
                        this.showResults();
                    }
                });
                questionDiv.appendChild(choiceButton);
            }
        });

        // add the question to the quiz
        this.questionsContainer.appendChild(questionDiv);
    }

    showResults() {
        // create results div
        let resultsDiv = document.createElement("div");
        resultsDiv.className = "results";

        let scoreP = document.createElement("p");
        scoreP.textContent = `Score: ${this.score}`;
        resultsDiv.appendChild(scoreP);

        let incorrectWordsP = document.createElement("p");
        incorrectWordsP.textContent = `Incorrect Words: ${this.incorrectWords.join(", ")}`;
        resultsDiv.appendChild(incorrectWordsP);

        this.questionsContainer.appendChild(resultsDiv);
    }

    fisherYatesShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}