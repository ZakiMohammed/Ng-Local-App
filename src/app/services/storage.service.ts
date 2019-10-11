import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getText(key: string): any {
    let data = localStorage.getItem(key);
    if (data) {
      return data;
    } else {
      return null;
    }
  }

  getObject(key: string): any {
    let data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;  
      }
    } else {
      return null;
    }
  }

  setText(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, value);
    } catch {
      return false;
    }
    return true;
  }

  setObject(key: string, value: any): any {
    try {
      localStorage.setItem(key, JSON.stringify(value)); 
    } catch { 
      return false;
    }    
    return true;
  }
}
