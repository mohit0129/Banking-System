import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
          <h2>Open a Bank Account</h2>
          <p class="auth-sub">Digital savings account with RuPay Platinum card</p>
        </div>

        <div *ngIf="errorMessage()" class="alert alert-error" role="alert">
          <svg class="svg-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <div class="alert-content">
            <strong>Registration Notice</strong>
            <p>{{ errorMessage() }}</p>
          </div>
        </div>

        <form (ngSubmit)="onRegister(regForm)" #regForm="ngForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <div class="input-wrap">
              <svg class="field-icon" viewBox="0 0 24 24">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                id="fullName"
                name="fullName"
                [(ngModel)]="fullName"
                #nameModel="ngModel"
                required
                minlength="2"
                placeholder="e.g. Ramesh Kumar"
                class="form-control with-icon"
                [class.is-invalid]="nameModel.invalid && (nameModel.dirty || nameModel.touched || formSubmitted)"
                (input)="clearErrors()"
              />
            </div>
            <small class="field-error" *ngIf="nameModel.invalid && (nameModel.dirty || nameModel.touched || formSubmitted)">
              <span *ngIf="nameModel.errors?.['required']">Full name is required.</span>
              <span *ngIf="nameModel.errors?.['minlength']">Full name must be at least 2 characters.</span>
            </small>
          </div>

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
                placeholder="ramesh@example.com"
                class="form-control with-icon"
                [class.is-invalid]="emailModel.invalid && (emailModel.dirty || emailModel.touched || formSubmitted)"
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
                minlength="6"
                placeholder="At least 6 characters"
                class="form-control with-icon with-toggle"
                [class.is-invalid]="passModel.invalid && (passModel.dirty || passModel.touched || formSubmitted)"
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
              <span *ngIf="passModel.errors?.['required']">Password is required.</span>
              <span *ngIf="passModel.errors?.['minlength']">Password must be at least 6 characters long.</span>
            </small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phoneNumber">Phone Number</label>
              <div class="input-wrap">
                <svg class="field-icon" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  [(ngModel)]="phoneNumber"
                  placeholder="+91 98765 43210"
                  class="form-control with-icon"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="initialDeposit">Opening Deposit (₹)</label>
              <div class="input-wrap">
                <span class="rupee-mark">₹</span>
                <input
                  type="number"
                  id="initialDeposit"
                  name="initialDeposit"
                  [(ngModel)]="initialDeposit"
                  #depositModel="ngModel"
                  min="0"
                  step="any"
                  placeholder="5000"
                  class="form-control with-icon"
                  [class.is-invalid]="depositModel.invalid && (depositModel.dirty || depositModel.touched || formSubmitted)"
                  (input)="clearErrors()"
                />
              </div>
            </div>
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn-submit">
            <span *ngIf="!isLoading()">Open My Account &rarr;</span>
            <span *ngIf="isLoading()">Opening account...</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/login">Sign In</a>
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
      max-width: 460px;
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
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
    .input-wrap { position: relative; display: flex; align-items: center; }
    .field-icon { position: absolute; left: 0.95rem; width: 18px; height: 18px; color: #94a3b8; pointer-events: none; }
    .rupee-mark { position: absolute; left: 1rem; font-weight: 800; color: #059669; }
    .form-control.with-icon { padding-left: 2.6rem; }
    .form-control.with-toggle { padding-right: 2.7rem; }
    .btn-toggle-eye { position: absolute; right: 0.75rem; background: transparent; border: none; cursor: pointer; color: #64748b; display: flex; }
    .btn-toggle-eye:hover { color: #0f172a; }
    .btn-submit {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #ffffff;
      border: none;
      padding: 0.85rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 0.35rem;
      transition: all 0.15s ease;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
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
    .auth-footer a { color: #059669; text-decoration: none; font-weight: 700; }
    .auth-footer a:hover { text-decoration: underline; }
    .alert-content strong { display: block; font-size: 0.85rem; }
    .alert-content p { margin: 0; font-size: 0.8rem; }
  `]
})
export class RegisterComponent implements OnInit {
  fullName = '';
  email = '';
  password = '';
  phoneNumber = '';
  initialDeposit = 5000;
  formSubmitted = false;

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
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
    if (this.errorMessage()) {
      this.errorMessage.set('');
      this.cdr.detectChanges();
    }
  }

  onRegister(form: NgForm): void {
    this.formSubmitted = true;
    this.clearErrors();

    const trimmedName = (this.fullName || '').trim();
    const trimmedEmail = (this.email || '').trim();
    const trimmedPassword = (this.password || '').trim();

    if (!trimmedName || trimmedName.length < 2) {
      this.errorMessage.set('Please enter your full name (at least 2 characters).');
      this.cdr.detectChanges();
      return;
    }

    if (!trimmedEmail) {
      this.errorMessage.set('Please enter your email address.');
      this.cdr.detectChanges();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      this.errorMessage.set('Please enter a valid email address.');
      this.cdr.detectChanges();
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      this.cdr.detectChanges();
      return;
    }

    if (this.initialDeposit < 0) {
      this.errorMessage.set('Opening deposit cannot be negative.');
      this.cdr.detectChanges();
      return;
    }

    this.isLoading.set(true);
    this.cdr.detectChanges();

    this.authService.register({
      fullName: trimmedName,
      email: trimmedEmail,
      password: this.password,
      phoneNumber: (this.phoneNumber || '').trim(),
      initialDeposit: this.initialDeposit
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.cdr.detectChanges();
        this.router.navigate(['/customer']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create account.');
        this.cdr.detectChanges();
      }
    });
  }
}
