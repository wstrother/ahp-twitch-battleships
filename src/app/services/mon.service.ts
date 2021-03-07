import { Injectable } from '@angular/core';

import mons from '../../assets/mons.json';

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

  constructor() { }
}
