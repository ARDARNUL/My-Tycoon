import Phaser from 'phaser';
import houseUrl from '../assets/house.png';
import marketUrl from '../assets/market.png';
import roadUrl from '../assets/road.png';
import woodUrl from '../assets/wood.png';

const TILE_W = 128;
const TILE_H = 64;

const GRID_SIZE = 16;
const ROAD_INNER_START = 2;
const ROAD_INNER_END = GRID_SIZE - 3;

const ORIGIN_X = 640;
const ORIGIN_Y = -120;

const ROAD_COLOR = 0x2e2e36;
const SIDEWALK_COLOR = 0x8a8a94;
const ROAD_YELLOW = 0xd4b53a;
const ROAD_WHITE = 0xeeeeee;

export class IsoDemoScene extends Phaser.Scene {
  constructor() {
    super('IsoDemoScene');
  }

  preload() {
    this.load.image('house', houseUrl);
    this.load.image('market', marketUrl);
    this.load.image('road', roadUrl);
    this.load.image('wood', woodUrl);
  }

  create() {
    this.cameras.main.setBackgroundColor('#2a2a30');

    this.drawGround();

    this.drawHouse(4, 4);
    this.drawHouse(4, 7);
    this.drawHouse(4, 10);

    this.drawMarket(10, 7);

    this.drawTree(8, 3);
    this.drawTree(11, 5);
    this.drawTree(8, 13);
    this.drawTree(12, 10);

    this.drawRoadPath([
      [13, 11],
      [9, 8],
      [9, 5],
    ]);

    this.drawRoadPath([
      [9, 8],
      [5, 11],
      [2, 11],
    ]);

    this.drawDebugGrid();
  }

  isoToScreen(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: ORIGIN_X + (tileX - tileY) * (TILE_W / 2),
      y: ORIGIN_Y + (tileX + tileY) * (TILE_H / 2),
    };
  }

  isRoad(tileX: number, tileY: number): boolean {
    const inX = tileX >= ROAD_INNER_START && tileX <= ROAD_INNER_END;
    const inY = tileY >= ROAD_INNER_START && tileY <= ROAD_INNER_END;
    return !(inX && inY);
  }

  drawGround() {
    const g = this.add.graphics();
    g.setDepth(0);

    for (let ty = 0; ty < GRID_SIZE; ty++) {
      for (let tx = 0; tx < GRID_SIZE; tx++) {
        const { x, y } = this.isoToScreen(tx, ty);
        const halfW = TILE_W / 2;
        const halfH = TILE_H / 2;

        const road = this.isRoad(tx, ty);
        const fill = road ? ROAD_COLOR : SIDEWALK_COLOR;

        g.fillStyle(fill, 1);
        g.beginPath();
        g.moveTo(x, y - halfH);
        g.lineTo(x + halfW, y);
        g.lineTo(x, y + halfH);
        g.lineTo(x - halfW, y);
        g.closePath();
        g.fillPath();
      }
    }

    this.drawRoadMarkings();
  }

  drawRoadMarkings() {
    const g = this.add.graphics();
    g.setDepth(1);

    const centerTile = ROAD_INNER_START - 0.5;
    const last = GRID_SIZE - 1;

    this.drawLineAlong(g, 0, centerTile, last, centerTile, ROAD_YELLOW, 5);
    this.drawLineAlong(g, 0, last - centerTile, last, last - centerTile, ROAD_YELLOW, 5);
    this.drawLineAlong(g, centerTile, 0, centerTile, last, ROAD_YELLOW, 5);
    this.drawLineAlong(g, last - centerTile, 0, last - centerTile, last, ROAD_YELLOW, 5);

    const outer = 0.3;
    this.drawLineAlong(g, 0, outer, last, outer, ROAD_WHITE, 2);
    this.drawLineAlong(g, 0, last - outer, last, last - outer, ROAD_WHITE, 2);
    this.drawLineAlong(g, outer, 0, outer, last, ROAD_WHITE, 2);
    this.drawLineAlong(g, last - outer, 0, last - outer, last, ROAD_WHITE, 2);
  }

  drawLineAlong(
    g: Phaser.GameObjects.Graphics,
    tileX1: number,
    tileY1: number,
    tileX2: number,
    tileY2: number,
    color: number,
    width: number
  ) {
    const p1 = this.isoToScreen(tileX1, tileY1);
    const p2 = this.isoToScreen(tileX2, tileY2);

    g.lineStyle(width, color, 1);
    g.beginPath();
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.strokePath();
  }

  drawRoadPath(points: [number, number][]) {
    if (points.length < 2) return;

    const g = this.add.graphics();
    g.setDepth(2);

    const screenPoints = points.map(([tx, ty]) => this.isoToScreen(tx, ty));

    const drawStroke = (width: number, color: number) => {
      g.lineStyle(width, color, 1);
      g.beginPath();
      g.moveTo(screenPoints[0].x, screenPoints[0].y);
      for (let i = 1; i < screenPoints.length; i++) {
        g.lineTo(screenPoints[i].x, screenPoints[i].y);
      }
      g.strokePath();
    };

    drawStroke(50, ROAD_WHITE);
    drawStroke(42, 0x2a2a30);
    drawStroke(3, ROAD_YELLOW);
  }

  drawHouse(tileX: number, tileY: number) {
    const { x, y } = this.isoToScreen(tileX, tileY);
    this.add.image(x, y, 'house')
      .setOrigin(0.5, 0.85)
      .setScale(0.22)
      .setDepth(tileX + tileY + 10);
  }

  drawMarket(tileX: number, tileY: number) {
    const { x, y } = this.isoToScreen(tileX, tileY);
    this.add.image(x, y, 'market')
      .setOrigin(0.5, 0.85)
      .setScale(0.22)
      .setDepth(tileX + tileY + 10);
  }

  drawTree(tileX: number, tileY: number) {
    const { x, y } = this.isoToScreen(tileX, tileY);
    this.add.image(x, y, 'wood')
      .setOrigin(0.5, 0.9)
      .setScale(0.15)
      .setDepth(tileX + tileY + 10);
  }

  drawDebugGrid() {
    const g = this.add.graphics();
    g.setDepth(100);

    g.lineStyle(1, 0x00ff00, 0.5);

    for (let i = 0; i <= GRID_SIZE; i++) {
      const p1 = this.isoToScreen(i, 0);
      const p2 = this.isoToScreen(i, GRID_SIZE);
      g.beginPath();
      g.moveTo(p1.x, p1.y);
      g.lineTo(p2.x, p2.y);
      g.strokePath();

      const p3 = this.isoToScreen(0, i);
      const p4 = this.isoToScreen(GRID_SIZE, i);
      g.beginPath();
      g.moveTo(p3.x, p3.y);
      g.lineTo(p4.x, p4.y);
      g.strokePath();
    }

    for (let ty = 2; ty <= 13; ty++) {
      for (let tx = 2; tx <= 13; tx++) {
        const { x, y } = this.isoToScreen(tx, ty);
        this.add.text(x, y, `${tx},${ty}`, {
          fontSize: '11px',
          color: '#00ff00',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5).setDepth(101);
      }
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const tx = (pointer.worldX - ORIGIN_X) / (TILE_W / 2);
      const ty = (pointer.worldY - ORIGIN_Y) / (TILE_H / 2);
      const tileX = (tx + ty) / 2;
      const tileY = (ty - tx) / 2;
      console.log(`Clicked: tileX = ${tileX.toFixed(2)}, tileY = ${tileY.toFixed(2)}`);
    });
  }
}