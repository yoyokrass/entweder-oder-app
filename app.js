const addThemeButton =
    document.getElementById("addThemeButton");

const folderInput =
    document.getElementById("folderInput");

const homeScreen =
    document.getElementById("homeScreen");

const topbar =
    document.querySelector(".topbar");

const themeGrid =
    document.getElementById("themeGrid");


const gameScreen =
    document.getElementById("gameScreen");

const menuButton =
    document.getElementById("menuButton");


const topGameImage =
    document.getElementById("topGameImage");

const bottomGameImage =
    document.getElementById("bottomGameImage");


const topInfoButton =
    document.getElementById("topInfoButton");

const bottomInfoButton =
    document.getElementById("bottomInfoButton");


const topImageInfo =
    document.getElementById("topImageInfo");

const bottomImageInfo =
    document.getElementById("bottomImageInfo");


const topImageArea =
    document.querySelector(".top-image");

const bottomImageArea =
    document.querySelector(".bottom-image");


// ========================================
// ALLGEMEINE VARIABLEN
// ========================================

let themes = [];

let currentTheme = null;


/*
    Hier merken wir uns die zuletzt
    gezeigten Bilder.

    Ungefähr das letzte Drittel des
    Bildpools wird vorübergehend gesperrt.
*/

let recentImages = [];


let roundChanging = false;


// ========================================
// DATENBANK
// ========================================

const databasePromise =
    openDatabase();


