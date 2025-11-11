import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TradePlanFormComponent } from '../components/trade-plan-form.component';
import { TradesService } from '../services/trades.service';

@Component({
  standalone: true,
  selector: 'app-trade-form-page',
  imports: [CommonModule, TradePlanFormComponent],
  template: `
    <section class="max-w-3xl mx-auto card">
      <h2 class="text-2xl font-semibold mb-4">Nuevo plan de trade</h2>
      <app-trade-plan-form [model]="model" (submit)="save($event)"></app-trade-plan-form>
    </section>
  `
})
export class TradeFormPageComponent {
  model: any = { side: 'LONG', rr: 0, riskPct: 1 };

  constructor(private trades: TradesService, private router: Router) {}

  save(payload: any) {
    this.trades.create(payload).subscribe((trade) => this.router.navigate(['/trades', trade._id]));
  }
}
