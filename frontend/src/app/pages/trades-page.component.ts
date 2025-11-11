import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TradesService } from '../services/trades.service';
import { Trade } from '../models/trade.model';

@Component({
  standalone: true,
  selector: 'app-trades-page',
  imports: [CommonModule, RouterModule, FormsModule, NgFor],
  template: `
    <section class="grid gap-4">
      <div class="card flex gap-4">
        <input placeholder="Símbolo" [(ngModel)]="filters.symbol" />
        <select [(ngModel)]="filters.status">
          <option value="">Estado</option>
          <option value="PLANNED">Planificado</option>
          <option value="OPEN">Abierto</option>
          <option value="CLOSED">Cerrado</option>
        </select>
        <button class="btn-primary" (click)="load()">Buscar</button>
        <a routerLink="/trades/new" class="btn-primary text-center">Nuevo plan</a>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <article *ngFor="let trade of trades" class="card">
          <header class="flex justify-between items-center">
            <h3 class="text-xl">{{ trade.symbol }} · {{ trade.side }}</h3>
            <span class="text-sm text-slate-400">{{ trade.status }}</span>
          </header>
          <p class="text-sm text-slate-300">RR: {{ trade.plan.rr | number: '1.2-2' }}</p>
          <p class="text-xs text-slate-500">Tags: {{ trade.plan.tags?.join(', ') || 'N/A' }}</p>
          <footer class="mt-4 flex justify-between items-center">
            <span class="text-sm">R: {{ trade.analytics.rMultiple ?? '—' }}</span>
            <a [routerLink]="['/trades', trade._id]" class="text-cyan-400 text-sm">Ver detalle</a>
          </footer>
        </article>
      </div>
    </section>
  `
})
export class TradesPageComponent implements OnInit {
  trades: Trade[] = [];
  filters: any = { symbol: '', status: '' };

  constructor(private tradesService: TradesService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.tradesService.list(this.filters).subscribe((data) => (this.trades = data));
  }
}
