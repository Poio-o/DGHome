import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { MyFriends } from './my-friends/my-friends';
import { FindFriends } from './find-friends/find-friends';
import { Inventory } from './inventory/inventory';
import { Digimon } from './digimon/digimon';
import { Settings } from './settings/settings';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'register', component: Register, canActivate: [loginGuard] },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'my-friends', component: MyFriends, canActivate: [authGuard] },
  { path: 'find-friends', component: FindFriends, canActivate: [authGuard] },
  { path: 'inventory', component: Inventory, canActivate: [authGuard] },
  { path: 'digimon', component: Digimon, canActivate: [authGuard] },
  { path: 'digimons', redirectTo: 'digimon', pathMatch: 'full' },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
];