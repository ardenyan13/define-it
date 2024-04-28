export class Flashcards {
    constructor() {
        this.flashcardsDiv = document.getElementById("flashcards");
    }

    getFlashcards() {
        chrome.storage.sync.get(null, words => {
            for (let w in words) {
                this.createFlashcard(w, words[w]);
            }
        });
    }

    createFlashcard(word, wordData) {
        let flashcard = document.createElement("div");
        flashcard.className = "flashcard";

        let cardContent = document.createElement("div");
        cardContent.className = "card-content";

        cardContent.appendChild(this.createFront(word, wordData));
        cardContent.appendChild(this.createBack(word, wordData));

        flashcard.appendChild(cardContent);

        flashcard.addEventListener("click", () => {
            // check if the user is selecting text
            if (window.getSelection().toString() === "") {
                flashcard.classList.toggle("flip");
            }
        });

        let del = flashcard.querySelector(".delete");
        del.addEventListener("click", (e) => {
            e.stopPropagation();
            chrome.storage.sync.remove(word);
            this.flashcardsDiv.removeChild(flashcard)
        })

        this.flashcardsDiv.appendChild(flashcard);
    }

    createFront(word, wordData) {
        let front = document.createElement("div");
        front.className = "front";

        let wordFront = document.createElement("p");
        wordFront.textContent = word;

        let frontButtons = document.createElement("div");
        frontButtons.className = "front-buttons";

        let star = document.createElement("button");

        // give the star button the corresponding css class and text
        star.className = "star " + (wordData.starred ? "starred" : "unstarred");
        star.textContent = wordData.starred ? "★" : "☆";

        star.addEventListener("click", (e) => {
            e.stopPropagation();
            // change the star status
            wordData.starred = !wordData.starred;
            // update the star button css class and text
            if (wordData.starred) {
                star.className = "star starred";
                star.textContent = "★"
            }
            else {
                star.className = "star unstarred";
                star.textContent = "☆";
            }
            // save the updated word's star status to storage
            chrome.storage.sync.set({[word]: wordData});
        });

        let tts = document.createElement("button");
        tts.className = "tts";
        tts.textContent = "🔊";
        let utterance = new SpeechSynthesisUtterance(word);
        tts.addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            else {
                window.speechSynthesis.speak(utterance);
            }
        });

        let del = document.createElement("button");
        del.className = "delete";
        del.textContent = "🗑️";

        frontButtons.appendChild(star);
        frontButtons.appendChild(tts);
        frontButtons.appendChild(del);

        front.appendChild(wordFront);
        front.appendChild(frontButtons);

        return front;
    }

    createBack(word, wordData) {
        let back = document.createElement("div");
        back.className = "back";

        let currIndex = wordData.defaultDefIndex;

        let def = document.createElement("p");
        def.textContent = wordData.definitions[wordData.defaultDefIndex];

        let backButtons = document.createElement("div");
        backButtons.className = "back-buttons";

        let tts = document.createElement("button");
        tts.className = "tts";
        tts.textContent = "🔊";
        tts.addEventListener("click", (e) => {
            e.stopPropagation();
            // create a new SpeechSynthesisUtterance object with the current definition
            let utterance = new SpeechSynthesisUtterance(wordData.definitions[currIndex]);
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            else {
                window.speechSynthesis.speak(utterance);
            }
        });

        let del = document.createElement("button");
        del.className = "delete";
        del.textContent = "🗑️";

        if (wordData.definitions.length > 1) {
            let nextDef = document.createElement("button");
            nextDef.className = "nextDef";
            nextDef.textContent = "🡢";

            let prevDef = document.createElement("button");
            prevDef.className = "prevDef";
            prevDef.textContent = "🡠";

            let setDef = document.createElement("button");
            setDef.className = "setDef";
            setDef.textContent = "Set as definition";
            setDef.style.display = (currIndex !== wordData.defaultDefIndex) ? "inline-block" : "none";

            nextDef.addEventListener("click", (e) => {
                e.stopPropagation();
                // increment the current index
                currIndex = (currIndex + 1) % wordData.definitions.length;
                // change the definition to the current definition
                def.textContent = wordData.definitions[currIndex];
                // show or hide the set definition button
                setDef.style.display = (currIndex !== wordData.defaultDefIndex) ? "inline-block" : "none";
            });

            prevDef.addEventListener("click", (e) => {
                e.stopPropagation();
                // decrement the current index
                currIndex = (currIndex - 1 + wordData.definitions.length) % wordData.definitions.length;
                // change the definition to the current definition
                def.textContent = wordData.definitions[currIndex];
                // show or hide the set definition button
                setDef.style.display = (currIndex !== wordData.defaultDefIndex) ? "inline-block" : "none";
            });

            setDef.addEventListener("click", (e) => {
                e.stopPropagation();
                // set the current definition as the default definition
                wordData.defaultDefIndex = currIndex;
                // save the changes to storage
                chrome.storage.sync.set({[word]: wordData});
                setDef.style.display = "none";
            });

            backButtons.appendChild(setDef);
            backButtons.appendChild(prevDef);
            backButtons.appendChild(nextDef);
        }

        backButtons.appendChild(tts);
        backButtons.appendChild(del);

        back.appendChild(def);
        back.appendChild(backButtons);

        return back;
    }
}