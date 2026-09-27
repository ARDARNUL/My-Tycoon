import { economy } from './EconomyManager';

const STORAGE_KEY = 'stack-up-save-v2';

interface SaveData {
  money: number;
  moneyPerClick: number;
  shopLevel: number;
  clickUpgradeLevel: number;
  houseLevels: [number, number, number];
  savedAt: number;
}

export class SaveManager {
  save(): void {
    try {
      const data: SaveData = {
        money: economy.getMoney(),
        moneyPerClick: economy.getMoneyPerClick(),
        shopLevel: economy.getShopLevel(),
        clickUpgradeLevel: economy.getClickUpgradeLevel(),
        houseLevels: economy.getHouseLevels(),
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  load(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw) as SaveData;

      if (typeof data.money !== 'number') return false;

      economy.setMoney(data.money);
      economy.setMoneyPerClick(data.moneyPerClick ?? 1);
      economy.setShopLevel(data.shopLevel ?? 0);
      economy.setClickUpgradeLevel(data.clickUpgradeLevel ?? 0);
      economy.setHouseLevels(data.houseLevels ?? [0, 0, 0]);

      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  hasSave(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}

export const saveManager = new SaveManager();