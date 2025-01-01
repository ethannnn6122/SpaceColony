var config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

let resources = {
    energy: 100,
    oxygen: 80,
    food: 50,
    minerals: 200,
    crewMorale: 75,
    spaceBucks: 1000
}

let population = 5;

let energyText, oxygenText, foodText, mineralsText, crewMoraleText,
    spaceBucksText, timer, timerText, buildingNum, popText, dayCount,
    gameOverTxt, restartBtn, popupContainer, popupText, closeButton;

const buildings = [
    { name: 'Solar Panel', cost: { energy: 0, spaceBucks: 30 }, production: { energy: 15 } },
    { name: 'Oxygen Generator', cost: { energy: 20, spaceBucks: 60 }, production: { oxygen: 12 } },
    { name: 'Mineral Extractor', cost: { energy: 30, spaceBucks: 80 }, production: { minerals: 30 } }
]

let constructedBuildings = [];

function preload() {
    this.load.image('spaceStation', 'assets/spaceStation.jpeg');
}

function create() {
    this.add.image(450, 300, 'spaceStation');

    let graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 500, 800, 100);

    graphics.fillStyle(0x000000, 0.8);
    graphics.fillRect(50, 10, 110, 80);
    
    popText = this.add.text(700, 20, 'Population: ' + population, { fontSize: '20px', fill: '#ffffff' })
    energyText = this.add.text(20, 520, 'Energy: ' + resources.energy, { fontSize: '16px', fill: '#ffffff' });
    oxygenText = this.add.text(20, 540, 'Oxygen: ' + resources.oxygen, { fontSize: '16px', fill: '#ffffff' });
    foodText = this.add.text(20, 560, 'Food: ' + resources.food, { fontSize: '16px', fill: '#ffffff' });
    mineralsText = this.add.text(140, 540, 'Minerals: ' + resources.minerals, { fontSize: '16px', fill: '#ffffff' });
    crewMoraleText = this.add.text(140, 560, 'Crew Morale: ' + resources.crewMorale, { fontSize: '16px', fill: '#ffffff' });
    spaceBucksText = this.add.text(140, 520, 'Space Bucks: $' + resources.spaceBucks.toFixed(2), { fontSize: '16px', fill: '#ffffff' });

    // Building construction UI
    let buildingOneButton = this.add.text(570, 520, 'Build Solar Panel: $' + buildings[0].cost.spaceBucks, {fontSize: '16px', fill: '#ffffff' })
        .setInteractive()
        .on('pointerdown', () => build(0));
    let buildingTwoButton = this.add.text(570, 540, 'Build Oxygen Generator: $' + buildings[1].cost.spaceBucks, {fontSize: '16px', fill: '#ffffff' })
        .setInteractive()
        .on('pointerdown', () => build(1));
    let buildingThreeButton = this.add.text(570, 560, 'Build Mineral Extractor: $' + buildings[2].cost.spaceBucks, {fontSize: '16px', fill: '#ffffff' })
        .setInteractive()
        .on('pointerdown', () => build(2));
    buildingNum = this.add.text(10, 10, 'Buildings: ' + constructedBuildings.length, {fontSize: '20px', fill: '#ffffff' });
    
    // Turn Base timer
    timer = this.time.addEvent({
        delay: 60000,
        callback: () => {
            nextTurn();
        },
        loop: true
    });
    dayCount = 1;
    timerText = this.add.text(10, 50, 'Day: ' + dayCount +': 60', { fontSize: '20px', fill: '#ffffff' });
    this.time.addEvent({
        delay: 1000,
        callback: () => {
            let remainingTime = Math.ceil(timer.getRemainingSeconds());
            timerText.setText('Day: ' + dayCount + ' (' + remainingTime + ')');
        },
        loop: true
    });
    let nextTurnButton = this.add.text(370, 560, 'Next Turn', { fontSize: '20px', fill: '#ffffff' })
        .setInteractive()
        .on('pointerdown', () => {
            nextTurn();
            timer.remove();
            timer = this.time.addEvent({
                delay: 60000,
                callback: () => {
                    nextTurn();
                },
                loop: true
            });
        });
    // Popup window
    popupContainer = this.add.container(450, 300);

    // Add a background rectangle
    let popupBackground = this.add.rectangle(0, 0, 500, 200, 0x000000, 0.8).setOrigin(0.5);
    popupContainer.add(popupBackground);

    // Add a text element for the message
    popupText = this.add.text(0, 0, '', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
    popupContainer.add(popupText);

    // Add a close button
    closeButton = this.add.text(200, 80, 'Close', { fontSize: '16px', fill: '#ffffff' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            popupContainer.setVisible(false);
        });
    popupContainer.add(closeButton);
    // Add restart button
    restartBtn = this.add.text(0, 85, 'Restart', { fontSize: '32px', fill: '#ff0000' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            // reset
            reset();
            // Restart the scene
            this.scene.restart();
        })
    popupContainer.add(restartBtn);
    // Hide the popup initially
    popupContainer.setVisible(false);
    // Add a button to purchase food
    let buyFoodBtn = this.add.text(370, 520, 'Buy Food ($10)', { fontSize: '16px', fill: '#ffffff'})
        .setInteractive()
        .on('pointerdown', () => {
            if (resources.spaceBucks >= 10 ) {
                resources.spaceBucks -= 10;
                resources.food += 20;
            } else {
                showPopup("Not enough Space Bucks!", true);
            }
        });
}

