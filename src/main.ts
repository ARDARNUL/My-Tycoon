import Phaser from 'phaser';
import './style.css';
import { IsoDemoScene } from './scenes/IsoDemoScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#2a2a30',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [IsoDemoScene],
};

new Phaser.Game(config);