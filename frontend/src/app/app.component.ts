import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RiskBannerComponent } from './components/risk-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RiskBannerComponent],
  template: `
    <main class="min-h-screen bg-slate-900 text-slate-100">
      <header class="px-6 py-4 flex items-center justify-between bg-slate-950/70 backdrop-blur">
        <h1 class="text-2xl font-semibold">Trading Diary</h1>
        <nav class="flex gap-4 text-sm">
          <a routerLink="/dashboard" routerLinkActive="font-bold">Dashboard</a>
          <a routerLink="/trades" routerLinkActive="font-bold">Trades</a>
          <a routerLink="/setups" routerLinkActive="font-bold">Setups</a>
          <a routerLink="/risk" routerLinkActive="font-bold">Riesgo</a>
        </nav>
      </header>
      <section class="px-6 py-4">
        <app-risk-banner></app-risk-banner>
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styles: [
    `
      main { font-family: 'Inter', sans-serif; }
      a { text-decoration: none; color: #cbd5f5; }
      a.font-bold { color: #38bdf8; }
    `
  ]
})
export class AppComponent {}
