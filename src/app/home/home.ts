import { Component } from '@angular/core';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
