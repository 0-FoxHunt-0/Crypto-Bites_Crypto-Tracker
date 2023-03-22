/// <reference path="jquery-3.6.1.js" />

"use strict";

// LINK TO ONLINE WEBPAGE: https://project2-cryptobyte-ns.firebaseapp.com/

(() => {

    let IntervalId;
    let selectedCoins = []
    let coins = []
    let coinMoreInfoMap = new Map();

    const currenciesLink = document.getElementById('currenciesLink');
    const reportsLink = document.getElementById('reportsLink');
    const aboutLink = document.getElementById('aboutLink');
    const contentDiv = document.getElementById('contentDiv');

    currenciesLink.addEventListener("click", (e) => {
        showHomePage()
    })

    reportsLink.addEventListener("click", (e) => {
        handleCReports()
    })

    // aboutLink.addEventListener("click", (e) => {
    //     e.preventDefault()
    //     handleAbout()
    // })

    function onLoad() {
        window.onload = showHomePage();
        $("#currenciesLink").attr('aria-current', "page")
    }
    onLoad()

    function showHomePage() {
        clearInterval(IntervalId)
        $("#loader").hide()
        $("#contentDiv").empty();
        resetErrorsDivs();
        handleCurrencies();
        toggleTrueSelectedCoins();
        search()
        checkBoxState()
        $("#currenciesLink").addClass("active")
        $("#reportsLink").removeClass("active")
        $("#aboutLink").removeClass("active")
    }

    async function handleCurrencies() {

        const coinsString = localStorage.getItem('currenciesInfo')

        if (coinsString) { }

        else {
            $("#loader").show()
            let json = JSON.stringify(await getJson("https://api.coingecko.com/api/v3/coins/"))
            localStorage.setItem('currenciesInfo', json)
            $("#loader").hide()
        }

        coins = JSON.parse(localStorage.getItem('currenciesInfo'))
        coinMapSet(coins)
        displayCoins(coinMoreInfoMap)
    }

    function coinMapSet(coins) {
        coins.forEach(coin => {
            coinMoreInfoMap.set(coin.symbol.toUpperCase(), coin)
        });
    }

    function toggleTrueSelectedCoins() {
        // coinMoreInfoMap.forEach(coin => {
        //     $(`myCard`).prop('checked', false)
        // })
        for (let index = 0; index < selectedCoins.length; index++) {
            $(`#${selectedCoins[index]}`).prop('checked', true);
        }
    }


    function displayCoins(coinMap) {
        let html = "";
        coinMap.forEach(coin => {
            html += `
                <div class="myCard" id="card${coin.symbol.toUpperCase()}">
                    <p class="coinSymbol">${coin.symbol.toUpperCase()}</p>
                    <p class="coinName">${coin.name}</p>
                    <button id="moreInfo${coin.id}" class="btn moreInfo" type="button" data-bs-toggle="collapse" data-bs-target="#${coin.id}">
                        More info
                    </button>
                    <div class="collapse" id="${coin.id}">
                        <div class="card-body in">
                            <img class="cardImg" src="${coin.image.small}">
                            <br>
                            <p>$ ${coin.market_data.current_price.usd}</p>
                            <p>€ ${coin.market_data.current_price.eur}</p>
                            <p>₪ ${coin.market_data.current_price.ils}</p>
                        </div>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input checkbox checkBoxState" type="checkbox" role="switch" id="${coin.symbol.toUpperCase()}">
                    </div>
                </div>
        `
        })
        contentDiv.innerHTML = html
    }

    function checkBoxState() {
        let coinSymbol;
        $(".checkBoxState").on("change", this, function () {
            if (this.checked) {
                onToggleSwitchClicked(this, this.id)
            }
            if (this.checked === false) {
                selectedCoins.forEach(symbol => {
                    if (symbol === coinSymbol)
                        selectedCoins.splice(coinSymbol, 1)
                })
            }
            resetErrorsDivs()
        })
    }

    function onToggleSwitchClicked(currentChoice, coinSymbol) {
        let toggleId = currentChoice.id;
        let symbolCoinIndex = selectedCoins.indexOf(coinSymbol);

        if (symbolCoinIndex != -1) {
            selectedCoins.splice(symbolCoinIndex, 1);
        }

        else if (selectedCoins.length < 5) {
            selectedCoins.push(coinSymbol);
        }
        else {
            activeModal(toggleId, coinSymbol);
        }

    }

    function activeModal(toggleId, coinSymbol) {
        $("#modalContainer").addClass("modal-active");
        $("#modalBody").empty();
        $(`#${toggleId}`).prop('checked', false);

        $("#modalBodyInstruction").html('To add the' + " " + coinSymbol.toUpperCase() + " " + 'coin, you must unselect one of the following:');
        let counterId = 0;

        for (let index = 0; index < selectedCoins.length; index++) {
            createSelectedCardForModal(selectedCoins[index], counterId);
            $(`#chosenToggle${counterId}`).prop('checked', true);
            $(`#chosenToggle${counterId}`).on('click', () => {
                let coinToRemove = selectedCoins.indexOf(selectedCoins[index]);
                let toggleToFalse = selectedCoins[index];

                selectedCoins.splice(coinToRemove, 1);
                selectedCoins.push(coinSymbol);

                $("#modalContainer").removeClass("modal-active");

                $(`#${toggleToFalse}`).prop('checked', false);
                $(`#${toggleId}`).prop('checked', true);
            });

            counterId++
        }

        keepCurrentSelectionModalBtn();
    }

    function createSelectedCardForModal(selectedCoins, counterId) {
        $("#modalBody").append(`
            <div class="contentCard">
            <div class="selectedCardBody">
                <h6 class="selectedCoinName" class="card-title">${selectedCoins.toUpperCase()}</h6>
            </div>
    
            <label class="modalSwitch">
            <input type="checkbox" id="chosenToggle${counterId}">
            <span class="slider round"></span>
            </label>
        </div>`);
    }

    function keepCurrentSelectionModalBtn() {
        $("#keepChoicesBtn").click(function () {
            $("#modalContainer").removeClass("modal-active");
        });
    }

    async function getJson(url) {
        const response = await fetch(url)
        const json = await response.json()
        return json;
    }

    function resetErrorsDivs() {
        $("#unselactenCoinsErrorDiv").html("");
        $("#searchErrorsDiv").html("");
    }

    function handleCReports(e) {
        clearInterval(IntervalId)
        resetErrorsDivs();
        $("#currenciesLink").removeClass("active")
        $("#reportsLink").addClass("active")
        $("#aboutLink").removeClass("active")

        if (isEmptySelectedCoinsArray()) {
            showHomePage();
            $("#container").show()
            $("#unselactenCoinsErrorDiv").show()
            $("#unselactenCoinsErrorDiv").html("Please select up to 5 coins to display on the graph!");
        }
        else {
            $("#contentDiv").empty();
            $("#loader").show();

            let coinSelectedIndex0 = [];
            let coinSelectedIndex1 = [];
            let coinSelectedIndex2 = [];
            let coinSelectedIndex3 = [];
            let coinSelectedIndex4 = [];
            let coinKeysArray = [];

            IntervalId = setInterval(() => {
                getData();
            }, 2000)

            function getData() {
                let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins[0]},${selectedCoins[1]},${selectedCoins[2]},${selectedCoins[3]},${selectedCoins[4]}&tsyms=USD`
                $.get(url).then((coinsValue) => {
                    $("#contentDiv").attr("style", "margin: 0;").addClass("chart").html(`<div id="chartContainer" style="height: 50%; width: 50%; align-self: center; vertical-align: middle;"></div>`);

                    let dateNow = new Date();
                    let coinToShowOnGraph = 1;
                    coinKeysArray = [];

                    for (let key in coinsValue) {

                        if (coinToShowOnGraph == 1) {
                            coinSelectedIndex0.push({ x: dateNow, y: coinsValue[key].USD });
                            coinKeysArray.push(key);
                        }

                        if (coinToShowOnGraph == 2) {
                            coinSelectedIndex1.push({ x: dateNow, y: coinsValue[key].USD });
                            coinKeysArray.push(key);
                        }

                        if (coinToShowOnGraph == 3) {
                            coinSelectedIndex2.push({ x: dateNow, y: coinsValue[key].USD });
                            coinKeysArray.push(key);
                        }

                        if (coinToShowOnGraph == 4) {
                            coinSelectedIndex3.push({ x: dateNow, y: coinsValue[key].USD });
                            coinKeysArray.push(key);
                        }

                        if (coinToShowOnGraph == 5) {
                            coinSelectedIndex4.push({ x: dateNow, y: coinsValue[key].USD });
                            coinKeysArray.push(key);
                        }

                        coinToShowOnGraph++;
                    }
                    createGraph();
                    $("#loader").hide();

                });
            }

            function createGraph() {

                let chart = new CanvasJS.Chart("chartContainer", {
                    exportEnabled: true,
                    animationEnabled: false,

                    title: {
                        text: "Crypto Coins Currencies Real-Time in $USD"
                    },
                    axisX: {
                        title: "Time",
                        valueFormatString: "HH:mm:ss",
                    },
                    axisY: {
                        title: "Currency Value",
                        suffix: "$",
                        titleFontColor: "#4F81BC",
                        lineColor: "#4F81BC",
                        labelFontColor: "#4F81BC",
                        tickColor: "#4F81BC",
                        includeZero: true,
                    },

                    toolTip: {
                        shared: true
                    },
                    data: [{
                        type: "spline",
                        name: coinKeysArray[0],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: coinSelectedIndex0,
                    },
                    {
                        type: "spline",
                        name: coinKeysArray[1],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: coinSelectedIndex1,
                    },
                    {
                        type: "spline",
                        name: coinKeysArray[2],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: coinSelectedIndex2,
                    },
                    {
                        type: "spline",
                        name: coinKeysArray[3],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: coinSelectedIndex3,
                    },
                    {
                        type: "spline",
                        name: coinKeysArray[4],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: coinSelectedIndex4,
                    }]
                });

                chart.render();
            }
        }
    }

    function isEmptySelectedCoinsArray() {
        if (selectedCoins.length == 0) {
            return true;
        }

        return false;
    }

    // on Search click
    function search() {
        $("#searchForm").on("submit", (e) => {
            e.preventDefault();
            clearInterval(IntervalId);
            resetErrorsDivs();
            let coinSearch = $("#coinSearch").val().toUpperCase();

            $("#coinSearch").val("");

            if (!$("#currenciesLink").hasClass(".active")) {
                showHomePage()
            }

            if (isEmptyField(coinSearch)) {
                $("#searchErrorsDiv").html("Please enter a coin name");
                console.log("Error")
            }
            else {
                let operator = false;
                let searchPrintArray = []
                coinMoreInfoMap.forEach(coin => {
                    if (coin.symbol.toUpperCase().includes(coinSearch)) {
                        resetErrorsDivs()
                        operator = true;
                        searchPrintArray.push(coin)
                    }
                })
                if (operator === true) {
                    $(".myCard").hide()
                    searchPrintArray.forEach(coin => {
                        $(`#card${coin.symbol.toUpperCase()}`).show()
                    })

                    // $("#contentDiv").empty();
                    // displayCoins(searchPrintArray);
                    toggleTrueSelectedCoins();
                    resetErrorsDivs();
                    return;
                }
                else {
                    $("#searchErrorsDiv").html("Could not find a matching coin");
                }
            }
        });
    }

    function isEmptyField(field) {
        if (field.length === 0 || field.trim() == null) {
            return true;
        }

        return false;
    }

    $("#aboutLink").click(() => {
        clearInterval(IntervalId);
        resetErrorsDivs();

        $("#currenciesLink").removeClass("active")
        $("#reportsLink").removeClass("active")
        $("#aboutLink").addClass("active")

        $("#contentDiv").empty();
        $("#contentDiv").html(`
            <div id="aboutDiv">
            <h2> Welcome! </h2>
            <br>
            <span> My name is Nathanael Stahlberg, </span>
            <br>
            <span> <span class="bolderTextAboutPage"> Crypto-Byte </span> owner. </span>
            <br>
            <span> I am 18 years old, </span>
            <br>
            <span> Raised in Bat-Yam, Israel. </span>
            <br>
            <br>

            <p> I started getting into web developing and programming as youth at school making drones and other projects, but all it was just a hobby.</P>
            <p> Then covid-19 showed up, and made me think about my future.</P>
            <p> So i finished school and started to study Web Development, and eventually to create <span class="bolderTextAboutPage"> Crypto-Bytes</span>.</P>
            </div>`);
    });


})()