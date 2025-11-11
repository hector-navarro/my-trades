import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskService } from '../services/risk.service';

@Component({
  standalone: true,
  selector: 'app-risk-page',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="max-w-2xl mx-auto card">
      <h2 class="text-2xl font-semibold mb-4">Política de riesgo</h2>
      <form class="grid gap-3" (ngSubmit)="save()">
        <label class="text-sm flex flex-col">
          Riesgo por trade (%)
          <input type="number" [(ngModel)]="model.maxRiskPerTradePct" name="riskTrade" />
        </label>
        <label class="text-sm flex flex-col">
          Pérdida diaria (%)
          <input type="number" [(ngModel)]="model.maxDailyLossPct" name="riskDaily" />
        </label>
        <label class="text-sm flex flex-col">
          Máx. pérdidas consecutivas
          <input type="number" [(ngModel)]="model.maxConsecutiveLosses" name="losses" />
        </label>
        <label class="text-sm flex flex-col">
          Duración máxima (min)
          <input type="number" [(ngModel)]="model.maxTradeDurationMin" name="duration" />
        </label>
        <label class="text-sm flex flex-col">
          Notas
          <textarea rows="3" [(ngModel)]="model.notes" name="notes"></textarea>
        </label>
        <button class="btn-primary" type="submit">Guardar</button>
      </form>
    </section>
  `
})
export class RiskPageComponent implements OnInit {
  model: any = {};

  constructor(private risk: RiskService) {}

  ngOnInit(): void {
    this.risk.getPolicy().subscribe((data) => (this.model = data));
  }

  save() {
    this.risk.updatePolicy(this.model).subscribe();
  }
}
