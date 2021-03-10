import { Injectable } from '@angular/core';
import mons from '../../assets/mons.json';
import seedrandom from 'seedrandom';

export interface MonData {
  name: string;
  id: number;
  src: string;
}

@Injectable({
  providedIn: 'root'
})
export class MonService {
  mons: MonData[] = mons;
  seed: string = Date.now() + "";

  constructor() { }

  getMons(game): MonData[] {
    if (!game.random) {
      return this.mons
    } else {      
      let mons = this.mons.slice(0, game.totalCells);
      return this.getRandom(mons, game.seed)
    }
  }

  getRandom(array: MonData[], seed: string) {
    
    seedrandom(seed, { global: true });
    let m = array.length;
    let t: MonData;
    let i: number;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }
}
