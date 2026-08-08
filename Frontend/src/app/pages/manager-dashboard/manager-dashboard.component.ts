import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BankingService } from '../../services/banking.service';
import { CustomerDto, Transaction } from '../../models/models';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  customers: CustomerDto[] = [];
  transactions: Transaction[] = [];

  activeTab: 'customers' | 'transactions' = 'customers';
  feedbackMessage = '';
  isSuccess = false;
  isRefreshing = false;

  customerSearch = '';
  customerStatusFilter: 'ALL' | 'ACTIVE' | 'DEACTIVATED' = 'ALL';

  transactionSearch = '';
  transactionTypeFilter = 'ALL';

  showCreateModal = false;
  isSubmitting = false;
  newCustomer = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    initialDeposit: 1000
  };

  constructor(
    public authService: AuthService,
    private bankingService: BankingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  get activeAccountsCount(): number {
    return this.customers.filter(c => c.isActive).length;
  }

  get activePercentage(): number {
    return this.customers.length === 0 ? 0 : Math.round((this.activeAccountsCount / this.customers.length) * 100);
  }

  get totalReserves(): number {
    return this.customers.reduce((acc, c) => acc + (c.balance ?? 0), 0);
  }

  get totalBankInflow(): number {
    return this.transactions.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + t.amount, 0);
  }

  get totalBankOutflow(): number {
    return this.transactions.filter(t => t.type === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0);
  }

  get filteredCustomers(): CustomerDto[] {
    const q = this.customerSearch.trim().toLowerCase();
    return this.customers.filter(cust => {
      const matchQuery = !q || cust.fullName.toLowerCase().includes(q) || cust.email.toLowerCase().includes(q) || (cust.accountNumber?.toLowerCase().includes(q) ?? false) || cust.phoneNumber.toLowerCase().includes(q);
      const matchStatus = this.customerStatusFilter === 'ALL' || (this.customerStatusFilter === 'ACTIVE' && cust.isActive) || (this.customerStatusFilter === 'DEACTIVATED' && !cust.isActive);
      return matchQuery && matchStatus;
    });
  }

  get filteredTransactions(): Transaction[] {
    const q = this.transactionSearch.trim().toLowerCase();
    return this.transactions.filter(tx => {
      const matchQuery = !q || tx.accountNumber.toLowerCase().includes(q) || tx.description.toLowerCase().includes(q) || (tx.relatedAccountNumber?.toLowerCase().includes(q) ?? false);
      const matchType = this.transactionTypeFilter === 'ALL' || tx.type.toLowerCase() === this.transactionTypeFilter.toLowerCase();
      return matchQuery && matchType;
    });
  }

  loadAllData(): void {
    this.isRefreshing = true;
    this.cdr.detectChanges();

    this.bankingService.getManagerCustomers().subscribe({
      next: (res) => {
        this.customers = res;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isRefreshing = false;
        this.showFeedback(err.error?.message || 'Error loading customers.', false);
      }
    });

    this.bankingService.getManagerTransactions().subscribe({
      next: (txs) => {
        this.transactions = txs;
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(cust: CustomerDto, newStatus: boolean): void {
    const accountId = cust.accountId || cust.accountNumber || cust.id;
    if (!accountId) {
      this.showFeedback('Bank account record not found.', false);
      return;
    }

    this.bankingService.toggleAccountStatus(accountId, newStatus).subscribe({
      next: (res) => {
        this.showFeedback(res.message, true);
        this.loadAllData();
      },
      error: (err) => {
        this.showFeedback(err.error?.message || 'Failed to toggle status.', false);
        this.cdr.detectChanges();
      }
    });
  }

  clearCustomerSearch(): void { this.customerSearch = ''; this.cdr.detectChanges(); }
  clearTransactionSearch(): void { this.transactionSearch = ''; this.cdr.detectChanges(); }

  openCreateModal(): void {
    this.newCustomer = { fullName: '', email: '', password: '', phoneNumber: '', initialDeposit: 1000 };
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.cdr.detectChanges();
  }

  onCreateCustomer(): void {
    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.bankingService.createCustomerAccount(this.newCustomer).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.closeCreateModal();
        this.showFeedback(res.message, true);
        this.loadAllData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showFeedback(err.error?.message || 'Error creating customer.', false);
        this.cdr.detectChanges();
      }
    });
  }

  exportAuditLedger(): void {
    if (this.transactions.length === 0) {
      this.showFeedback('No transactions in ledger to export.', false);
      return;
    }

    const headers = ['Timestamp', 'Account Number', 'Type', 'Description', 'Amount (INR)', 'Balance After (INR)', 'Counterparty'];
    const rows = this.transactions.map((t) => [
      `"${new Date(t.date).toLocaleString('en-IN')}"`,
      `"${t.accountNumber}"`,
      `"${t.type}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.balanceAfter,
      `"${t.relatedAccountNumber || 'N/A'}"`
    ]);

    const blob = new Blob([[headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showFeedback('Ledger exported successfully as CSV!', true);
  }

  showFeedback(msg: string, success: boolean): void {
    this.feedbackMessage = msg;
    this.isSuccess = success;
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = '';
        this.cdr.detectChanges();
      }
    }, 4500);
  }

  closeFeedback(): void {
    this.feedbackMessage = '';
    this.cdr.detectChanges();
  }

  getUserInitials(name: string): string {
    return (name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'MB';
  }

  isCredit(type: string): boolean {
    return type === 'Deposit' || type === 'Transfer In';
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'Deposit': return 'badge-deposit';
      case 'Withdrawal': return 'badge-withdraw';
      case 'Transfer In': return 'badge-transfer-in';
      case 'Transfer Out': return 'badge-transfer-out';
      default: return '';
    }
  }
}
