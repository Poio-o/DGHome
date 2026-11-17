import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { MyFriends } from './my-friends/my-friends';
import { FindFriends } from './find-friends/find-friends';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'my-friends', component: MyFriends, canActivate: [authGuard] },
  { path: 'find-friends', component: FindFriends, canActivate: [authGuard] },
];
