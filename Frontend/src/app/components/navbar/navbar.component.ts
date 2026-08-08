import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <!-- Brand Logo -->
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <svg class="svg-icon brand-svg" viewBox="0 0 24 24">
              <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 2 7h20L12 2z"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Money Bank</span>
            <span class="brand-subtitle">Secure Digital Banking</span>
          </div>
        </a>

        <!-- Navigation Links -->
        <div class="nav-links">
          <ng-container *ngIf="authService.currentUser() as user; else guestNav">
            <!-- User Profile Pill -->
            <div class="user-chip">
              <div class="avatar-circle">
                {{ getUserInitials(user.fullName) }}
              </div>
              <div class="user-meta">
                <span class="user-name">{{ user.fullName }}</span>
                <span class="role-badge" [ngClass]="user.role.toLowerCase()">
                  {{ user.role === 'Manager' ? 'Branch Manager' : 'Customer' }}
                </span>
              </div>
            </div>

            <!-- Role-Specific Action Links -->
            <a
              *ngIf="user.role === 'Customer'"
              routerLink="/customer"
              routerLinkActive="active-link"
              class="nav-link"
            >
              <svg class="svg-icon" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
              <span>My Account</span>
            </a>

            <a
              *ngIf="user.role === 'Manager'"
              routerLink="/manager"
              routerLinkActive="active-link"
              class="nav-link"
            >
              <svg class="svg-icon" viewBox="0 0 24 24">
                <line x1="12" x2="12" y1="20" y2="10"/>
                <line x1="18" x2="18" y1="20" y2="4"/>
                <line x1="6" x2="6" y1="20" y2="16"/>
              </svg>
              <span>Operations</span>
            </a>

            <button (click)="logout()" class="btn-logout" title="Sign out of account">
              <svg class="svg-icon" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </ng-container>

          <ng-template #guestNav>
            <a routerLink="/login" routerLinkActive="active-link" class="nav-link">
              Sign In
            </a>
            <a routerLink="/register" class="btn-register">
              Open Account &rarr;
            </a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.25);
    }
    .nav-container {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #38bdf8;
    }
    .brand-svg {
      width: 22px;
      height: 22px;
    }
    .brand-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #f8fafc;
      display: block;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      font-size: 0.65rem;
      color: #94a3b8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      display: block;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.3rem 0.8rem 0.3rem 0.4rem;
      border-radius: 9999px;
    }
    .avatar-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .user-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #f8fafc;
    }
    .role-badge {
      font-size: 0.65rem;
      font-weight: 600;
    }
    .role-badge.customer {
      color: #38bdf8;
    }
    .role-badge.manager {
      color: #c084fc;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    .nav-link:hover, .active-link {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
    .btn-register {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 700;
      padding: 0.5rem 1.15rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
    .btn-register:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-1px);
    }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: #ef4444;
      color: #ffffff;
      border-color: #ef4444;
    }
  `]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  getUserInitials(name?: string): string {
    if (!name) return 'MB';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
