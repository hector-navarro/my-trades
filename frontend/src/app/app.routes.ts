import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { TradesPageComponent } from './pages/trades-page.component';
import { TradeFormPageComponent } from './pages/trade-form-page.component';
import { TradeDetailPageComponent } from './pages/trade-detail-page.component';
import { SetupsPageComponent } from './pages/setups-page.component';
import { RiskPageComponent } from './pages/risk-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { SignupPageComponent } from './pages/signup-page.component';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'trades', component: TradesPageComponent, canActivate: [authGuard] },
  { path: 'trades/new', component: TradeFormPageComponent, canActivate: [authGuard] },
  { path: 'trades/:id', component: TradeDetailPageComponent, canActivate: [authGuard] },
  { path: 'setups', component: SetupsPageComponent, canActivate: [authGuard] },
  { path: 'risk', component: RiskPageComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];
