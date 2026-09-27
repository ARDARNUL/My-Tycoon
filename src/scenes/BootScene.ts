import Phaser from 'phaser';
import { saveManager } from '../systems/SaveManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const hasSave = saveManager.load();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 60, 'Stack Up!', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 20, hasSave ? 'Продолжаем...' : 'Нажми, чтобы начать', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}