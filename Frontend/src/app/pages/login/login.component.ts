import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="bank-emblem">
            <svg class="svg-icon svg-icon-xl" viewBox="0 0 24 24">
              <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 2 7h20L12 2z"/>
            </svg>
          </div>
          <h2>Sign In to Money Bank</h2>
          <p class="auth-sub">Manage your digital savings and transactions</p>
        </div>

        <div *ngIf="errorMessage()" class="alert alert-error" role="alert">
          <svg class="svg-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <div class="alert-content">
            <strong>Authentication Failed</strong>
            <p>{{ errorMessage() }}</p>
          </div>
        </div>

        <form (ngSubmit)="onLogin(loginForm)" #loginForm="ngForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                #emailModel="ngModel"
                required
                placeholder="name@example.com"
                class="form-control with-icon"
                [class.is-invalid]="(emailModel.invalid && (emailModel.dirty || emailModel.touched || formSubmitted)) || isAuthFailed()"
                (input)="clearErrors()"
              />
            </div>
            <small class="field-error" *ngIf="emailModel.invalid && (emailModel.dirty || emailModel.touched || formSubmitted)">
              <span *ngIf="emailModel.errors?.['required']">Email address is required.</span>
              <span *ngIf="!emailModel.errors?.['required']">Please enter a valid email address.</span>
            </small>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="password"
                #passModel="ngModel"
                required
                placeholder="Enter your password"
                class="form-control with-icon with-toggle"
                [class.is-invalid]="(passModel.invalid && (passModel.dirty || passModel.touched || formSubmitted)) || isAuthFailed()"
                (input)="clearErrors()"
              />
              <button
                type="button"
                class="btn-toggle-eye"
                (click)="togglePasswordVisibility()"
                [title]="showPassword() ? 'Hide password' : 'Show password'"
                tabindex="-1"
              >
                <svg *ngIf="showPassword()" class="svg-icon svg-icon-sm" viewBox="0 0 24 24">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
                <svg *ngIf="!showPassword()" class="svg-icon svg-icon-sm" viewBox="0 0 24 24">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <small class="field-error" *ngIf="passModel.invalid && (passModel.dirty || passModel.touched || formSubmitted)">
              Password is required.
            </small>
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn-submit">
            <span *ngIf="!isLoading()">Sign In &rarr;</span>
            <span *ngIf="isLoading()">Signing in...</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/register">Open an Account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 75px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.25rem;
      background: radial-gradient(circle at 10% 20%, #0f172a 0%, #020617 100%);
    }
    .auth-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 2.5rem 2.25rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.4);
    }
    .auth-header { text-align: center; margin-bottom: 1.5rem; }
    .bank-emblem {
      width: 48px;
      height: 48px;
      margin: 0 auto 0.65rem auto;
      background: #0f172a;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #38bdf8;
    }
    .auth-header h2 { font-size: 1.45rem; font-weight: 800; margin: 0; color: #0f172a; }
    .auth-sub { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; }
    .auth-form { display: flex; flex-direction: column; gap: 1.15rem; }
    .input-wrap { position: relative; display: flex; align-items: center; }
    .field-icon { position: absolute; left: 0.95rem; width: 18px; height: 18px; color: #94a3b8; pointer-events: none; }
    .form-control.with-icon { padding-left: 2.6rem; }
    .form-control.with-toggle { padding-right: 2.7rem; }
    .btn-toggle-eye {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #64748b;
      display: flex;
    }
    .btn-toggle-eye:hover { color: #0f172a; }
    .btn-submit {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      padding: 0.85rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 0.35rem;
      transition: all 0.15s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .auth-footer a { color: #2563eb; text-decoration: none; font-weight: 700; }
    .auth-footer a:hover { text-decoration: underline; }
    .alert-content strong { display: block; font-size: 0.85rem; }
    .alert-content p { margin: 0; font-size: 0.8rem; }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  formSubmitted = false;

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  isAuthFailed = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const role = this.authService.currentUser()?.role;
      this.router.navigate([role === 'Manager' ? '/manager' : '/customer']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
    this.cdr.detectChanges();
  }

  clearErrors(): void {
    if (this.errorMessage()) this.errorMessage.set('');
    if (this.isAuthFailed()) this.isAuthFailed.set(false);
    this.cdr.detectChanges();
  }

  onLogin(form: NgForm): void {
    this.formSubmitted = true;
    this.clearErrors();

    const trimmedEmail = (this.email || '').trim();
    const trimmedPassword = (this.password || '').trim();

    if (!trimmedEmail) {
      this.errorMessage.set('Please enter your email address.');
      this.isAuthFailed.set(true);
      this.cdr.detectChanges();
      return;
    }

    if (!trimmedPassword) {
      this.errorMessage.set('Please enter your password.');
      this.isAuthFailed.set(true);
      this.cdr.detectChanges();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      this.errorMessage.set('Please enter a valid email address.');
      this.isAuthFailed.set(true);
      this.cdr.detectChanges();
      return;
    }

    this.isLoading.set(true);
    this.cdr.detectChanges();

    this.authService.login({ email: trimmedEmail, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.cdr.detectChanges();
        this.router.navigate([res.role === 'Manager' ? '/manager' : '/customer']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isAuthFailed.set(true);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
        this.cdr.detectChanges();
      }
    });
  }
}