function openDatabase() {

    return new Promise(function (resolve, reject) {

        const request =
            indexedDB.open(
                "EntwederOderDatabase",
                1
            );


        request.onupgradeneeded =
            function (event) {

                const database =
                    event.target.result;


                if (
                    !database.objectStoreNames.contains(
                        "themes"
                    )
                ) {

                    database.createObjectStore(
                        "themes",
                        {
                            keyPath: "name"
                        }
                    );

                }

            };


        request.onsuccess =
            function (event) {

                resolve(
                    event.target.result
                );

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

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
            database.transaction(
                "themes",
                "readwrite"
            );


        const store =
            transaction.objectStore(
                "themes"
            );


        const request =
            store.put(
                themeData
            );


        request.onsuccess =
            function () {

                resolve();

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

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
            database.transaction(
                "themes",
                "readwrite"
            );


        const store =
            transaction.objectStore(
                "themes"
            );


        const request =
            store.delete(
                themeName
            );


        request.onsuccess =
            function () {

                resolve();

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

            };

    });

}


// ========================================
// ALLE THEMEN LADEN
// ========================================

async function loadThemesFromDatabase() {

    const database =
        await databasePromise;


    return new Promise(function (resolve, reject) {

        const transaction =
            database.transaction(
                "themes",
                "readonly"
            );


        const store =
            transaction.objectStore(
                "themes"
            );


        const request =
            store.getAll();


        request.onsuccess =
            function () {

                resolve(
                    request.result
                );

            };


        request.onerror =
            function () {

                reject(
                    request.error
                );

            };

    });

}


// ========================================
// DATEINAME AUFBEREITEN
// ========================================

function cleanImageName(fileName) {

    if (!fileName) {

        return "";

    }


    /*
        Entfernt die Dateiendung.

        Beispiel:

        Mexikanischer Wolf.jpg

        wird zu:

        Mexikanischer Wolf
    */

    return fileName.replace(
        /\.[^/.]+$/,
        ""
    );

}


// ========================================
// GESPEICHERTE DATEN VORBEREITEN
// ========================================

function prepareThemeForUse(storedTheme) {

    const preparedImages =
        storedTheme.images.map(
            function (storedImage, index) {


                /*
                    NEUES FORMAT

                    {
                        file: Bilddatei,
                        name: "Jaguar"
                    }
                */

                if (
                    storedImage &&
                    storedImage.file
                ) {

                    return {

                        url:
                            URL.createObjectURL(
                                storedImage.file
                            ),

                        name:
                            storedImage.name ||
                            cleanImageName(
                                storedImage.file.name
                            ) ||
                            "Bild " + (index + 1)

                    };

                }


                /*
                    ALTES FORMAT

                    Alte Themen enthalten
                    nur die Bilddatei.

                    Dadurch bleiben sie
                    weiterhin spielbar.
                */

                return {

                    url:
                        URL.createObjectURL(
                            storedImage
                        ),

                    name:
                        cleanImageName(
                            storedImage.name
                        ) ||
                        "Bild " + (index + 1)

                };

            }
        );


    return {

        name:
            storedTheme.name,

        cover:
            URL.createObjectURL(
                storedTheme.cover
            ),

        images:
            preparedImages

    };

}


// ========================================
// THEMEN NEU LADEN
// ========================================

async function reloadThemes() {

    const storedThemes =
        await loadThemesFromDatabase();


    themes =
        storedThemes.map(
            function (storedTheme) {

                return prepareThemeForUse(
                    storedTheme
                );

            }
        );


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

addThemeButton.addEventListener(
    "click",
    function () {

        folderInput.click();

    }
);


folderInput.addEventListener(
    "change",
    async function () {

        const files =
            Array.from(
                folderInput.files
            );


        if (files.length === 0) {

            return;

        }


        // --------------------------------
        // ORDNERNAME = THEMENNAME
        // --------------------------------

        const firstPath =
            files[0].webkitRelativePath;


        const themeName =
            firstPath.split("/")[0];


        // --------------------------------
        // NUR BILDDATEIEN
        // --------------------------------

        const imageFiles =
            files.filter(
                function (file) {

                    return file.type.startsWith(
                        "image/"
                    );

                }
            );


        // --------------------------------
        // COVER SUCHEN
        // --------------------------------

        const coverFile =
            imageFiles.find(
                function (file) {

                    const name =
                        file.name.toLowerCase();


                    return (
                        name === "cover.jpg" ||
                        name === "cover.jpeg" ||
                        name === "cover.png" ||
                        name === "cover.webp"
                    );

                }
            );


        // --------------------------------
        // SPIELBILDER
        // --------------------------------

        const gameFiles =
            imageFiles.filter(
                function (file) {

                    return file !== coverFile;

                }
            );


        // --------------------------------
        // PRÜFUNGEN
        // --------------------------------

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


        // --------------------------------
        // BILDER + DATEINAMEN SPEICHERN
        // --------------------------------

        const storedGameImages =
            gameFiles.map(
                function (file) {

                    return {

                        file:
                            file,

                        name:
                            cleanImageName(
                                file.name
                            )

                    };

                }
            );


        const storedTheme = {

            name:
                themeName,

            cover:
                coverFile,

            images:
                storedGameImages

        };


        try {

            await saveThemeToDatabase(
                storedTheme
            );


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

    }
);


// ========================================
// STARTSEITE ERSTELLEN
// ========================================

function renderThemes() {

    themeGrid.innerHTML = "";


    themes.forEach(
        function (theme) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "theme-card";


            // --------------------------------
            // TITELBILD
            // --------------------------------

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "theme-cover";


            image.src =
                theme.cover;


            image.alt =
                theme.name;


            // --------------------------------
            // THEMENNAME
            // --------------------------------

            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "theme-name";


            name.textContent =
                theme.name;


            // --------------------------------
            // DREI-PUNKTE-BUTTON
            // --------------------------------

            const optionsButton =
                document.createElement(
                    "button"
                );


            optionsButton.className =
                "theme-options";


            optionsButton.textContent =
                "⋯";


            optionsButton.addEventListener(
                "click",
                async function (event) {

                    /*
                        Verhindert, dass beim
                        Drücken der drei Punkte
                        das Thema gestartet wird.
                    */

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

                        await deleteThemeFromDatabase(
                            theme.name
                        );


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

                }
            );


            // --------------------------------
            // KARTE ZUSAMMENBAUEN
            // --------------------------------

            card.appendChild(
                image
            );


            card.appendChild(
                name
            );


            card.appendChild(
                optionsButton
            );


            // --------------------------------
            // THEMA ÖFFNEN
            // --------------------------------

            card.addEventListener(
                "click",
                function () {

                    openTheme(
                        theme
                    );

                }
            );


            themeGrid.appendChild(
                card
            );

        }
    );

}


// ========================================
// THEMA ÖFFNEN
// ========================================

function openTheme(theme) {

    currentTheme =
        theme;


    /*
        Verlauf beim Start eines
        Themas zurücksetzen.
    */

    recentImages =
        [];


    /*
        Eventuell noch sichtbare
        Bildinformationen schließen.
    */

    topImageInfo.classList.remove(
        "visible"
    );

    bottomImageInfo.classList.remove(
        "visible"
    );


    homeScreen.style.display =
    "none";

    gameScreen.style.display =
    "block";


    showRandomPair();

}


// ========================================
// GRÖSSE DER WIEDERHOLUNGSSPERRE
// ========================================

function getHistoryLimit() {

    if (!currentTheme) {

        return 0;

    }


    const imageCount =
        currentTheme.images.length;


    /*
        Ungefähr ein Drittel.

        Beispiele:

        20 Bilder  -> 7
        30 Bilder  -> 10
        54 Bilder  -> 18
        100 Bilder -> 34
    */

    let limit =
        Math.ceil(
            imageCount / 3
        );


    /*
        Mindestens zwei Bilder müssen
        immer außerhalb der Sperre bleiben.
    */

    limit =
        Math.min(
            limit,
            imageCount - 2
        );


    return Math.max(
        0,
        limit
    );

}


// ========================================
// BILD ZUM VERLAUF HINZUFÜGEN
// ========================================

function addImageToHistory(image) {

    recentImages.push(
        image.url
    );


    const historyLimit =
        getHistoryLimit();


    /*
        Nur die letzten X Bilder
        in der Sperrliste behalten.
    */

    while (
        recentImages.length >
        historyLimit
    ) {

        recentImages.shift();

    }

}


// ========================================
// ZUFÄLLIGES BILDPAAR
// ========================================

function showRandomPair() {

    const images =
        currentTheme.images;


    // ------------------------------------
    // GESPERRTE BILDER AUSSCHLIESSEN
    // ------------------------------------

    let availableImages =
        images.filter(
            function (image) {

                return !recentImages.includes(
                    image.url
                );

            }
        );


    /*
        Sicherheitsnetz:

        Falls aus irgendeinem Grund weniger
        als zwei Bilder verfügbar sind,
        geben wir die ältesten gesperrten
        Bilder wieder frei.
    */

    while (
        availableImages.length < 2 &&
        recentImages.length > 0
    ) {

        recentImages.shift();


        availableImages =
            images.filter(
                function (image) {

                    return !recentImages.includes(
                        image.url
                    );

                }
            );

    }


    // ------------------------------------
    // ERSTES BILD
    // ------------------------------------

    const firstIndex =
        Math.floor(
            Math.random() *
            availableImages.length
        );


    const firstImage =
        availableImages[
            firstIndex
        ];


    // ------------------------------------
    // ZWEITES BILD
    // ------------------------------------

    const remainingImages =
        availableImages.filter(
            function (image) {

                return (
                    image.url !==
                    firstImage.url
                );

            }
        );


    const secondIndex =
        Math.floor(
            Math.random() *
            remainingImages.length
        );


    const secondImage =
        remainingImages[
            secondIndex
        ];


    // ------------------------------------
    // BILDER ANZEIGEN
    // ------------------------------------

    topGameImage.src =
        firstImage.url;


    bottomGameImage.src =
        secondImage.url;


    // ------------------------------------
    // BILDNAMEN HINTERLEGEN
    // ------------------------------------

    topGameImage.dataset.imageName =
        firstImage.name;


    bottomGameImage.dataset.imageName =
        secondImage.name;


    /*
        Falls bei der vorherigen Runde
        ein Name sichtbar war, wird er
        jetzt automatisch geschlossen.
    */

    topImageInfo.classList.remove(
        "visible"
    );


    bottomImageInfo.classList.remove(
        "visible"
    );


    // ------------------------------------
    // BILDER IN VERLAUF AUFNEHMEN
    // ------------------------------------

    addImageToHistory(
        firstImage
    );


    addImageToHistory(
        secondImage
    );

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


    /*
        Falls ein Info-Name geöffnet ist,
        schließen wir ihn.
    */

    topImageInfo.classList.remove(
        "visible"
    );


    bottomImageInfo.classList.remove(
        "visible"
    );


    // ------------------------------------
    // AUSWAHL-RAND
    // ------------------------------------

    selectedArea.classList.add(
        "selected"
    );


    /*
        0,5 Sekunden Auswahl anzeigen.
    */

    setTimeout(
        function () {

            selectedArea.classList.remove(
                "selected"
            );


            // ----------------------------
            // BILDER FAHREN HINAUS
            // ----------------------------

            topImageArea.classList.add(
                "exit"
            );


            bottomImageArea.classList.add(
                "exit"
            );


            /*
                0,35 Sekunden
                Ausfahranimation.
            */

            setTimeout(
                function () {


                    /*
                        Danach 0,5 Sekunden
                        Pause.
                    */

                    setTimeout(
                        function () {


                            // ----------------
                            // NEUES BILDPAAR
                            // ----------------

                            showRandomPair();


                            topImageArea.classList.remove(
                                "exit"
                            );


                            bottomImageArea.classList.remove(
                                "exit"
                            );


                            topImageArea.classList.add(
                                "enter-start"
                            );


                            bottomImageArea.classList.add(
                                "enter-start"
                            );


                            requestAnimationFrame(
                                function () {

                                    requestAnimationFrame(
                                        function () {


                                            // ----------------
                                            // BILDER FAHREN REIN
                                            // ----------------

                                            topImageArea.classList.remove(
                                                "enter-start"
                                            );


                                            bottomImageArea.classList.remove(
                                                "enter-start"
                                            );


                                            setTimeout(
                                                function () {

                                                    roundChanging =
                                                        false;

                                                },
                                                350
                                            );

                                        }
                                    );

                                }
                            );

                        },
                        500
                    );

                },
                350
            );

        },
        500
    );

}


// ========================================
// BILDER ANTIPPEN
// ========================================

topImageArea.addEventListener(
    "click",
    function () {

        selectImage(
            topImageArea
        );

    }
);


bottomImageArea.addEventListener(
    "click",
    function () {

        selectImage(
            bottomImageArea
        );

    }
);


// ========================================
// BILDINFORMATION
// ========================================

function showImageInfo(
    imageElement,
    infoElement
) {

    const imageName =
        imageElement.dataset.imageName;


    if (!imageName) {

        return;

    }


    infoElement.textContent =
        imageName;


    /*
        Bei erneutem Drücken auf i
        verschwindet der Name wieder.
    */

    infoElement.classList.toggle(
        "visible"
    );

}


// ========================================
// OBERER INFO-BUTTON
// ========================================

topInfoButton.addEventListener(
    "click",
    function (event) {

        /*
            Sehr wichtig:

            Der Klick auf i darf NICHT
            gleichzeitig das Bild auswählen.
        */

        event.stopPropagation();


        showImageInfo(
            topGameImage,
            topImageInfo
        );

    }
);


// ========================================
// UNTERER INFO-BUTTON
// ========================================

bottomInfoButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();


        showImageInfo(
            bottomGameImage,
            bottomImageInfo
        );

    }
);


// ========================================
// HAUPTMENÜ
// ========================================

menuButton.addEventListener(
    "click",
    function () {

    gameScreen.style.display =
    "none";

    homeScreen.style.display =
    "block";


        currentTheme =
            null;


        recentImages =
            [];


        topImageInfo.classList.remove(
            "visible"
        );


        bottomImageInfo.classList.remove(
            "visible"
        );

    }
);


// ========================================
// APP STARTEN
// ========================================

loadSavedThemes();


// ========================================
// OFFLINE-SERVICE-WORKER
// ========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    function () {

                        console.log(
                            "Offline-Modus ist bereit."
                        );

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Service Worker konnte nicht gestartet werden:",
                            error
                        );

                    }
                );

        }
    );

}