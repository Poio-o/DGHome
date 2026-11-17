import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-find-friends',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './find-friends.html',
  styleUrl: './find-friends.css',
})
export class FindFriends {}
