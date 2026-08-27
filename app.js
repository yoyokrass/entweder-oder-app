const addThemeButton = document.getElementById("addThemeButton");
const folderInput = document.getElementById("folderInput");

const topbar = document.querySelector(".topbar");
const themeGrid = document.getElementById("themeGrid");

const gameScreen = document.getElementById("gameScreen");
const menuButton = document.getElementById("menuButton");

const topGameImage = document.getElementById("topGameImage");
const bottomGameImage = document.getElementById("bottomGameImage");

const topImageArea = document.querySelector(".top-image");
const bottomImageArea = document.querySelector(".bottom-image");


let themes = [];
let currentTheme = null;
let previousPair = [];
let roundChanging = false;


// ========================================
// DATENBANK
// ========================================

const databasePromise = openDatabase();


function openDatabase() {

    return new Promise(function (resolve, reject) {

        const request =
            indexedDB.open("EntwederOderDatabase", 1);


        request.onupgradeneeded = function (event) {

            const database =
                event.target.result;


            if (!database.objectStoreNames.contains("themes")) {

                database.createObjectStore(
                    "themes",
                    { keyPath: "name" }
                );

            }

        };


        request.onsuccess = function (event) {

            resolve(event.target.result);

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


// ========================================
// THEMA SPEICHERN
// ========================================

async function saveThemeToDatabase(themeData) {

    const database =
        await databasePromise;


    return new Promise(function (resolve, reject) {

        const transaction =
            database.transaction("themes", "readwrite");


        const store =
            transaction.objectStore("themes");


        const request =
            store.put(themeData);


        request.onsuccess = function () {

            resolve();

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


// ========================================
// THEMA LÖSCHEN
// ========================================

async function deleteThemeFromDatabase(themeName) {

    const database =
        await databasePromise;


    return new Promise(function (resolve, reject) {

        const transaction =
            database.transaction("themes", "readwrite");


        const store =
            transaction.objectStore("themes");


        const request =
            store.delete(themeName);


        request.onsuccess = function () {

            resolve();

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


// ========================================
// THEMEN LADEN
// ========================================

async function loadThemesFromDatabase() {

    const database =
        await databasePromise;


    return new Promise(function (resolve, reject) {

        const transaction =
            database.transaction("themes", "readonly");


        const store =
            transaction.objectStore("themes");


        const request =
            store.getAll();


        request.onsuccess = function () {

            resolve(request.result);

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


// ========================================
// GESPEICHERTE DATEN VORBEREITEN
// ========================================

function prepareThemeForUse(storedTheme) {

    return {

        name: storedTheme.name,

        cover:
            URL.createObjectURL(storedTheme.cover),

        images:
            storedTheme.images.map(function (imageBlob) {

                return URL.createObjectURL(imageBlob);

            })

    };

}


// ========================================
// THEMEN NEU LADEN
// ========================================

async function reloadThemes() {

    const storedThemes =
        await loadThemesFromDatabase();


    themes =
        storedThemes.map(function (storedTheme) {

            return prepareThemeForUse(storedTheme);

        });


    renderThemes();

}


// ========================================
// APP-START
// ========================================

async function loadSavedThemes() {

    try {

        await reloadThemes();

    }

    catch (error) {

        console.error(
            "Themen konnten nicht geladen werden:",
            error
        );

    }

}


// ========================================
// ORDNER AUSWÄHLEN
// ========================================

addThemeButton.addEventListener("click", function () {

    folderInput.click();

});


folderInput.addEventListener("change", async function () {

    const files =
        Array.from(folderInput.files);


    if (files.length === 0) {

        return;

    }


    const firstPath =
        files[0].webkitRelativePath;


    const themeName =
        firstPath.split("/")[0];


    const imageFiles =
        files.filter(function (file) {

            return file.type.startsWith("image/");

        });


    const coverFile =
        imageFiles.find(function (file) {

            const name =
                file.name.toLowerCase();


            return (
                name === "cover.jpg" ||
                name === "cover.jpeg" ||
                name === "cover.png" ||
                name === "cover.webp"
            );

        });


    const gameFiles =
        imageFiles.filter(function (file) {

            return file !== coverFile;

        });


    if (!coverFile) {

        alert(
            "Der Ordner braucht ein Titelbild namens cover.jpg, cover.jpeg, cover.png oder cover.webp."
        );

        folderInput.value = "";

        return;

    }


    if (gameFiles.length < 2) {

        alert(
            "Das Thema braucht mindestens zwei Spielbilder."
        );

        folderInput.value = "";

        return;

    }


    const storedTheme = {

        name: themeName,

        cover: coverFile,

        images: gameFiles

    };


    try {

        await saveThemeToDatabase(storedTheme);

        await reloadThemes();

    }

    catch (error) {

        console.error(
            "Thema konnte nicht gespeichert werden:",
            error
        );


        alert(
            "Das Thema konnte nicht gespeichert werden."
        );

    }


    folderInput.value = "";

});


// ========================================
// STARTSEITE ERSTELLEN
// ========================================

function renderThemes() {

    themeGrid.innerHTML = "";


    themes.forEach(function (theme) {

        const card =
            document.createElement("div");


        card.className =
            "theme-card";


        const image =
            document.createElement("img");


        image.className =
            "theme-cover";

        image.src =
            theme.cover;

        image.alt =
            theme.name;


        const name =
            document.createElement("div");


        name.className =
            "theme-name";

        name.textContent =
            theme.name;


        // Kleiner Menübutton

        const optionsButton =
            document.createElement("button");


        optionsButton.className =
            "theme-options";

        optionsButton.textContent =
            "⋯";


        // Klick auf die drei Punkte

        optionsButton.addEventListener("click", async function (event) {

            // Verhindert, dass gleichzeitig
            // das Thema geöffnet wird

            event.stopPropagation();


            const shouldDelete =
                confirm(
                    'Thema "' +
                    theme.name +
                    '" wirklich löschen?'
                );


            if (!shouldDelete) {

                return;

            }


            try {

                await deleteThemeFromDatabase(theme.name);

                await reloadThemes();

            }

            catch (error) {

                console.error(
                    "Thema konnte nicht gelöscht werden:",
                    error
                );

                alert(
                    "Das Thema konnte nicht gelöscht werden."
                );

            }

        });


        card.appendChild(image);

        card.appendChild(name);

        card.appendChild(optionsButton);


        // Normales Antippen öffnet das Thema

        card.addEventListener("click", function () {

            openTheme(theme);

        });


        themeGrid.appendChild(card);

    });

}


// ========================================
// THEMA ÖFFNEN
// ========================================

function openTheme(theme) {

    currentTheme =
        theme;

    previousPair =
        [];


    topbar.style.display =
        "none";

    themeGrid.style.display =
        "none";


    gameScreen.style.display =
        "block";


    showRandomPair();

}


// ========================================
// ZUFÄLLIGES BILDPAAR
// ========================================

function showRandomPair() {

    const images =
        currentTheme.images;


    let availableImages =
        images.filter(function (image) {

            return !previousPair.includes(image);

        });


    if (availableImages.length < 2) {

        availableImages =
            [...images];

    }


    const firstIndex =
        Math.floor(
            Math.random() *
            availableImages.length
        );


    const firstImage =
        availableImages[firstIndex];


    const remainingImages =
        availableImages.filter(function (image) {

            return image !== firstImage;

        });


    const secondIndex =
        Math.floor(
            Math.random() *
            remainingImages.length
        );


    const secondImage =
        remainingImages[secondIndex];


    topGameImage.src =
        firstImage;

    bottomGameImage.src =
        secondImage;


    previousPair = [
        firstImage,
        secondImage
    ];

}


// ========================================
// BILD AUSWÄHLEN
// ========================================

function selectImage(selectedArea) {

    if (roundChanging) {

        return;

    }


    roundChanging =
        true;


    selectedArea.classList.add("selected");


    // 0,5 Sekunden Auswahl

    setTimeout(function () {

        selectedArea.classList.remove("selected");


        topImageArea.classList.add("exit");

        bottomImageArea.classList.add("exit");


        // Bilder fahren 0,35 Sekunden raus

        setTimeout(function () {


            // Danach 0,5 Sekunden Pause

            setTimeout(function () {


                showRandomPair();


                topImageArea.classList.remove("exit");

                bottomImageArea.classList.remove("exit");


                topImageArea.classList.add("enter-start");

                bottomImageArea.classList.add("enter-start");


                requestAnimationFrame(function () {

                    requestAnimationFrame(function () {


                        topImageArea.classList.remove("enter-start");

                        bottomImageArea.classList.remove("enter-start");


                        setTimeout(function () {

                            roundChanging =
                                false;

                        }, 350);


                    });

                });


            }, 500);


        }, 350);


    }, 500);

}


// ========================================
// BILDER ANTIPPEN
// ========================================

topImageArea.addEventListener("click", function () {

    selectImage(topImageArea);

});


bottomImageArea.addEventListener("click", function () {

    selectImage(bottomImageArea);

});


// ========================================
// HAUPTMENÜ
// ========================================

menuButton.addEventListener("click", function () {

    gameScreen.style.display =
        "none";


    topbar.style.display =
        "block";

    themeGrid.style.display =
        "grid";


    currentTheme =
        null;

});


// ========================================
// START
// ========================================

loadSavedThemes();
// ========================================
// OFFLINE-SERVICE-WORKER
// ========================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function () {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(function () {

                console.log("Offline-Modus ist bereit.");

            })
            .catch(function (error) {

                console.error(
                    "Service Worker konnte nicht gestartet werden:",
                    error
                );

            });

    });

}