import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeEvent } from '../models/trade.model';

@Component({
  selector: 'app-trade-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="space-y-2">
      <li *ngFor="let event of events" class="card flex justify-between items-center">
        <div>
          <p class="font-semibold">{{ event.type }}</p>
          <p class="text-xs text-slate-400">{{ event.time | date: 'short' }}</p>
        </div>
        <div class="text-sm text-slate-200">
          <span *ngIf="event.price">@ {{ event.price }}</span>
        </div>
      </li>
    </ul>
  `
})
export class TradeTimelineComponent {
  @Input() events: TradeEvent[] = [];
}
