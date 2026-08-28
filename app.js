/* =========================================
   ELEMENTE
   ========================================= */

const mainMenu =
    document.getElementById("mainMenu");

const normalModeButton =
    document.getElementById("normalModeButton");

const eliminationModeButton =
    document.getElementById("eliminationModeButton");

const manageThemesButton =
    document.getElementById("manageThemesButton");


const themeSelection =
    document.getElementById("themeSelection");

const selectionBackButton =
    document.getElementById("selectionBackButton");

const selectionTitle =
    document.getElementById("selectionTitle");

const themeGrid =
    document.getElementById("themeGrid");


const themeManagement =
    document.getElementById("themeManagement");

const managementBackButton =
    document.getElementById("managementBackButton");

const managementThemeGrid =
    document.getElementById("managementThemeGrid");

const addThemeButton =
    document.getElementById("addThemeButton");

const folderInput =
    document.getElementById("folderInput");


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


/* Gewinnerseite */

const winnerScreen =
    document.getElementById("winnerScreen");

const winnerImage =
    document.getElementById("winnerImage");

const winnerName =
    document.getElementById("winnerName");

const playAgainButton =
    document.getElementById("playAgainButton");

const winnerThemesButton =
    document.getElementById("winnerThemesButton");

const winnerBackButton =
    document.getElementById("winnerBackButton");


/* =========================================
   VARIABLEN
   ========================================= */

let themes = [];

let currentTheme = null;
let selectedMode = null;

let recentImages = [];

let roundChanging = false;


/* Elimination */

let eliminationOrder = [];

let eliminationNextIndex = 0;

let topEliminationImage = null;
let bottomEliminationImage = null;


const databasePromise =
    openDatabase();


/* =========================================
   DATENBANK
   ========================================= */

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


async function saveThemeToDatabase(
    themeData
) {

    const database =
        await databasePromise;


    return new Promise(
        function (resolve, reject) {

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
        }
    );
}


async function deleteThemeFromDatabase(
    themeName
) {

    const database =
        await databasePromise;


    return new Promise(
        function (resolve, reject) {

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
        }
    );
}


async function loadThemesFromDatabase() {

    const database =
        await databasePromise;


    return new Promise(
        function (resolve, reject) {

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
        }
    );
}


/* =========================================
   BILDNAMEN
   ========================================= */

function cleanImageName(fileName) {

    if (!fileName) {
        return "";
    }

    return fileName.replace(
        /\.[^/.]+$/,
        ""
    );
}


/* =========================================
   THEMEN VORBEREITEN
   ========================================= */

