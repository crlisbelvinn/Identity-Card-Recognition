import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadZoneComponent } from './components/upload-zone/upload-zone.component';
import { ResultCardComponent } from './components/result-card/result-card.component';
import { ConsensusBannerComponent } from './components/consensus-banner/consensus-banner.component';
import { HistoryListComponent } from './components/history-list/history-list.component';
import { LucideAngularModule, ShieldCheck, FileSearch, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    UploadZoneComponent, 
    ResultCardComponent, 
    ConsensusBannerComponent, 
    HistoryListComponent,
    LucideAngularModule
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  file: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  result: any = null;
  error: string | null = null;
  history: any[] = [];
  hoveredText: string | null = null;

  readonly ShieldCheck = ShieldCheck;
  readonly FileSearch = FileSearch;
  readonly AlertCircle = AlertCircle;

  apiUrl = 'http://localhost:5000';

  handleFileSelect(f: File) {
    this.file = f;
    this.previewUrl = URL.createObjectURL(f);
    this.result = null;
    this.error = null;
    this.hoveredText = null;
  }

  handleClear() {
    this.file = null;
    this.previewUrl = null;
    this.result = null;
    this.error = null;
    this.hoveredText = null;
  }

  setHoveredText(text: string | null) {
    this.hoveredText = text;
  }

  handleHistorySelect(item: any) {
    this.previewUrl = item.thumb;
  }

  async handleAnalyze() {
    if (!this.file) return;
    this.loading = true;
    this.error = null;
    this.result = null;

    try {
      const formData = new FormData();
      formData.append('image', this.file);

      const res = await fetch(`${this.apiUrl}/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error (${res.status})`);

      const data = await res.json();
      this.result = data;

      const entry = {
        thumb: this.previewUrl,
        ic: data.hybrid?.nomor_ic || data.consensus?.nomor_ic || data.ocr?.nomor_ic || '—',
        alamat: data.hybrid?.alamat || data.claude?.alamat || data.ocr?.alamat || '—',
        time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
      };
      
      this.history = [entry, ...this.history].slice(0, 5);
    } catch (err: any) {
      this.error = err.message || 'Something went wrong. Is the backend running?';
    } finally {
      this.loading = false;
    }
  }
}
