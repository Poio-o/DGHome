import { Component, input } from '@angular/core';

export type IconName =
  | 'logo-dino'
  | 'banner'
  | 'home'
  | 'user'
  | 'settings'
  | 'lock'
  | 'mail'
  | 'bell'
  | 'map'
  | 'facebook'
  | 'twitter'
  | 'apple';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.html',
  styleUrl: './icon.css',
  host: {
    '[style.width]': 'size() ? (size() + "px") : null',
    '[style.height]': 'size() ? (size() + "px") : null',
  },
})
export class IconComponent {
  name = input.required<IconName>();
  size = input<number | string>();
}