function prepareThemeForUse(
    storedTheme
) {

    const preparedImages =
        storedTheme.images.map(
            function (
                storedImage,
                index
            ) {

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
                            "Bild " +
                            (index + 1)
                    };
                }


                return {

                    url:
                        URL.createObjectURL(
                            storedImage
                        ),

                    name:
                        cleanImageName(
                            storedImage.name
                        ) ||
                        "Bild " +
                        (index + 1)
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


    renderThemeSelection();
    renderThemeManagement();
}


async function loadSavedThemes() {

    try {

        await reloadThemes();

    } catch (error) {

        console.error(
            "Themen konnten nicht geladen werden:",
            error
        );
    }
}


/* =========================================
   SEITEN
   ========================================= */

function hideAllScreens() {

    mainMenu.style.display =
        "none";

    themeSelection.style.display =
        "none";

    themeManagement.style.display =
        "none";

    gameScreen.style.display =
        "none";

    winnerScreen.style.display =
        "none";


    gameScreen.classList.remove(
        "game-visible"
    );
}


function showMainMenu() {

    hideAllScreens();

    mainMenu.style.display =
        "flex";


    selectedMode = null;
    currentTheme = null;

    recentImages = [];

    roundChanging = false;

    resetElimination();
}


function showThemeSelection(mode) {

    selectedMode =
        mode;

    hideAllScreens();

    themeSelection.style.display =
        "block";


    if (mode === "normal") {

        selectionTitle.textContent =
            "Das oder Das";

    } else {

        selectionTitle.textContent =
            "Elimination";
    }


    renderThemeSelection();
}


function showThemeManagement() {

    hideAllScreens();

    themeManagement.style.display =
        "block";

    renderThemeManagement();
}


/* =========================================
   HAUPTMENÜ
   ========================================= */

normalModeButton.addEventListener(
    "click",
    function () {

        showThemeSelection(
            "normal"
        );
    }
);


eliminationModeButton.addEventListener(
    "click",
    function () {

        showThemeSelection(
            "elimination"
        );
    }
);


manageThemesButton.addEventListener(
    "click",
    function () {

        showThemeManagement();
    }
);


selectionBackButton.addEventListener(
    "click",
    function () {

        showMainMenu();
    }
);


managementBackButton.addEventListener(
    "click",
    function () {

        showMainMenu();
    }
);


/* =========================================
   NEUES THEMA
   ========================================= */

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


        const firstPath =
            files[0].webkitRelativePath;


        const themeName =
            firstPath.split("/")[0];


        const imageFiles =
            files.filter(
                function (file) {

                    return file.type.startsWith(
                        "image/"
                    );
                }
            );


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


        const gameFiles =
            imageFiles.filter(
                function (file) {

                    return file !==
                        coverFile;
                }
            );


        if (!coverFile) {

            alert(
                "Der Ordner braucht ein Titelbild namens cover.jpg, cover.jpeg, cover.png oder cover.webp."
            );

            folderInput.value =
                "";

            return;
        }


        if (gameFiles.length < 2) {

            alert(
                "Das Thema braucht mindestens zwei Spielbilder."
            );

            folderInput.value =
                "";

            return;
        }


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

        } catch (error) {

            console.error(
                "Thema konnte nicht gespeichert werden:",
                error
            );

            alert(
                "Das Thema konnte nicht gespeichert werden."
            );
        }


        folderInput.value =
            "";
    }
);


/* =========================================
   THEMENAUSWAHL
   ========================================= */

