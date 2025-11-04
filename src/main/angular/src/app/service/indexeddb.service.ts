// src/app/services/indexeddb.service.ts
import { Injectable } from '@angular/core';
import { TransitionRule } from '../models/transitionrule.model';
import { Tape } from '../models/tape.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'TuringMachineDB';
  private dbVersion = 1;

  constructor() {}

  // 打开数据库
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // 创建两张表
        if (!db.objectStoreNames.contains('transition_rules')) {
          db.createObjectStore('transition_rules', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('tapes')) {
          db.createObjectStore('tapes', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject('Failed to open IndexedDB');
      };
    });
  }

  // 添加新的方法
  public async getRulesByMachineName(name: string): Promise<TransitionRule[] | null> {
    const all = await this.getAllTransitionRules();
    const found = all.find(entry => entry.machineName === name);
    return found ? found.rules : null;
  }

  // 检查机器名称是否已存在
  public async checkMachineNameExists(name: string): Promise<boolean> {
    const all = await this.getAllTransitionRules();
    return all.some(entry => entry.machineName === name);
  }

  // 保存一组状态转移规则
  public async addTransitionRules(machineName: string, rules: TransitionRule[]): Promise<number> {
    // 先检查是否存在同名规则集
    const exists = await this.checkMachineNameExists(machineName);
    
    // 如果存在同名规则集，先删除它
    if (exists) {
      console.log(`发现同名规则集 "${machineName}"，先删除再添加`);
      await this.deleteTransitionRulesByMachineName(machineName);
    }
    
    const db = await this.openDatabase();
    const tx = db.transaction('transition_rules', 'readwrite');
    const store = tx.objectStore('transition_rules');

    const data = {
      machineName,
      rules,
      createdAt: new Date().toISOString()
    };

    const request = store.add(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

    });
  }


  // 读取所有 TransitionRules
  public async getAllTransitionRules(): Promise<any[]> {
    const db = await this.openDatabase();
    const tx = db.transaction('transition_rules', 'readonly');
    const store = tx.objectStore('transition_rules');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = (event: any) => {
        resolve((event.target as IDBRequest).result);
      };

    });
  }

  public async deleteTransitionRulesByMachineName(machineName: string): Promise<boolean> {
    const allRules = await this.getAllTransitionRules();
    const target = allRules.find(entry => entry.machineName === machineName);
    if (!target) return false;

    const db = await this.openDatabase();
    const tx = db.transaction('transition_rules', 'readwrite');
    const store = tx.objectStore('transition_rules');

    const deleteRequest = store.delete(target.id);

    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(false);
    });
  }

  // 清除指定机器名称的规则
  public async clearTransitionRules(machineName: string): Promise<boolean> {
    try {
      // 使用已有的方法删除规则
      return await this.deleteTransitionRulesByMachineName(machineName);
    } catch (error) {
      console.error('清除规则失败:', error);
      return false;
    }
  }

  // 清除所有规则
  public async clearAllRules(): Promise<boolean> {
    try {
      const db = await this.openDatabase();
      const tx = db.transaction('transition_rules', 'readwrite');
      const store = tx.objectStore('transition_rules');
      
      const clearRequest = store.clear();
      
      return new Promise((resolve, reject) => {
        clearRequest.onsuccess = () => {
          console.log('成功清除所有规则');
          resolve(true);
        };
        clearRequest.onerror = (error) => {
          console.error('清除规则失败:', error);
          reject(false);
        };
      });
    } catch (error) {
      console.error('清除所有规则时发生错误:', error);
      return false;
    }
  }
  
  // 一键删除SampleRules
  public async deleteSampleRules(): Promise<boolean> {
    try {
      // 删除名为SampleMachine的规则集
      return await this.deleteTransitionRulesByMachineName('SampleMachine');
    } catch (error) {
      console.error('删除SampleRules失败:', error);
      return false;
    }
  }
  
  // 删除整个数据库
  public async deleteDatabase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      
      request.onsuccess = () => {
        console.log(`数据库 ${this.dbName} 已成功删除`);
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error(`删除数据库 ${this.dbName} 失败:`, event);
        reject(false);
      };
    });
  }
}
