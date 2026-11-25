import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon';

export type SettingsTab = 'graphics' | 'input' | 'audio' | 'language';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  readonly activeTab = signal<SettingsTab>('audio');

  readonly tabs: { id: SettingsTab; label: string }[] = [
    { id: 'graphics', label: 'Graphics' },
    { id: 'input', label: 'Input' },
    { id: 'audio', label: 'Audio' },
    { id: 'language', label: 'Language' },
  ];

  selectTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }
}