function update() {
    energyText.setText('Energy: ' + resources.energy);
    oxygenText.setText('Oxygen: ' + resources.oxygen);
    foodText.setText('Food: ' + resources.food);
    mineralsText.setText('Minerals: ' + resources.minerals);
    crewMoraleText.setText('Crew Morale: ' + resources.crewMorale);
    spaceBucksText.setText('Space Bucks: $' + resources.spaceBucks.toFixed(2));
    buildingNum.setText( 'Buildings: ' + constructedBuildings.length);
}

function resourcePenalty(val) {
    resources.spaceBucks += val;
}

function produceResources() {
    // Logic for resource production
    // Money
    let val = resources.minerals / 10;
    if ( resources.minerals != 0 ) {
        resources.spaceBucks += val;
    } else {
        // pass penalty to resourcePenalty()
        let penalty = population - resources.energy + resources.crewMorale;
        resourcePenalty(penalty);
        console.log(penalty);
    }

    // Building production
    for (let index = 0; index < constructedBuildings.length; index++) {
        const building = constructedBuildings[index];
        for (let resource in building.production) {
            resources[resource] += building.production[resource];
        }
    }

    console.log('Space Bucks: +' + val);
}

function consumeResources() {
    // TODO: Implement logic for people resource consumption

    // Consumption based on population
    resources.food -= population * 2;
    resources.oxygen -= population * 1.5;
    resources.minerals -= resources.minerals / 10;

    if (resources.food < population * 2) {
        resources.crewMorale -= 15;
    }
        
    // Consumption based on constructed buildings
    for (let i = 0; i < constructedBuildings.length; i++) {
        const building = constructedBuildings[i];

        // Solar Panels
        if (building.name === 'Solar Panel') {
            resources.oxygen -= 1;
        }

        // Oxygen Generators
        if (building.name === 'Oxygen Generator') {
            resources.energy -= 8;
            resources.minerals -= 7;
        }

        // Mining Extractors 
        if (building.name === 'Mining Extractor') {
            resources.energy -= 10;
            resources.oxygen -= 3;
        }
    }

    // Check if food is at zero
    if (resources.food <= 0) {
        // if at zero remain at zero and warn player 
        resources.food = 0;
        showPopup('Food supply critical!', true, false);
        console.warn("Food supply critical!");
    }
    if (resources.energy <= 0) {
        resources.energy = 0;
        showPopup('Energy is at zero!', true, false);
        console.warn('Energy is at zero!');
    }
}

function handlePopulation() {
    // Population growth (adjust growth rate as needed)
    if (resources.food >= population * 5 && resources.crewMorale > 50) { // Enough food and good morale
        population += Math.floor(population * 0.5); // Increase population by 10%
    } else if (resources.food < population * 2 || resources.energy == 0) { // Not enough food
        population = Math.max(0, population - Math.floor(population * 0.2)); // Decrease population by 20%
    }

    // Update population text
    popText.setText('Population: ' + population);
}

function randomEvent() {
    let event = Math.random();
    if (event < 0.2) {
        resources.energy -= 30;
        console.log('Power Blip -30 energy!');
        // TODO: Add more events
    }
}

function build(buildingIndex) {
    const building = buildings[buildingIndex];
    const maxBuildings = Math.floor(population / 2);

    if (constructedBuildings.length < maxBuildings) {
        if (resources.energy >= building.cost.energy && resources.spaceBucks >= building.cost.spaceBucks) {
            resources.energy -= building.cost.energy;
            resources.spaceBucks -= building.cost.spaceBucks;
            constructedBuildings.push(building);
            showPopup( buildings[buildingIndex].name  + ' Built!', true, false);
            // Update UI
            update();
        } else {
            // Display message indicating insufficient resources
            // insufficientText.setAlpha(1);
            showPopup('Insufficent Resources!', true);
            console.log("not enough");
        }
    } else {
        // Reached build limit
        showPopup('Build limit reached!', true, false);
        console.warn('Build limit reached!');
    }
}

function reset() {
    resources = {
        energy: 100,
        oxygen: 80,
        food: 50,
        minerals: 200,
        crewMorale: 75,
        spaceBucks: 0
    }
    population = 5;
    constructedBuildings = [];
}

function showPopup(message, visible, restart) {
    popupText.setText(message);
    closeButton.setVisible(visible);
    restartBtn.setVisible(restart);
    popupContainer.setVisible(true);
}

function nextTurn() {
    produceResources();
    consumeResources();
    handlePopulation();
    randomEvent();
    dayCount += 1;

    // Check for lose conditions
    if ( resources.oxygen <= 0 || resources.crewMorale <= 0 || population <= 0 ) {
        timer.remove();
        showPopup('Game Over!', false, true);
        console.clear();
    }
}