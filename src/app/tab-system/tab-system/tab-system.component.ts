import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
    selector: 'app-tab-system',
    standalone: true,
    imports: [
        NgForOf,
    ],
    templateUrl: './tab-system.component.html',
    styleUrl: './tab-system.component.css'
})

export class TabSystemComponent {
    @Input() tabs: string[] = [];
    @Output() onCloseTab = new EventEmitter<number>()
    activeTabIndex = 0;

    selectTab(index: number): void {
        this.activeTabIndex = index;
    }

    closeTab(index: number) {
        this.tabs.splice(index, 1)
        this.onCloseTab.emit(index)
    }

}
