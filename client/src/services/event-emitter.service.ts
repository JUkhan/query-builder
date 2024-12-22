import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  clickEventEmitter=new EventEmitter<object>();
  constructor() { }
  emitClickEvent(res: any): void{
    this.clickEventEmitter.emit(res);
  }
  getClickEventEmitter(): EventEmitter<object> {
    return this.clickEventEmitter;
  }
}
