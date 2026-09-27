import Phaser from 'phaser';
import { economy, HOUSE_LEVELS } from '../systems/EconomyManager';
import { saveManager } from '../systems/SaveManager';

const SKY_COLOR = 0x87ceeb;
const GROUND_COLOR = 0x6ab04c;
const GROUND_LINE_COLOR = 0x4a8a2c;
const HOUSE_COLOR = 0xd9a066;
const HOUSE_ROOF_COLOR = 0xb04a2f;
const HOUSE_WINDOW_COLOR = 0xfff4a3;
const SHOP_COLOR = 0xe07a5f;
const SHOP_ROOF_COLOR = 0xa03e2e;
const SHOP_WINDOW_COLOR = 0xfff4a3;

const BUTTON_COLOR = 0xffc93c;
const BUTTON_OUTLINE = 0xd99400;
const UPGRADE_BG_COLOR = 0x2a4a8a;

const GROUND_Y = 480;
const FLOOR_HEIGHT = 32;
const HOUSE_WIDTH = 90;
const ROOF_HEIGHT = 44;
const SHOP_WIDTH = 160;
const SHOP_HEIGHT = 110;

const TAP_X = 640;
const TAP_Y = 645;
const TAP_RADIUS = 80;

const UPGRADE_BTN_Y = 500;
const UPGRADE_BTN_WIDTH = 120;
const UPGRADE_BTN_HEIGHT = 46;

const HOUSE_X_POSITIONS = [350, 510, 670];
const SHOP_X = 890;

export class GameScene extends Phaser.Scene {
  private houseContainers: Phaser.GameObjects.Container[] = [];
  private houseLevelsShown: number[] = [-1, -1, -1];
  private houseUpgradeCostTexts: Phaser.GameObjects.Text[] = [];
  private houseUpgradeLevelTexts: Phaser.GameObjects.Text[] = [];

