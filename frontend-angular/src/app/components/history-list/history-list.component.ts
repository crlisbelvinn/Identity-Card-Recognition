import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-list.component.html'
})
export class HistoryListComponent {
  @Input() items: any[] = [];
  @Output() selectItem = new EventEmitter<any>();

  onSelect(item: any) {
    this.selectItem.emit(item);
  }
}
