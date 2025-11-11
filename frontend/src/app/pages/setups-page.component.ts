import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SetupsService } from '../services/setups.service';

@Component({
  standalone: true,
  selector: 'app-setups-page',
  imports: [CommonModule, FormsModule, NgFor],
  template: `
    <section class="max-w-3xl mx-auto grid gap-4">
      <div class="card">
        <h2 class="text-xl mb-2">Nuevo setup</h2>
        <form class="grid gap-2" (ngSubmit)="create()">
          <input placeholder="Nombre" [(ngModel)]="form.name" name="name" required />
          <textarea placeholder="Descripción" [(ngModel)]="form.description" name="description"></textarea>
          <button class="btn-primary" type="submit">Guardar</button>
        </form>
      </div>
      <div class="card">
        <h3 class="text-lg mb-2">Mis setups</h3>
        <ul class="space-y-2">
          <li *ngFor="let setup of setups" class="border border-slate-700 rounded-lg p-3">
            <h4 class="font-semibold">{{ setup.name }}</h4>
            <p class="text-sm text-slate-400">{{ setup.description || 'Sin descripción' }}</p>
          </li>
        </ul>
      </div>
    </section>
  `
})
export class SetupsPageComponent implements OnInit {
  setups: any[] = [];
  form = { name: '', description: '' };

  constructor(private setupsService: SetupsService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.setupsService.list().subscribe((data) => (this.setups = data));
  }

  create() {
    this.setupsService.create(this.form).subscribe(() => {
      this.form = { name: '', description: '' };
      this.load();
    });
  }
}
