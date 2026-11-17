import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
