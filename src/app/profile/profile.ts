import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly currentUser = inject(AuthService).currentUser;
  readonly featuredDigimon = Array.from({ length: 6 }, (_, index) => index);
}
