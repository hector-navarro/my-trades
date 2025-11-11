import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TradesService } from '../services/trades.service';
import { Trade } from '../models/trade.model';
import { TradeTimelineComponent } from '../components/trade-timeline.component';

@Component({
  standalone: true,
  selector: 'app-trade-detail-page',
  imports: [CommonModule, NgIf, NgFor, TradeTimelineComponent],
  template: `
    <section *ngIf="trade" class="max-w-4xl mx-auto grid gap-4">
      <header class="card flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-semibold">{{ trade.symbol }} · {{ trade.side }}</h2>
          <p class="text-sm text-slate-400">Estado: {{ trade.status }}</p>
        </div>
        <div class="text-right text-sm">
          <p>Entrada: {{ trade.execution.entryPrice || trade.plan.entry }}</p>
          <p>R Multiple: {{ trade.analytics.rMultiple ?? '—' }}</p>
        </div>
      </header>
      <article class="card">
        <h3 class="text-lg font-semibold mb-2">Plan</h3>
        <ul class="text-sm space-y-1">
          <li>RR: {{ trade.plan.rr }}</li>
          <li>SL: {{ trade.plan.sl }} · TP: {{ trade.plan.tp }}</li>
          <li>Tags: {{ trade.plan.tags?.join(', ') || 'N/A' }}</li>
        </ul>
      </article>
      <article class="card">
        <h3 class="text-lg font-semibold mb-2">Eventos</h3>
        <app-trade-timeline [events]="trade.execution.events"></app-trade-timeline>
      </article>
    </section>
  `
})
export class TradeDetailPageComponent implements OnInit {
  trade: Trade | null = null;

  constructor(private route: ActivatedRoute, private trades: TradesService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.trades.get(id).subscribe((data) => (this.trade = data));
    }
  }
}
