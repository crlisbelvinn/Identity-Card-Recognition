import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ImagePlus, X } from 'lucide-angular';

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './upload-zone.component.html'
})
export class UploadZoneComponent {
  @Input() previewUrl: string | null = null;
  @Input() ocrResults: any[] | null = null;
  @Input() hoveredText: string | null = null;

  @Output() fileSelect = new EventEmitter<File>();
  @Output() clear = new EventEmitter<void>();
  @Output() hoverTextChange = new EventEmitter<string | null>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  dragOver = false;

  readonly ImagePlus = ImagePlus;
  readonly X = X;

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragOver = true;
  }

  onDragLeave() {
    this.dragOver = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      this.fileSelect.emit(file);
    }
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelect.emit(file);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onClear() {
    this.clear.emit();
  }

  onMouseEnterBox(text: string) {
    this.hoverTextChange.emit(text);
  }

  onMouseLeaveBox() {
    this.hoverTextChange.emit(null);
  }
}
