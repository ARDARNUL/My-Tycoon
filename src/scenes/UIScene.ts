import Phaser from 'phaser';
import { economy } from '../systems/EconomyManager';
import { saveManager } from '../systems/SaveManager';

const PANEL_X = 20;
const PANEL_Y = 160;
const CARD_WIDTH = 200;
const CARD_HEIGHT = 76;
const AUTOSAVE_INTERVAL_MS = 5000;

export class UIScene extends Phaser.Scene {
  private moneyText!: Phaser.GameObjects.Text;
  private clickText!: Phaser.GameObjects.Text;
  private perSecText!: Phaser.GameObjects.Text;

  private clickCostText!: Phaser.GameObjects.Text;
  private clickLevelText!: Phaser.GameObjects.Text;

  private lastSaveTime: number = 0;

  constructor() {
    super('UIScene');
  }

  create() {
    this.moneyText = this.add.text(30, 20, '💰 $0', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });

    this.clickText = this.add.text(30, 68, '+$1 за клик', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });

    this.perSecText = this.add.text(30, 94, '$0 / сек', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });

    const bg = this.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0x2a4a8a)
      .setStrokeStyle(3, 0xffffff);

    const titleText = this.add.text(0, -22, 'УЛУЧШИТЬ КЛИК', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.clickLevelText = this.add.text(-70, 14, 'Ур. 0', {
      fontSize: '13px',
      color: '#c8d8ff',
    }).setOrigin(0.5);

    this.clickCostText = this.add.text(50, 14, '$0', {
      fontSize: '18px',
      color: '#ffd93c',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const container = this.add.container(PANEL_X + CARD_WIDTH / 2, PANEL_Y + CARD_HEIGHT / 2, [
      bg, titleText, this.clickLevelText, this.clickCostText,
    ]);

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerdown', () => {
      const ok = economy.buyClickUpgrade();
      if (ok) {
        saveManager.save();
        this.tweens.add({
          targets: container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 100,
          yoyo: true,
        });
      } else {
        const startX = container.x;
        this.tweens.add({
          targets: container,
          x: startX + 8,
          duration: 50,
          yoyo: true,
          repeat: 3,
          onComplete: () => { container.x = startX; },
        });
      }
    });

    this.lastSaveTime = this.time.now;

    window.addEventListener('beforeunload', () => {
      saveManager.save();
    });

    this.updateTexts();
  }

  update() {
    this.updateTexts();

    if (this.time.now - this.lastSaveTime > AUTOSAVE_INTERVAL_MS) {
      saveManager.save();
      this.lastSaveTime = this.time.now;
    }
  }

  private updateTexts() {
    this.moneyText.setText(`💰 $${Math.floor(economy.getMoney())}`);
    this.clickText.setText(`+$${economy.getMoneyPerClick()} за клик`);
    this.perSecText.setText(`$${economy.getMoneyPerSecond()} / сек`);

    this.clickCostText.setText(`$${economy.getClickUpgradeCost()}`);
    this.clickLevelText.setText(`Ур. ${economy.getClickUpgradeLevel()}`);
  }
}