import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/home']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
