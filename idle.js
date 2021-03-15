var idle = (function() {

    // Create the library object
    var library = {};

    //Basic game data for user
    let gameData = {
        name: "Capitalism FTW",
        money: 10,
        currencySymbol: "$",
        moneyPerSecond: 0,
        properties: "Properties",
        closedData: null,
        globalPropNames: [],
    };

    //Checking to see if saved game. Calculating the idle time away from game, and adding it to total money
    let savegameGameData = JSON.parse(localStorage.getItem(`idlejsSave`));
    if (savegameGameData !== null) {
        gameData = savegameGameData;
        let nowDate = Date.now();
        let idleMoney = Math.floor((nowDate - gameData.closedData) / 1000) * gameData.moneyPerSecond;
        if (idleMoney > 0) {
            gameData.money += idleMoney;
            alert(`Your Managers made you a total of $${idleMoney} while you were away`);
        };
    };

    //Main game function
    library.game = function() {

        document.title = gameData.name;

        //Inserting HTML into body
        document.body.innerHTML = `
            <div class="title">
                <img src="assets/cashBag.gif" class="rounded float-end" alt="Hand holding a bag of money">
                <h1 class="text-center" id="gameTitle">${gameData.name}</h1>
                <div class="gamer_info">
                    <p id="total_money"> Total Money: ${gameData.money} ${gameData.currencySymbol}</p>
                    <div class="btn-group" role="group">
                        <button class="btn btn-success" type="button" onclick="idle.save()">Save</button>
                        <button class="btn btn-danger" type="button" onclick="idle.deleteSave()">Delete savegame</button>
                    </div>
                </div>
            </div>
            <section class= "property_section">
                <h2 id="properties">${gameData.properties}</h2>
                <div class="container">
                    <div class="row g-2" id="property_conntainer"></div>
                </div>
            </section>
            <div class="footer">
                <p id="footer_text">Created with love</p>
            </div>
            `;

        //Function to get money per second
        library.idle = function() {
            gameData.money += gameData.moneyPerSecond;
            document.getElementById("total_money").innerHTML = `Total Money: ${gameData.money} ${gameData.currencySymbol}`;
        };

        //Main game loop
        let mainGameLoop = window.setInterval(function() {
            library.idle();
        }, 1000);

        //Autosave every 15 sec
        let saveGameLoop = window.setInterval(function() {
            localStorage.setItem(`idlejsSave`, JSON.stringify(gameData));
        }, 15000);
    }

    //Constructor for creating properties
    library.propertyConstructor = class {
        constructor(propertyName, level, moneyPerSecond, cost, managerCost, imgLink) {
            this.name = propertyName;
            this.level = level;
            this.moneyPerSecond = moneyPerSecond;
            this.cost = cost;
            this.upgradeCost = cost * 2;
            this.accumulatedMoney = 0;
            this.manager = false;
            this.managerCost = managerCost;
            this.purchased = false;
            this.varName = propertyName.charAt(0).toLowerCase() + propertyName.substring(1).split(' ').join('');
            this.tickerVar;
            gameData.globalPropNames.push({propertyName: this.name, variableName: this.varName});
            
            //Checking if there is saved data and assigning
            let savegamePropertyLevel = JSON.parse(localStorage.getItem(`${this.name}level`));
            if (savegamePropertyLevel > this.level) {
                this.level = savegamePropertyLevel;
            };
            let savegameMoneyPerSecond = JSON.parse(localStorage.getItem(`${this.name}moneyPerSecond`));
            if (savegameMoneyPerSecond > this.moneyPerSecond) {
                this.moneyPerSecond = savegameMoneyPerSecond;
            };
            let savegameUpgradeCost = JSON.parse(localStorage.getItem(`${this.name}upgradeCost`));
            if (savegameUpgradeCost > this.upgradeCost) {
                this.upgradeCost = savegameUpgradeCost;
            };
            let savegameAccumulatedMoney = JSON.parse(localStorage.getItem(`${this.name}accumulatedMoney`));
            if (savegameAccumulatedMoney > this.accumulatedMoney) {
                this.accumulatedMoney = savegameAccumulatedMoney;
            };   
            
            //Interting each property into the property container
            document.getElementById("property_conntainer").innerHTML += `
            <div class="col-6">
                <div class="prop_box p-3 border">
                    <img src="${imgLink}" class="rounded float-end" alt="icon for ${this.name}">
                    <div>
                        <h3 id="${this.varName}text">${this.name} (current level: ${this.level})</h3>
                        <p class="accumulated_property" id="${this.varName}accumulated">Accumulated Money: ${this.accumulatedMoney}${gameData.currencySymbol}</p>
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-warning" type="button" id="${this.varName}collectButton" onclick="${this.varName}.collectMoney()">Collect Money</button>
                        </div>
                        <p class="mps_property" id="${this.varName}mps">${this.moneyPerSecond}${gameData.currencySymbol} per second</p>
                    </div>
                    <div>
                        <div class="btn-group" role="group">
                            <button class="btn btn-light" type="button" id="${this.varName}buyUpgrade" onclick="${this.varName}.buy()">Buy ${this.cost}${gameData.currencySymbol}</button>
                            <button class="btn btn-light" type="button" id="${this.varName}hireManager" onclick="${this.varName}.hireManager()">Hire Manager ${this.managerCost}${gameData.currencySymbol}</button>
                        </div>
                    </div>
                </div>
            </div>
            `;

            //checking saved data and setting up property loops
            let savegamePurchased = JSON.parse(localStorage.getItem(`${this.name}purchased`));
            if (savegamePurchased === true) {
                this.purchased = true;
                this.tickerVar = window.setInterval(`${this.varName}.ticker()`, 1000)
                document.getElementById(`${this.varName}buyUpgrade`).innerHTML = `Upgrade ${this.upgradeCost}${gameData.currencySymbol}`;
                document.getElementById(`${this.varName}buyUpgrade`).setAttribute( "onClick", `javascript: ${this.varName}.upgrade();` );
            };

            let savegameManager = JSON.parse(localStorage.getItem(`${this.name}manager`));
            //If there is no manager, but property is owned, calculating the idle time away from game, and adding it to accumulated money
            if (this.purchased === true && savegameManager !== true) {
                let nowDate = Date.now();
                let idleMoney = Math.floor((nowDate - gameData.closedData) / 1000) * this.moneyPerSecond;
                if (idleMoney > 0) {
                    this.accumulatedMoney += idleMoney;
                    alert(`${this.name} made $${idleMoney} while you were chilling out somewhere, remember to collect your money $$$`);
                };
            //if Manager is true, stop loop and update HTML
            } else if (savegameManager === true) {
                clearTimeout(this.tickerVar);
                this.manager = true;
                gameData.money += this.accumulatedMoney;

                document.getElementById("total_money").innerHTML = `Total Money: ${gameData.moneyPerSecond} ${gameData.currencySymbol}`;
                document.getElementById(`${this.varName}accumulated`).innerHTML = `You have hired a Manager to do your bidding!`;
                document.getElementById(`${this.varName}hireManager`).innerHTML = `Manager Hired`;
                let collectButton = document.getElementById(`${this.varName}collectButton`);
                collectButton.remove();
            };   
        }
        //function to buy property and start loop
        buy = function() {
            if (gameData.money >= this.cost) {
                gameData.money -= this.cost;
                this.purchased = true;

                this.tickerVar = window.setInterval(`${this.varName}.ticker()`, 1000);
                
                localStorage.setItem(`${this.name}level`, JSON.stringify(this.level));
                localStorage.setItem(`${this.name}moneyPerSecond`, JSON.stringify(this.moneyPerSecond));
                localStorage.setItem(`${this.name}upgradeCost`, JSON.stringify(this.upgradeCost));
                localStorage.setItem(`${this.name}accumulatedMoney`, JSON.stringify(this.accumulatedMoney));
                localStorage.setItem(`${this.name}purchased`, JSON.stringify(this.purchased));
                localStorage.setItem(`idlejsSave`, JSON.stringify(gameData));

                document.getElementById(`${this.varName}buyUpgrade`).innerHTML = `Upgrade ${this.upgradeCost}${gameData.currencySymbol}`;
                document.getElementById(`${this.varName}buyUpgrade`).setAttribute( "onClick", `javascript: ${this.varName}.upgrade();` );
                document.getElementById(`${this.varName}text`).innerHTML = `${this.name} (current level: ${this.level})`;
                document.getElementById(`${this.varName}mps`).innerHTML = `${this.moneyPerSecond}${gameData.currencySymbol} per second`;
            } else {
                alert("Not enough Money!");
            }
        }
        //property loop (with no manager) while also saving every second
        ticker = function() {
            if (this.purchased) {
                this.accumulatedMoney += this.moneyPerSecond;
                document.getElementById(`${this.varName}accumulated`).innerHTML = `Accumulated Money: ${this.accumulatedMoney}${gameData.currencySymbol}`;

                localStorage.setItem(`${this.name}level`, JSON.stringify(this.level));
                localStorage.setItem(`${this.name}moneyPerSecond`, JSON.stringify(this.moneyPerSecond));
                localStorage.setItem(`${this.name}upgradeCost`, JSON.stringify(this.upgradeCost));
                localStorage.setItem(`${this.name}accumulatedMoney`, JSON.stringify(this.accumulatedMoney));
                localStorage.setItem(`${this.name}purchased`, JSON.stringify(this.purchased));
            };
        }
        //function to upgrate property, for both with manager, and without manager
        upgrade = function() {
            if (this.manager && gameData.money >= this.upgradeCost && this.purchased) {
                gameData.money -= this.upgradeCost;
                this.level++;
                this.upgradeCost = this.upgradeCost * 2;
                gameData.moneyPerSecond -= this.moneyPerSecond;
                this.moneyPerSecond += (Math.ceil(this.moneyPerSecond * 0.1))
                gameData.moneyPerSecond += this.moneyPerSecond;

                localStorage.setItem(`${this.name}level`, JSON.stringify(this.level));
                localStorage.setItem(`${this.name}moneyPerSecond`, JSON.stringify(this.moneyPerSecond));
                localStorage.setItem(`${this.name}upgradeCost`, JSON.stringify(this.upgradeCost));
                localStorage.setItem(`${this.name}accumulatedMoney`, JSON.stringify(this.accumulatedMoney));
                localStorage.setItem(`idlejsSave`, JSON.stringify(gameData));

                document.getElementById(`${this.varName}buyUpgrade`).innerHTML = `Upgrade ${this.upgradeCost}${gameData.currencySymbol}`;
                document.getElementById(`${this.varName}text`).innerHTML = `${this.name} (current level: ${this.level})`;
                document.getElementById(`${this.varName}mps`).innerHTML = `${this.moneyPerSecond}${gameData.currencySymbol} per second`;
            }
            else if (this.purchased && gameData.money >= this.upgradeCost) {
                gameData.money -= this.upgradeCost;
                this.level++;
                this.upgradeCost = this.upgradeCost * 2;
                this.moneyPerSecond += (Math.ceil(this.moneyPerSecond * 0.1))

                localStorage.setItem(`${this.name}level`, JSON.stringify(this.level));
                localStorage.setItem(`${this.name}moneyPerSecond`, JSON.stringify(this.moneyPerSecond));
                localStorage.setItem(`${this.name}upgradeCost`, JSON.stringify(this.upgradeCost));
                localStorage.setItem(`${this.name}accumulatedMoney`, JSON.stringify(this.accumulatedMoney));
                localStorage.setItem(`idlejsSave`, JSON.stringify(gameData));
                
                if (gameData.moneyPerSecond === 0) {
                    document.getElementById("total_money").innerHTML = `Total Money: ${gameData.moneyPerSecond} ${gameData.currencySymbol}`;
                };
                document.getElementById(`${this.varName}buyUpgrade`).innerHTML = `Upgrade ${this.upgradeCost}${gameData.currencySymbol}`;
                document.getElementById(`${this.varName}text`).innerHTML = `${this.name} (current level: ${this.level})`;
                document.getElementById(`${this.varName}mps`).innerHTML = `${this.moneyPerSecond}${gameData.currencySymbol} per second`;
            } else {
                alert("Not enough Money!");
            }
        }
        //function to hire a manager
        hireManager = function() {
            if (this.manager === false && gameData.money >= this.managerCost) {
                clearTimeout(this.tickerVar);
                gameData.money -= this.managerCost;
                this.manager = true;
                gameData.money += this.accumulatedMoney;
                this.accumulatedMoney = 0;
                gameData.moneyPerSecond += this.moneyPerSecond;

                localStorage.setItem(`${this.name}manager`, JSON.stringify(this.manager));
                localStorage.setItem(`${this.name}moneyPerSecond`, JSON.stringify(this.moneyPerSecond));
                localStorage.setItem(`${this.name}accumulatedMoney`, JSON.stringify(this.accumulatedMoney));
                localStorage.setItem(`idlejsSave`, JSON.stringify(gameData));

                document.getElementById("total_money").innerHTML = `Total Money: ${gameData.moneyPerSecond} ${gameData.currencySymbol}`;
                document.getElementById(`${this.varName}accumulated`).innerHTML = `You have hired a Manager to do your bidding!`;
                document.getElementById(`${this.varName}hireManager`).innerHTML = `Manager Hired`;
                let collectButton = document.getElementById(`${this.varName}collectButton`);
                collectButton.remove();
            } else {
                alert("Not enough Money!");
            }
        }
        //function to collect the accumulated money
        collectMoney = function() {
            if (this.manager === false) {
                gameData.money += this.accumulatedMoney;
                this.accumulatedMoney = 0;
                localStorage.setItem(`idlejsSave`, JSON.stringify(gameData));
            };
        }
    }

    //function to delete the saved game
    library.deleteSave = function() {
        localStorage.clear();
        location.reload();
    }

    //function to save the game data
    library.save = function() {
        gameData.closedData = Date.now();
        localStorage.setItem(`idlejsSave`, JSON.stringify(gameData));
        alert("You have saved your game")
    }

    // Expose the public methods inside the library
    return library;
})();
idle.game();