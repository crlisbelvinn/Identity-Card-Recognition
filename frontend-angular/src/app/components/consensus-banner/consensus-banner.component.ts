import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-consensus-banner',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './consensus-banner.component.html'
})
export class ConsensusBannerComponent {
  @Input() consensus: { agreement: boolean; nomor_ic: string | null } | null = null;

  readonly CheckCircle2 = CheckCircle2;
  readonly AlertTriangle = AlertTriangle;
}
