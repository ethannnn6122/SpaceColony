var config = {
    type: Phaser.AUTO,
    width: 800,
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
    spaceBucks: 0
}

let energyText, oxygenText, foodText, mineralsText, crewMoraleText,
    insufficientText, spaceBucksText, timer, timerText, buildingNum;

const buildings = [
    { name: 'Solar Panel', cost: { energy: 50, minerals: 30 }, production: { energy: 15 } },
    { name: 'Oxygen Generator', cost: { energy: 70, minerals: 60 }, production: { oxygen: 10 } },
    { name: 'Mineral Extractor', cost: { energy: 15, minerals: 0 }, production: { minerals: 20 } }
]

let constructedBuildings = [];

function preload() {
    this.load.image('spaceStation', 'assets/spaceStation.jpeg');
}

function create() {
    this.add.image(400, 300, 'spaceStation');

    let graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 500, 800, 100);

    energyText = this.add.text(20, 520, 'Energy: ' + resources.energy, { fontSize: '16px', fill: '#ffffff' });
    oxygenText = this.add.text(20, 540, 'Oxygen: ' + resources.oxygen, { fontSize: '16px', fill: '#ffffff' });
    foodText = this.add.text(20, 560, 'Food: ' + resources.food, { fontSize: '16px', fill: '#ffffff' });
    mineralsText = this.add.text(135, 540, 'Minerals: ' + resources.minerals, { fontSize: '16px', fill: '#ffffff' });
    crewMoraleText = this.add.text(135, 560, 'Crew Morale: ' + resources.crewMorale, { fontSize: '16px', fill: '#ffffff' });
    spaceBucksText = this.add.text(135, 520, 'Space Bucks: $' + resources.spaceBucks, { fontSize: '16px', fill: '#ffffff' });

    // Building construction UI
    insufficientText = this.add.text(400, 300, 'Insufficient resources!', { fontSize: '32px', fill: '#ff0000'}).setOrigin(0.5).setAlpha(0)
        .setInteractive()
        .on('pointerdown', () => { insufficientText.setAlpha(0) });
    let buildingOneButton = this.add.text(570, 520, 'Build Solar Panel', {fontSize: '16px', fill: '#ffffff' })
        .setInteractive()
        .on('pointerdown', () => build(0));
    let buildingTwoButton = this.add.text(570, 540, 'Build Oxygen Generator', {fontSize: '16px', fill: '#ffffff' })
        .setInteractive()
        .on('pointerdown', () => build(1));
    let buildingThreeButton = this.add.text(570, 560, 'Build Mineral Extractor', {fontSize: '16px', fill: '#ffffff' })
        .setInteractive()
        .on('pointerdown', () => build(2));
    buildingNum = this.add.text(10, 10, 'Buildings: ' + constructedBuildings.length, {fontSize: '32px', fill: '#ffffff' });
    
    // Turn Base timer
    timer = this.time.addEvent({
        delay: 60000,
        callback: () => {
            nextTurn();
        },
        loop: true
    });
    timerText = this.add.text(10, 50, 'Time: 60', { fontSize: '32px', fill: '#ffffff' });
    this.time.addEvent({
        delay: 1000,
        callback: () => {
            let remainingTime = Math.ceil(timer.getRemainingSeconds());
            timerText.setText('Time: ' + remainingTime);
        },
        loop: true
    });
    let nextTurnButton = this.add.text(370, 560, 'Next Turn', { fontSize: '16px', fill: '#ffffff' })
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
}


function update() {
    energyText.setText('Energy: ' + resources.energy);
    oxygenText.setText('Oxygen: ' + resources.oxygen);
    foodText.setText('Food: ' + resources.food);
    mineralsText.setText('Minerals: ' + resources.minerals);
    crewMoraleText.setText('Crew Morale: ' + resources.crewMorale);
    spaceBucksText.setText('Space Bucks: $' + resources.spaceBucks);
    buildingNum.setText( 'Buildings: ' + constructedBuildings.length);
}

function produceResources() {
    // TODO: Implement logic for resource production
    // Money
    let val = constructedBuildings.length * 3
    if ( resources.minerals > 150 ) {
        resources.spaceBucks += 50;
    }

    // Building production
    for (let index = 0; index < constructedBuildings.length; index++) {
        const building = constructedBuildings[index];
        for (let resource in building.production) {
            resources[resource] += building.production[resource];
        }
    }
}

function consumeResources() {
    // TODO: Implement logic for people resource consumption

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

    // Ensure resources don't go below zero
    resources.energy = Math.max(0, resources.energy);
    resources.oxygen = Math.max(0, resources.oxygen);
    resources.food = Math.max(0, resources.food);
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
    if (resources.energy >= building.cost.energy && resources.minerals >= building.cost.minerals) {
        resources.energy -= building.cost.energy;
        resources.minerals -= building.cost.minerals;
        constructedBuildings.push(building);
        // Update UI
        update();
    } else {
        // Display message indicating insufficient resources
        insufficientText.setAlpha(1);
        console.log("not enough");
    }
}

function nextTurn() {
    produceResources();
    consumeResources();
    randomEvent();
}