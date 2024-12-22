import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  standalone:false,
  selector: '[dynamicComponentInjector]'
})
export class DynamicComponentLoaderDirective {

  constructor(public viewContainerRef: ViewContainerRef ) { 
    console.log(this.viewContainerRef,' from directive')
  }

}
