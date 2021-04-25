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

let clockText;
let map;
let selectedTile;
let marker; 
let qKey;
let bKey;
let controls;
let shiftKey;

let curBuild;
let test;

function create() {
    const graphics = this.add.graphics();

    // Make lower half of map "ground"
    const groundRect = new Phaser.Geom.Rectangle(0, 400, 800, 400);
    graphics.fillStyle(0x662822);
    graphics.fillRectShape(groundRect);

    // Initialize text label of clock
    clockText = this.add.bitmapText(10, 20, 'carrier_command','',32);
    
    // Initialize text labeling of current tile
    const menuText = this.add.bitmapText(600, 40, 'carrier_command','curbuild:',16);

    // Initialize map
    map = this.make.tilemap({ key: 'map' });

    var tiles = map.addTilesetImage('Desert', 'tiles');
    var layer1 = map.createLayer('Ground', tiles, 0, 400 - Map.tileWidth);
    var layer2 = map.createBlankLayer('Overlay', tiles, 0, 400 - Map.tileWidth);

    // Initialize map selector
    selectedTile = map.getTileAt(2, 3);

    marker = this.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

    // Enable scrolling, but don't scroll off the map
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    var cursors = this.input.keyboard.createCursorKeys();
    var controlConfig = {
        camera: this.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        speed: 0.5
    };

    // Initialize some keys
    controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

    // Create 'animation' for 'current build item' 
    this.anims.create({
            key: 'curBuild',
            frames: this.anims.generateFrameNumbers('tiles_sprite', { frames: [ 8 ] }),
        });

    curBuild = this.add.sprite(700, 100);

    curBuild.setScale(4);
    curBuild.play('curBuild');
    curBuild.setInteractive();

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

    if (this.input.manager.activePointer.isDown && pointerTileY >= 0) {
        const tile = map.getTileAtWorldXY(worldPoint.x, worldPoint.y);
        if (qKey.isDown) {
            map.putTileAt(17, pointerTileX, pointerTileY, 'Overlay');
        }
    }

    // Change tile on key press.
    this.input.on('pointerdown', (pointer, objectsClicked) => {console.log(objectsClicked[0].setFrame(2));});

    // Download file
    if (bKey.isDown) {
        console.log(map.layers[0].data.reduce((acc, x) =>  acc + "," + x.map(x => x.index), []));
        curBuild.setFrame(1);
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
    clockText.text = curDate.toLocaleString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric'});
}