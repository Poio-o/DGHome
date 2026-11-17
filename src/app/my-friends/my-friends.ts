import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-my-friends',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './my-friends.html',
  styleUrl: './my-friends.css',
})
export class MyFriends {}
