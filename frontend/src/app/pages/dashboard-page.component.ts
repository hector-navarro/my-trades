import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ReportsService } from '../services/reports.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, NgIf, NgFor],
  template: `
    <section *ngIf="overview" class="grid gap-4">
      <div class="grid md:grid-cols-4 gap-4">
        <div class="card"><h3>Win rate</h3><p class="text-2xl">{{ overview.winRate * 100 | number: '1.0-0' }}%</p></div>
        <div class="card"><h3>R promedio</h3><p class="text-2xl">{{ overview.rAvg | number: '1.2-2' }}</p></div>
        <div class="card"><h3>Expectancy</h3><p class="text-2xl">{{ overview.expectancy | number: '1.2-2' }}</p></div>
        <div class="card"><h3>Drawdown aprox</h3><p class="text-2xl">{{ overview.drawdownApprox | number: '1.2-2' }}R</p></div>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold mb-2">Por símbolo</h3>
        <ul class="text-sm space-y-1">
          <li *ngFor="let row of overview.bySymbol" class="flex justify-between">
            <span>{{ row.symbol }}</span>
            <span>{{ row.trades }} trades • {{ row.avgR | number: '1.2-2' }}R</span>
          </li>
        </ul>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold mb-2">Equity (acumulado R)</h3>
        <div class="h-40 bg-slate-800/80 rounded-lg flex items-end gap-1 p-3">
          <div
            *ngFor="let point of overview.equityCurve"
            class="bg-gradient-to-t from-slate-600 to-cyan-500 flex-1"
            [style.height.%]="50 + point.cumulativeR * 10"
            title="{{ point.date | date: 'shortDate' }}: {{ point.cumulativeR }}R"
          ></div>
        </div>
      </div>
    </section>
  `
})
export class DashboardPageComponent implements OnInit {
  overview: any;

  constructor(private reports: ReportsService) {}

  ngOnInit(): void {
    this.reports.overview({}).subscribe((data) => (this.overview = data));
  }
}
