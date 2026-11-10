import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username = '';
  email = '';
  password = '';
  passwordAgain = '';

  constructor(private router: Router) {}

  onRegister() {
    this.router.navigate(['/home']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
