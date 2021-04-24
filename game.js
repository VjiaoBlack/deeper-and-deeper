const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

const TILE_WIDTH = 12;
const TILE_GAP = 4;
const TILE_SPACE = TILE_WIDTH + TILE_GAP;

function preload() {
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');

    this.load.bitmapFont('carrier_command', 'assets/fonts/bitmap/carrier_command.png', 'assets/fonts/bitmap/carrier_command.xml');

}
let clockText;
function create() {
    const graphics = this.add.graphics();

    const groundRect = new Phaser.Geom.Rectangle(0, 400, 800, 400);
    graphics.fillStyle(0x100505);
    graphics.fillRectShape(groundRect);

    // Draw some placeholder tiles
    graphics.lineStyle(1, 0xaa0000, 1);
    for (let i = 0; i < 40; i++) {
        for (let j = 0; j < 10; j++) {
            const a = new Phaser.Geom.Rectangle(
                10.5 + i * (TILE_SPACE),
                410.5 + j * (TILE_SPACE), TILE_WIDTH, TILE_WIDTH);
            graphics.strokeRectShape(a);
        }
    }
   
    clockText = this.add.bitmapText(10, 20, 'carrier_command','',32);
}


function update() {
    this.sky = new Phaser.Display.Color(150, 100, 80);
    this.space = new Phaser.Display.Color(40, 20, 20);

    // 300s days
    const dayPercent = (this.time.now / 300000) % 1;
    const t = Math.cos(dayPercent * 2 * Math.PI) + 1;

    const hexColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        this.sky,
        this.space,2, t);

    this.cameras.main.setBackgroundColor(hexColor)

    // 0 is 4pm; add 1/3 to change it
    const time = new Date((dayPercent + 1/3) * 60 * 60 * 24 * 1000);
    clockText.text = time.toLocaleString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric'});
}