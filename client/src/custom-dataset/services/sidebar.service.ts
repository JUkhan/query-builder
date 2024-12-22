import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
    providedIn: 'root',
})
export class SidebarService {
    constructor() {}
    private sidenav: MatSidenav;
    isSidebarOpen:boolean=false;

    public setSidenav(sidenav: MatSidenav) {
        this.sidenav = sidenav;
    }

    public open() {
        this.isSidebarOpen=true;
        return this.sidenav.open();
    }

    public setSidenavWidth(width: number) {
        // this.sidebarWidthSubject.next(width);
    }


    public close() {
        this.isSidebarOpen=false;
        return this.sidenav.close();
    }

    public toggle(): void {
        this.sidenav.toggle();
    }
}
