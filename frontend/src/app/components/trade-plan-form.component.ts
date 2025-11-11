import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trade-plan-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="grid gap-4 md:grid-cols-2" (ngSubmit)="submitForm()">
      <label class="flex flex-col text-sm">
        Símbolo
        <input [(ngModel)]="model.symbol" name="symbol" required />
      </label>
      <label class="flex flex-col text-sm">
        Lado
        <select [(ngModel)]="model.side" name="side" required>
          <option value="LONG">LONG</option>
          <option value="SHORT">SHORT</option>
        </select>
      </label>
      <label class="flex flex-col text-sm">
        Entrada
        <input type="number" step="0.0001" [(ngModel)]="model.entry" name="entry" required (ngModelChange)="recalculate()" />
      </label>
      <label class="flex flex-col text-sm">
        Stop Loss
        <input type="number" step="0.0001" [(ngModel)]="model.sl" name="sl" required (ngModelChange)="recalculate()" />
      </label>
      <label class="flex flex-col text-sm">
        Take Profit
        <input type="number" step="0.0001" [(ngModel)]="model.tp" name="tp" required (ngModelChange)="recalculate()" />
      </label>
      <label class="flex flex-col text-sm">
        % Riesgo
        <input type="number" step="0.1" [(ngModel)]="model.riskPct" name="riskPct" (ngModelChange)="recalculate()" />
      </label>
      <label class="flex flex-col text-sm md:col-span-2">
        Contexto
        <textarea rows="3" [(ngModel)]="model.context" name="context"></textarea>
      </label>
      <div class="md:col-span-2 flex items-center justify-between card">
        <div>
          <p class="text-lg font-semibold">R:R estimado: {{ model.rr | number: '1.2-2' }}</p>
          <p *ngIf="positionSize" class="text-sm text-slate-300">Tamaño sugerido: {{ positionSize | number: '1.2-2' }} unidades</p>
        </div>
        <button class="btn-primary" type="submit">Guardar plan</button>
      </div>
    </form>
  `
})
export class TradePlanFormComponent implements OnChanges {
  @Input() model: any = {
    symbol: '',
    side: 'LONG',
    entry: 0,
    sl: 0,
    tp: 0,
    rr: 0,
    riskPct: 1
  };
  @Output() submit = new EventEmitter<any>();

  positionSize = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      this.recalculate();
    }
  }

  recalculate() {
    const { entry, sl, tp, side, riskPct } = this.model;
    if (!entry || !sl || !tp) {
      this.model.rr = 0;
      return;
    }
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    this.model.rr = risk ? reward / risk : 0;
    const accountSize = 10000; // placeholder
    this.positionSize = riskPct ? (accountSize * (riskPct / 100)) / risk : 0;
  }

  submitForm() {
    this.submit.emit({ ...this.model });
  }
}