  private shopUpgradeCostText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, GROUND_Y / 2, W, GROUND_Y, SKY_COLOR).setDepth(0);
    this.add.rectangle(W / 2, GROUND_Y + (H - GROUND_Y) / 2, W, H - GROUND_Y, GROUND_COLOR).setDepth(1);
    this.add.rectangle(W / 2, GROUND_Y, W, 4, GROUND_LINE_COLOR).setDepth(2);

    for (let i = 0; i < 3; i++) {
      const x = HOUSE_X_POSITIONS[i];
      const level = economy.getHouseLevel(i);
      this.houseContainers[i] = this.drawHouse(x, GROUND_Y, level);
      this.houseLevelsShown[i] = level;
      this.createHouseUpgradeButton(i, x);
    }

    this.createShop(SHOP_X, GROUND_Y);
    this.createShopUpgradeButton(SHOP_X);

    this.createTapButton();

    this.scene.launch('UIScene');
  }

  update(_time: number, delta: number) {
    economy.tick(delta);

    for (let i = 0; i < 3; i++) {
      const currentLevel = economy.getHouseLevel(i);
      if (currentLevel !== this.houseLevelsShown[i]) {
        this.houseContainers[i].destroy();
        this.houseContainers[i] = this.drawHouse(HOUSE_X_POSITIONS[i], GROUND_Y, currentLevel);
        this.houseLevelsShown[i] = currentLevel;

        this.tweens.add({
          targets: this.houseContainers[i],
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 120,
          yoyo: true,
        });
      }
    }

    this.refreshUpgradeLabels();
  }

  drawHouse(x: number, groundY: number, level: number): Phaser.GameObjects.Container {
    const data = HOUSE_LEVELS[level];
    const floors = data.floors;
    const bodyHeight = floors * FLOOR_HEIGHT;

    const container = this.add.container(x, groundY).setDepth(10);

    const body = this.add.rectangle(0, -bodyHeight / 2, HOUSE_WIDTH, bodyHeight, HOUSE_COLOR);

    const roofWidth = HOUSE_WIDTH + 16;
    const roof = this.add.graphics();
    roof.fillStyle(HOUSE_ROOF_COLOR, 1);
    roof.beginPath();
    roof.moveTo(-roofWidth / 2, -bodyHeight);
    roof.lineTo(roofWidth / 2, -bodyHeight);
    roof.lineTo(0, -bodyHeight - ROOF_HEIGHT);
    roof.closePath();
    roof.fillPath();

    const parts: Phaser.GameObjects.GameObject[] = [body, roof];

    const windowSize = 14;
    const windowGap = 6;
    const windowsPerFloor = 2;
    const totalWindowsWidth = windowsPerFloor * windowSize + (windowsPerFloor - 1) * windowGap;
    const firstWindowX = -totalWindowsWidth / 2 + windowSize / 2;

    for (let floor = 0; floor < floors; floor++) {
      const y = -bodyHeight + FLOOR_HEIGHT / 2 + floor * FLOOR_HEIGHT;

      if (floor === 0 && level > 0) {
        const door = this.add.rectangle(0, -18, 22, 36, HOUSE_ROOF_COLOR);
        parts.push(door);
      }

      for (let w = 0; w < windowsPerFloor; w++) {
        if (floor === 0 && w === 0 && level > 0) continue;
        const wx = firstWindowX + w * (windowSize + windowGap);
        const win = this.add.rectangle(wx, y, windowSize, windowSize, HOUSE_WINDOW_COLOR);
        parts.push(win);
      }
    }

    container.add(parts);
    return container;
  }

  createHouseUpgradeButton(index: number, x: number) {
    const bg = this.add.rectangle(x, UPGRADE_BTN_Y, UPGRADE_BTN_WIDTH, UPGRADE_BTN_HEIGHT, UPGRADE_BG_COLOR)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(40);

    const levelText = this.add.text(x, UPGRADE_BTN_Y - 10, 'Домик', {
      fontSize: '12px',
      color: '#c8d8ff',
    }).setOrigin(0.5).setDepth(41);

    const costText = this.add.text(x, UPGRADE_BTN_Y + 11, '$0', {
      fontSize: '17px',
      color: '#ffd93c',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(41);

    this.houseUpgradeLevelTexts[index] = levelText;
    this.houseUpgradeCostTexts[index] = costText;

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerdown', () => {
      const ok = economy.buyHouseUpgrade(index);
      if (ok) {
        saveManager.save();
        this.tweens.add({
          targets: bg,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
          yoyo: true,
        });
      } else {
        const startX = bg.x;
        this.tweens.add({
          targets: bg,
          x: startX + 8,
          duration: 50,
          yoyo: true,
          repeat: 3,
          onComplete: () => { bg.x = startX; },
        });
      }
    });
  }

  createShopUpgradeButton(x: number) {
    const bg = this.add.rectangle(x, UPGRADE_BTN_Y, UPGRADE_BTN_WIDTH, UPGRADE_BTN_HEIGHT, UPGRADE_BG_COLOR)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(40);

    const title = this.add.text(x, UPGRADE_BTN_Y - 10, 'МАГАЗИН', {
      fontSize: '12px',
      color: '#c8d8ff',
    }).setOrigin(0.5).setDepth(41);

    this.shopUpgradeCostText = this.add.text(x, UPGRADE_BTN_Y + 11, '$0', {
      fontSize: '17px',
      color: '#ffd93c',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(41);

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerdown', () => {
      const ok = economy.buyShopUpgrade();
      if (ok) {
        saveManager.save();
        this.tweens.add({
          targets: bg,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
          yoyo: true,
        });
      } else {
        const startX = bg.x;
        this.tweens.add({
          targets: bg,
          x: startX + 8,
          duration: 50,
          yoyo: true,
          repeat: 3,
          onComplete: () => { bg.x = startX; },
        });
      }
    });
  }

  refreshUpgradeLabels() {
    for (let i = 0; i < 3; i++) {
      const level = economy.getHouseLevel(i);
      const canUpgrade = economy.canUpgradeHouse(i);

      if (canUpgrade) {
        this.houseUpgradeCostTexts[i].setText(`$${economy.getHouseUpgradeCost(i)}`);
      } else {
        this.houseUpgradeCostTexts[i].setText('MAX');
      }

      this.houseUpgradeLevelTexts[i].setText(HOUSE_LEVELS[level].name);
    }

    this.shopUpgradeCostText.setText(`$${economy.getShopUpgradeCost()}`);
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

  createTapButton() {
    const outer = this.add.circle(TAP_X, TAP_Y, TAP_RADIUS, BUTTON_OUTLINE).setDepth(50);
    const inner = this.add.circle(TAP_X, TAP_Y, TAP_RADIUS - 8, BUTTON_COLOR).setDepth(51);

    const label = this.add.text(TAP_X, TAP_Y, 'TAP', {
      fontSize: '38px',
      color: '#8a5800',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    inner.setInteractive({ useHandCursor: true });

    inner.on('pointerdown', () => {
      economy.addMoney(economy.getMoneyPerClick());
      this.spawnFloatingText(TAP_X, TAP_Y - TAP_RADIUS, `+$${economy.getMoneyPerClick()}`);
      this.tweens.add({
        targets: [outer, inner, label],
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 70,
        yoyo: true,
      });
    });
  }

  spawnFloatingText(x: number, y: number, value: string) {
    const text = this.add.text(x, y, value, {
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }
}