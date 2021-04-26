import * as Map from './map.js'

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    pixelArt: true,
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('tiles', 'res/mars_spacing.png');
    this.load.spritesheet('tiles_sprite', 'res/mars_spacing.png', 
        {frameWidth: 16, frameHeight: 16, margin: 1, spacing: 1})

    this.load.tilemapTiledJSON('map', 'res/mars.json');

    this.load.bitmapFont('carrier_command',
        'https://labs.phaser.io/assets/fonts/bitmap/carrier_command.png',
        'https://labs.phaser.io/assets/fonts/bitmap/carrier_command.xml');
}

// TODO
//
// Figure out better place for all these variables.
// They're often used in-between create() and update().
// Maybe some can be replaced with accessing the Phaser object,
// or maybe I should put some in my own object and pass it around.

let clockText;
let map;
let selectedTile;
let marker; 
let qKey;
let bKey;
let sKey;
let dKey;
let controls;
let shiftKey;
let curBuild;
let test;

// Text objects for "menu" 
let water;
let energy;
let foilage;
let metal;
let silicon;

// TODO
// 
// Figure out better place to store game state variables

const curResources = {
    water: 2, 
    energy: 2, 
    foilage: 2,
    metal: 2,
    silicon: 2,
}

const maxResources = {
    water: 10,
    energy: 10,
    foilage: 10,
    metal: 10,
    silicon: 10,
}

// done by Building Code
const buildingCount = {}

let currentBuild = 9;

const miningTiles = new Set();


function initInterface(parent) {
    // Initialize text label of clock
    clockText = parent.add.bitmapText(10.5, 20.5, 'carrier_command','',32);
    
    // Initialize text labeling of current tile
    const menuText = parent.add.bitmapText(600.5, 40.5, 'carrier_command','curbuild:',16);

    water = parent.add.bitmapText(600.5, 140.5 + 20 * 0, 'carrier_command','water',10);
    energy = parent.add.bitmapText(600.5, 140.5 + 20 * 1, 'carrier_command','energy',10);
    foilage = parent.add.bitmapText(600.5, 140.5 + 20 * 2, 'carrier_command','foilage',10);
    metal = parent.add.bitmapText(600.5, 140.5 + 20 * 3, 'carrier_command','metal',10);
    silicon = parent.add.bitmapText(600.5, 140.5 + 20 * 4, 'carrier_command','silicon',10);

    // Create 'animation' for 'current build item' 
    parent.anims.create({
            key: 'curBuild',
            frames: parent.anims.generateFrameNumbers('tiles_sprite', { frames: [ currentBuild - 1 ] }),
        });

    curBuild = parent.add.sprite(700, 80);

    curBuild.setScale(4);
    curBuild.play('curBuild');
    curBuild.setInteractive();
}

function initMap(parent) {
    // Initialize map
    map = parent.make.tilemap({ key: 'map' });

    var tiles = map.addTilesetImage('Desert', 'tiles');
    var layer1 = map.createLayer('Ground', tiles, 0, 400 - Map.tileWidth);
    var layer2 = map.createBlankLayer('Overlay', tiles, 0, 400 - Map.tileWidth);

    // Initialize map selector
    selectedTile = map.getTileAt(2, 3);

    marker = parent.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

    // Enable scrolling, but don't scroll off the map
    parent.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    var cursors = parent.input.keyboard.createCursorKeys();
    var controlConfig = {
        camera: parent.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        speed: 0.5
    };
    controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);
}

function create() {
    const graphics = this.add.graphics();

    // Make lower half of map "ground"
    const groundRect = new Phaser.Geom.Rectangle(0, 400, 800, 400);
    graphics.fillStyle(0x662822);
    graphics.fillRectShape(groundRect);

    initInterface(this);

    initMap(this);

    // Initialize some keys
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Initialize building count
    Object.values(Map.buildingCodes).forEach((x) => {
        buildingCount[x] = 0;
    });

    // Change "current build tile" on key press.
    this.input.on('pointerdown', (pointer, objectsClicked) => {
        if (objectsClicked.length > 0) {
        //     console.log(objectsClicked[0].setFrame(2));
            const tileArray = Object.values(Map.buildingCodes).sort((a, b) => a - b);

            let curIndex = tileArray.findIndex(x => x == currentBuild);
            curIndex++;
            if (curIndex >= tileArray.length) {
                curIndex = 0;
            }

            currentBuild = tileArray[curIndex];
            objectsClicked[0].setFrame(currentBuild - 1);
        }

    });
}

