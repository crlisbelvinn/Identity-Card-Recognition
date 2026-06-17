import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2, Clock } from 'lucide-angular';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './result-card.component.html'
})
export class ResultCardComponent {
  @Input() name: string = '';
  @Input() tag: string = '';
  @Input() dotColor: string = '';
  @Input() barColor: string = '';
  @Input() data: any = null;
  @Input() loading: boolean = false;
  @Input() highlighted: boolean = false;

  readonly Loader2 = Loader2;
  readonly Clock = Clock;
}
