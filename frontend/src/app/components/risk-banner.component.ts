import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskService } from '../services/risk.service';

@Component({
  selector: 'app-risk-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" class="card mb-4 border border-amber-500/40">
      <strong class="text-amber-400">Atención de riesgo:</strong>
      <p class="text-sm text-slate-200 mt-1">{{ message }}</p>
    </div>
  `
})
export class RiskBannerComponent implements OnInit {
  message: string | null = null;

  constructor(private riskService: RiskService) {}

  ngOnInit(): void {
    this.riskService.getPolicy().subscribe((policy) => {
      if (policy.maxDailyLossPct > 5) {
        this.message = `Tu riesgo diario permitido es ${policy.maxDailyLossPct}% - revisa tus métricas.`;
      } else {
        this.message = 'Política de riesgo dentro de parámetros seguros.';
      }
    });
  }
}
