import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="max-w-md mx-auto card mt-16">
      <h2 class="text-xl font-semibold mb-4">Iniciar sesión</h2>
      <form class="grid gap-4" (ngSubmit)="submit()">
        <label class="text-sm flex flex-col">
          Email
          <input type="email" [(ngModel)]="form.email" name="email" required />
        </label>
        <label class="text-sm flex flex-col">
          Password
          <input type="password" [(ngModel)]="form.password" name="password" required />
        </label>
        <button class="btn-primary" type="submit">Entrar</button>
      </form>
    </section>
  `
})
export class LoginPageComponent {
  form = { email: '', password: '' };

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.auth.login(this.form).subscribe(() => this.router.navigate(['/dashboard']));
  }
}
