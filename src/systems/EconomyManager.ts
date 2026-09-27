export const HOUSE_LEVELS = [
  { name: 'Домик',       floors: 1,  upgradeCost: 0,     income: 0  },
  { name: 'Двухэтажный', floors: 2,  upgradeCost: 150,   income: 1  },
  { name: 'Трёхэтажный', floors: 3,  upgradeCost: 500,   income: 3  },
  { name: 'Пятиэтажка',  floors: 5,  upgradeCost: 2000,  income: 10 },
  { name: 'Небоскрёб',   floors: 10, upgradeCost: 10000, income: 40 },
];

export class EconomyManager {
  private money: number = 0;
  private moneyPerClick: number = 1;
  private shopLevel: number = 0;
  private clickUpgradeLevel: number = 0;
  private houseLevels: [number, number, number] = [0, 0, 0];

  getMoney(): number { return this.money; }
  getMoneyPerClick(): number { return this.moneyPerClick; }
  getShopLevel(): number { return this.shopLevel; }
  getClickUpgradeLevel(): number { return this.clickUpgradeLevel; }
  getHouseLevel(index: number): number { return this.houseLevels[index]; }
  getHouseLevels(): [number, number, number] { return [...this.houseLevels]; }

  getMoneyPerSecond(): number {
    const shopIncome = this.shopLevel * 1;
    const housesIncome = this.houseLevels.reduce((sum, lvl) => sum + HOUSE_LEVELS[lvl].income, 0);
    return shopIncome + housesIncome;
  }

  setMoney(value: number): void { this.money = value; }
  setMoneyPerClick(value: number): void { this.moneyPerClick = value; }
  setShopLevel(value: number): void { this.shopLevel = value; }
  setClickUpgradeLevel(value: number): void { this.clickUpgradeLevel = value; }
  setHouseLevels(value: [number, number, number]): void { this.houseLevels = [...value]; }

  addMoney(amount: number): void { this.money += amount; }

  spend(amount: number): boolean {
    if (this.money < amount) return false;
    this.money -= amount;
    return true;
  }

  getClickUpgradeCost(): number {
    return Math.floor(50 * Math.pow(2.2, this.clickUpgradeLevel));
  }

  getShopUpgradeCost(): number {
    return Math.floor(80 * Math.pow(2.2, this.shopLevel));
  }

  getHouseUpgradeCost(index: number): number {
    const currentLevel = this.houseLevels[index];
    if (currentLevel >= HOUSE_LEVELS.length - 1) return 0;
    return HOUSE_LEVELS[currentLevel + 1].upgradeCost;
  }

  canUpgradeHouse(index: number): boolean {
    return this.houseLevels[index] < HOUSE_LEVELS.length - 1;
  }

  buyClickUpgrade(): boolean {
    if (!this.spend(this.getClickUpgradeCost())) return false;
    this.clickUpgradeLevel += 1;
    this.moneyPerClick += 1;
    return true;
  }

  buyShopUpgrade(): boolean {
    if (!this.spend(this.getShopUpgradeCost())) return false;
    this.shopLevel += 1;
    return true;
  }

  buyHouseUpgrade(index: number): boolean {
    if (!this.canUpgradeHouse(index)) return false;
    const cost = this.getHouseUpgradeCost(index);
    if (!this.spend(cost)) return false;
    this.houseLevels[index] += 1;
    return true;
  }

  tick(deltaMs: number): void {
    const perSec = this.getMoneyPerSecond();
    if (perSec <= 0) return;
    this.money += (perSec * deltaMs) / 1000;
  }
}

export const economy = new EconomyManager();