function update(time, delta) {
    // Update key presses
    controls.update(delta);

    // Figure out current tile coordinates
    var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
    var pointerTileX = map.worldToTileX(worldPoint.x);
    var pointerTileY = map.worldToTileY(worldPoint.y);

    // Align marker coordinates to tile grid
    marker.x = map.tileToWorldX(pointerTileX);
    marker.y = map.tileToWorldY(pointerTileY);

    if (pointerTileY < 0) {
        marker.y = -100;
    }
    if (this.input.manager.activePointer.isDown && pointerTileY >= 0) {
        // getTile's layer input is broken, must set layer manually
        map.setLayer(1);
        const tile = map.getTileAtWorldXY(worldPoint.x, worldPoint.y);
        map.setLayer(0);
        const groundTile = map.getTileAtWorldXY(worldPoint.x, worldPoint.y);
        if (qKey.isDown) {
            if ((tile == null || tile.index <= 0) && (groundTile == null || groundTile.index <= 0)) {
                // We are building.

                // check if we have enough resources
                let canBuild = true;
                for (let type in Map.buildingCost[currentBuild]) {
                    if (curResources[type] < Map.buildingCost[currentBuild][type]) {
                        canBuild = false;
                        break;
                    }
                }

                if (canBuild) {
                    map.putTileAt(currentBuild, pointerTileX, pointerTileY, 'Overlay');
                    buildingCount[currentBuild]++;

                    for (let type in Map.buildingCost[currentBuild]) {
                        curResources[type] -= Map.buildingCost[currentBuild][type];
                    }
                }
            }
        }

        if (dKey.isDown) {
            // check if ground exists

            map.setLayer(0);
            const groundTile = map.getTileAt(pointerTileX, pointerTileY);


            if (groundTile) {
                map.setLayer(1);
                map.putTileAt(Map.effectCodes.MINING_FOCUS, pointerTileX, pointerTileY);
                const mineTile = map.getTileAtWorldXY(worldPoint.x, worldPoint.y);
                mineTile.timeExpire = Map.MINING_RATE;
                miningTiles.add(mineTile);
            }
        }

        if (sKey.isDown) {
            map.setLayer(1);
            const mineTile = map.getTileAtWorldXY(worldPoint.x, worldPoint.y);
            if (mineTile) {
                console.log(mineTile.timeExpire);
            }
        }
    }

    // Go through mining tiles and update them 
    miningTiles.forEach((tile) => {
        tile.timeExpire -= delta;
        const x = tile.x;
        const y = tile.y;

        // Add resources based on tile index
        map.setLayer(0);
        const groundTile = map.getTileAt(x, y);

        let resource;
        switch(groundTile.index) {
            case Map.tileCodes.WATER:
                resource = 'water';
                break;
            case Map.tileCodes.SILICON:
                resource = 'silicon';
                break;
            case Map.tileCodes.METAL: 
                resource = 'metal';
                break;
            case Map.tileCodes.DIRT:
            default:
                break;
        }

        if (resource) {
            if (curResources[resource] < maxResources[resource]) {
                curResources[resource] += delta / 1000;
            }
        }

        if (tile.timeExpire < 0) {
            // remove both this tile and the other
            miningTiles.delete(tile);

            map.setLayer(0);
            map.removeTileAt(x, y);
            map.setLayer(1);
            map.removeTileAt(x, y);
        }
    });

    // Update resources based on buildings
    // TODO
    // need way to keep track of "disabled" buildings (that don't have enough resources)
    for (let resource in curResources) {
        if (curResources[resource] < maxResources[resource]) {
                for (let building in buildingCount) {
                if (Map.buildingResourceGain[building][resource] && 
                    Map.buildingResourceGain[building][resource] > 0) {
                    curResources[resource] += Map.buildingResourceGain[building][resource] *
                        (buildingCount[building] ?? 0) * delta / 1000;

                }
            }
        }

        if (curResources[resource] > 0) {
            for (let building in buildingCount) {
                if (Map.buildingResourceUse[building][resource] && 
                    Map.buildingResourceUse[building][resource] > 0) {
                    curResources[resource] -= Map.buildingResourceUse[building][resource] *
                        (buildingCount[building] ?? 0) * delta / 1000;
                }
            }
        }

        if (curResources[resource] < 0) {
            curResources[resource] = 0;
        }
    }
    
    // Download file
    if (bKey.isDown) {
        // console.log(map.layers[0].data.reduce((acc, x) =>  acc + "," + x.map(x => x.index), []));
        // curBuild.setFrame(1);
        // console.log(this == game.scene.scenes[0]);
        // console.log(this);
    }

    // Calculate "day / night" color
    this.sky = new Phaser.Display.Color(150, 100, 80);
    this.space = new Phaser.Display.Color(40, 20, 20);

    // 30s days
    const dayPercent = (time / 30000) % 1;
    const t = Math.cos(dayPercent * 2 * Math.PI) + 1;

    const hexColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        this.sky,
        this.space,2, t);

    this.cameras.main.setBackgroundColor(hexColor)

    // 0 is 4pm; add 1/3 to change it
    const curDate = new Date((dayPercent + 1/3) * 60 * 60 * 24 * 1000);
    // clockText.text = curDate.toLocaleString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric'});

    const pad = (x) => Math.floor(x).toString().padStart(3);
    water.text = pad(curResources.water) + '/' + pad(maxResources.water) + ' water';
    energy.text = pad(curResources.energy) + '/' + pad(maxResources.energy) + ' energy';
    foilage.text = pad(curResources.foilage) + '/' + pad(maxResources.foilage) + ' foilage';
    metal.text = pad(curResources.metal) + '/' + pad(maxResources.metal) + ' metal';
    silicon.text = pad(curResources.silicon) + '/' + pad(maxResources.silicon) + ' silicon';
}