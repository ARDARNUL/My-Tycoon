import Phaser from 'phaser';

const SKY_COLOR = 0x87ceeb;
const GROUND_COLOR = 0x6ab04c;
const GROUND_LINE_COLOR = 0x4a8a2c;
const HOUSE_COLOR = 0xd9a066;
const HOUSE_ROOF_COLOR = 0xb04a2f;
const HOUSE_WINDOW_COLOR = 0xfff4a3;
const SHOP_COLOR = 0xe07a5f;
const SHOP_ROOF_COLOR = 0xa03e2e;
const SHOP_WINDOW_COLOR = 0xfff4a3;

const GROUND_Y = 480;
const HOUSE_WIDTH = 140;
const HOUSE_HEIGHT = 120;
const ROOF_HEIGHT = 60;
const SHOP_WIDTH = 160;
const SHOP_HEIGHT = 110;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, GROUND_Y / 2, W, GROUND_Y, SKY_COLOR).setDepth(0);

    this.add.rectangle(W / 2, GROUND_Y + (H - GROUND_Y) / 2, W, H - GROUND_Y, GROUND_COLOR).setDepth(1);
    this.add.rectangle(W / 2, GROUND_Y, W, 4, GROUND_LINE_COLOR).setDepth(2);

    this.createHouse(400, GROUND_Y);
    this.createHouse(640, GROUND_Y);
    this.createHouse(880, GROUND_Y);

    this.createShop(140, GROUND_Y);
  }

  createHouse(x: number, groundY: number) {
    const container = this.add.container(x, groundY).setDepth(10);

    const body = this.add.rectangle(0, -HOUSE_HEIGHT / 2, HOUSE_WIDTH, HOUSE_HEIGHT, HOUSE_COLOR);

    const roofWidth = HOUSE_WIDTH + 20;
    const roof = this.add.polygon(
      0, -HOUSE_HEIGHT,
      [
        -roofWidth / 2, 0,
        roofWidth / 2, 0,
        0, -ROOF_HEIGHT,
      ],
      HOUSE_ROOF_COLOR
    );

    const window1 = this.add.rectangle(-35, -HOUSE_HEIGHT / 2, 28, 28, HOUSE_WINDOW_COLOR);
    const window2 = this.add.rectangle(35, -HOUSE_HEIGHT / 2, 28, 28, HOUSE_WINDOW_COLOR);
    const door = this.add.rectangle(0, -22, 30, 44, HOUSE_ROOF_COLOR);

    container.add([body, roof, window1, window2, door]);
  }

  createShop(x: number, groundY: number) {
    const container = this.add.container(x, groundY).setDepth(20);

    const body = this.add.rectangle(0, -SHOP_HEIGHT / 2, SHOP_WIDTH, SHOP_HEIGHT, SHOP_COLOR);
    const roof = this.add.rectangle(0, -SHOP_HEIGHT - 15, SHOP_WIDTH + 20, 30, SHOP_ROOF_COLOR);
    const window1 = this.add.rectangle(-45, -SHOP_HEIGHT / 2, 36, 36, SHOP_WINDOW_COLOR);
    const window2 = this.add.rectangle(45, -SHOP_HEIGHT / 2, 36, 36, SHOP_WINDOW_COLOR);

    const sign = this.add.text(0, -SHOP_HEIGHT - 15, 'SHOP', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([body, roof, window1, window2, sign]);
  }
} 