function renderThemeSelection() {

    themeGrid.innerHTML =
        "";


    themes.forEach(
        function (theme) {

            const card =
                createThemeCard(
                    theme,
                    false
                );


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


/* =========================================
   THEMEN VERWALTEN
   ========================================= */

function renderThemeManagement() {

    managementThemeGrid.innerHTML =
        "";


    themes.forEach(
        function (theme) {

            const card =
                createThemeCard(
                    theme,
                    true
                );


            managementThemeGrid.appendChild(
                card
            );
        }
    );
}


/* =========================================
   THEMENKARTE
   ========================================= */

function createThemeCard(
    theme,
    managementMode
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "theme-card";


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


    const name =
        document.createElement(
            "div"
        );

    name.className =
        "theme-name";

    name.textContent =
        theme.name;


    card.appendChild(
        image
    );

    card.appendChild(
        name
    );


    if (managementMode) {

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

                } catch (error) {

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


        card.appendChild(
            optionsButton
        );
    }


    return card;
}


/* =========================================
   THEMA STARTEN
   ========================================= */

function openTheme(theme) {

    currentTheme =
        theme;

    recentImages =
        [];

    roundChanging =
        false;


    topImageInfo.classList.remove(
        "visible"
    );

    bottomImageInfo.classList.remove(
        "visible"
    );


    hideAllScreens();


    gameScreen.style.display =
        "block";

    gameScreen.classList.add(
        "game-visible"
    );


    if (
        selectedMode ===
        "elimination"
    ) {

        startElimination();

    } else {

        showRandomPair();
    }
}


/* =========================================
   BILDER SETZEN
   ========================================= */

function setTopImage(image) {

    topGameImage.src =
        image.url;

    topGameImage.dataset.imageName =
        image.name;

    topImageInfo.classList.remove(
        "visible"
    );
}


function setBottomImage(image) {

    bottomGameImage.src =
        image.url;

    bottomGameImage.dataset.imageName =
        image.name;

    bottomImageInfo.classList.remove(
        "visible"
    );
}


/* =========================================
   DAS ODER DAS – ZUFALL
   ========================================= */

function getHistoryLimit() {

    if (!currentTheme) {
        return 0;
    }


    const imageCount =
        currentTheme.images.length;


    let limit =
        Math.ceil(
            imageCount / 3
        );


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


function addImageToHistory(image) {

    recentImages.push(
        image.url
    );


    const historyLimit =
        getHistoryLimit();


    while (
        recentImages.length >
        historyLimit
    ) {

        recentImages.shift();
    }
}


function showRandomPair() {

    const images =
        currentTheme.images;


    let availableImages =
        images.filter(
            function (image) {

                return !recentImages.includes(
                    image.url
                );
            }
        );


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


    const firstIndex =
        Math.floor(
            Math.random() *
            availableImages.length
        );


    const firstImage =
        availableImages[
            firstIndex
        ];


    const remainingImages =
        availableImages.filter(
            function (image) {

                return image.url !==
                    firstImage.url;
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


    setTopImage(
        firstImage
    );

    setBottomImage(
        secondImage
    );


    addImageToHistory(
        firstImage
    );

    addImageToHistory(
        secondImage
    );
}


/* =========================================
   DAS ODER DAS – AUSWAHL
   ========================================= */

function selectNormalImage(
    selectedArea
) {

    if (roundChanging) {
        return;
    }


    roundChanging =
        true;


    topImageInfo.classList.remove(
        "visible"
    );

    bottomImageInfo.classList.remove(
        "visible"
    );


    selectedArea.classList.add(
        "selected"
    );


    setTimeout(
        function () {

            selectedArea.classList.remove(
                "selected"
            );


            topImageArea.classList.add(
                "exit"
            );

            bottomImageArea.classList.add(
                "exit"
            );


            setTimeout(
                function () {

                    setTimeout(
                        function () {

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


/* =========================================
   ELIMINATION
   ========================================= */

function resetElimination() {

    eliminationOrder =
        [];

    eliminationNextIndex =
        0;

    topEliminationImage =
        null;

    bottomEliminationImage =
        null;
}


function shuffleImages(images) {

    const shuffled =
        images.slice();


    for (
        let i =
            shuffled.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        const temporary =
            shuffled[i];


        shuffled[i] =
            shuffled[j];

        shuffled[j] =
            temporary;
    }


    return shuffled;
}


function startElimination() {

    resetElimination();


    eliminationOrder =
        shuffleImages(
            currentTheme.images
        );


    topEliminationImage =
        eliminationOrder[0];

    bottomEliminationImage =
        eliminationOrder[1];


    eliminationNextIndex =
        2;


    setTopImage(
        topEliminationImage
    );

    setBottomImage(
        bottomEliminationImage
    );
}


/* =========================================
   ELIMINATION – AUSWAHL
   ========================================= */

function selectElimination(
    selectedArea
) {

    if (roundChanging) {
        return;
    }


    roundChanging =
        true;


    topImageInfo.classList.remove(
        "visible"
    );

    bottomImageInfo.classList.remove(
        "visible"
    );


    selectedArea.classList.add(
        "selected"
    );


    setTimeout(
        function () {

            selectedArea.classList.remove(
                "selected"
            );


            const topWon =
                selectedArea ===
                topImageArea;


            /*
               Das ausgewählte Bild ist
               der endgültige Gewinner.
            */

            if (
                eliminationNextIndex >=
                eliminationOrder.length
            ) {

                const winner =
                    topWon
                        ? topEliminationImage
                        : bottomEliminationImage;


                showEliminationWinner(
                    winner
                );


                roundChanging =
                    false;

                return;
            }


            const nextImage =
                eliminationOrder[
                    eliminationNextIndex
                ];


            eliminationNextIndex++;


            /*
               OBERES BILD GEWINNT:
               oben bleibt stehen,
               unten wird ersetzt.
            */

            if (topWon) {

                bottomImageArea.classList.add(
                    "elimination-exit-bottom"
                );


                setTimeout(
                    function () {

                        bottomEliminationImage =
                            nextImage;


                        setBottomImage(
                            bottomEliminationImage
                        );


                        bottomImageArea.classList.remove(
                            "elimination-exit-bottom"
                        );


                        bottomImageArea.classList.add(
                            "elimination-enter-bottom"
                        );


                        requestAnimationFrame(
                            function () {

                                requestAnimationFrame(
                                    function () {

                                        bottomImageArea.classList.remove(
                                            "elimination-enter-bottom"
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
                    350
                );
            }


            /*
               UNTERES BILD GEWINNT:
               unten bleibt stehen,
               oben wird ersetzt.
            */

            else {

                topImageArea.classList.add(
                    "elimination-exit-top"
                );


                setTimeout(
                    function () {

                        topEliminationImage =
                            nextImage;


                        setTopImage(
                            topEliminationImage
                        );


                        topImageArea.classList.remove(
                            "elimination-exit-top"
                        );


                        topImageArea.classList.add(
                            "elimination-enter-top"
                        );


                        requestAnimationFrame(
                            function () {

                                requestAnimationFrame(
                                    function () {

                                        topImageArea.classList.remove(
                                            "elimination-enter-top"
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
                    350
                );
            }

        },
        500
    );
}


/* =========================================
   GEWINNER
   ========================================= */

function showEliminationWinner(
    winner
) {

    hideAllScreens();


    winnerImage.src =
        winner.url;

    winnerImage.alt =
        winner.name;

    winnerName.textContent =
        winner.name;


    winnerScreen.style.display =
        "flex";
}


/* =========================================
   SPIELBILDER ANKLICKEN
   ========================================= */

topImageArea.addEventListener(
    "click",
    function () {

        if (
            selectedMode ===
            "elimination"
        ) {

            selectElimination(
                topImageArea
            );

        } else {

            selectNormalImage(
                topImageArea
            );
        }
    }
);


bottomImageArea.addEventListener(
    "click",
    function () {

        if (
            selectedMode ===
            "elimination"
        ) {

            selectElimination(
                bottomImageArea
            );

        } else {

            selectNormalImage(
                bottomImageArea
            );
        }
    }
);


/* =========================================
   BILD-INFORMATION
   ========================================= */

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


    infoElement.classList.toggle(
        "visible"
    );
}


topInfoButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();


        showImageInfo(
            topGameImage,
            topImageInfo
        );
    }
);


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


/* =========================================
   SPIEL VERLASSEN
   ========================================= */

menuButton.addEventListener(
    "click",
    function () {

        currentTheme =
            null;

        recentImages =
            [];

        roundChanging =
            false;


        resetElimination();


        topImageInfo.classList.remove(
            "visible"
        );

        bottomImageInfo.classList.remove(
            "visible"
        );


        if (selectedMode) {

            showThemeSelection(
                selectedMode
            );

        } else {

            showMainMenu();
        }
    }
);


/* =========================================
   GEWINNERSEITE – BUTTONS
   ========================================= */

playAgainButton.addEventListener(
    "click",
    function () {

        if (!currentTheme) {
            return;
        }


        hideAllScreens();


        gameScreen.style.display =
            "block";

        gameScreen.classList.add(
            "game-visible"
        );


        roundChanging =
            false;


        startElimination();
    }
);


winnerThemesButton.addEventListener(
    "click",
    function () {

        currentTheme =
            null;

        roundChanging =
            false;


        resetElimination();


        showThemeSelection(
            "elimination"
        );
    }
);


winnerBackButton.addEventListener(
    "click",
    function () {

        currentTheme =
            null;

        roundChanging =
            false;


        resetElimination();


        showThemeSelection(
            "elimination"
        );
    }
);


/* =========================================
   START
   ========================================= */

showMainMenu();

loadSavedThemes();


/* =========================================
   OFFLINE-MODUS
   ========================================= */

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