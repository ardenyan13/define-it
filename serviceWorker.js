import API_KEY from "./config.js";

// create the context menu item for adding to word to flashcards
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'add-to-flashcards',
        title: 'Add %s to flashcards',
        contexts: ['selection']
    });
});

// create listener for clicks on the "Add to flashcards" context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // check if "Add to flashcards" context menu item was clicked
    if (info.menuItemId === "add-to-flashcards") {
        let word = info.selectionText;

        // check if the word is 1 word
        if (word.split(" ").length > 1) {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "/assets/images/icon.png",
                title: `Error adding "${word}" to flashcards`,
                message: "Only 1 word can be added to the flashcards at a time"
            });
            return;
        }

        // convert the word to lowercase and remove leading/trailing whitespace
        word = word.toLowerCase().trim();

        // get the words from the chrome storage for validation
        chrome.storage.sync.get(word, words => {
            // check if the word already exists
            if (words.hasOwnProperty(word)) {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "/assets/images/icon.png",
                    title: `Error adding "${word}" to flashcards`,
                    message: `The word "${word}" is already a flashcard`
                });
            }
            else {
                // get the definition from the Merriam Webster API
                fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`)
                .then(response => response.json())
                .then(data => {
                    // check if word has a definition
                    if (data[0] && data[0].shortdef) {
                        // create an array of the short definition for each definition of the word
                        let definitions = data.map(def => def.shortdef[0]);

                        // create a word object with definitions, starred, and current definition index properites
                        let wordObj = {
                            definitions: definitions,
                            starred: false,
                            defaultDefIndex: 0
                        };

                        // save the word object to the chrome storage
                        chrome.storage.sync.set({[word]: wordObj});
                    }
                    // word has no definition
                    else {
                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "/assets/images/icon.png",
                            title: `Error adding "${word}" to flashcards`,
                            message: `The word "${word}" does not exist`
                        });
                    }
                })
                .catch();
            }
        });
    }
});