import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BankingService } from '../../services/banking.service';
import { BankAccount, Transaction } from '../../models/models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css'
})
export class CustomerDashboardComponent implements OnInit {
  account: BankAccount | null = null;
  transactions: Transaction[] = [];

  readonly ifscCode = 'MNBK0002488';
  readonly branchName = 'Nariman Point, Mumbai';

  activeActionTab: 'deposit' | 'withdraw' | 'transfer' = 'deposit';

  depositAmount: number | null = 1000;
  depositNote = '';
  withdrawAmount: number | null = 500;
  withdrawNote = '';
  targetAccountNumber = '';
  transferAmount: number | null = 1000;
  transferNote = '';

  searchTerm = '';
  selectedFilter = 'ALL';

  feedbackMessage = '';
  isSuccess = false;
  isProcessing = false;
  isRefreshing = false;
  isAccCopied = false;
  isIfscCopied = false;

  constructor(
    public authService: AuthService,
    private bankingService: BankingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get currentBalance(): number {
    return this.account?.balance ?? 0;
  }

  get isSelfTransfer(): boolean {
    return !!(
      this.targetAccountNumber &&
      this.account &&
      this.targetAccountNumber.trim().toUpperCase() === this.account.accountNumber.toUpperCase()
    );
  }

  get formattedCardNumber(): string {
    const raw = this.account?.accountNumber || 'MB00000000';
    return raw.replace(/(\w{4})/g, '$1 ').trim();
  }

  get totalInflow(): number {
    return this.transactions.filter(t => this.isCredit(t.type)).reduce((sum, t) => sum + t.amount, 0);
  }

  get totalOutflow(): number {
    return this.transactions.filter(t => !this.isCredit(t.type)).reduce((sum, t) => sum + t.amount, 0);
  }

  get inflowCount(): number {
    return this.transactions.filter(t => this.isCredit(t.type)).length;
  }

  get outflowCount(): number {
    return this.transactions.filter(t => !this.isCredit(t.type)).length;
  }

  get filteredTransactions(): Transaction[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.transactions.filter(tx => {
      const matchQuery = !q || tx.description.toLowerCase().includes(q) || tx.type.toLowerCase().includes(q) || (tx.relatedAccountNumber?.toLowerCase().includes(q) ?? false);
      const matchType = this.selectedFilter === 'ALL' || tx.type.toLowerCase() === this.selectedFilter.toLowerCase();
      return matchQuery && matchType;
    });
  }

  loadDashboardData(): void {
    this.bankingService.getAccount().subscribe({
      next: (acc) => {
        this.account = acc;
        this.authService.updateBalance(acc.balance);
        this.cdr.detectChanges();
      },
      error: (err) => this.showFeedback(err.error?.message || 'Error loading account data.', false)
    });

    this.bankingService.getCustomerTransactions().subscribe({
      next: (txs) => {
        this.transactions = txs;
        this.cdr.detectChanges();
      }
    });
  }

  refreshDashboard(): void {
    this.isRefreshing = true;
    this.loadDashboardData();
    setTimeout(() => {
      this.isRefreshing = false;
      this.showFeedback('Account and transaction records refreshed.', true);
      this.cdr.detectChanges();
    }, 600);
  }

  setDeposit(val: number): void { this.depositAmount = val; }
  setWithdraw(val: number): void { this.withdrawAmount = val; }
  clearSearch(): void { this.searchTerm = ''; this.cdr.detectChanges(); }

  private handleAction(action$: Observable<{ message: string }>, onSuccess: () => void): void {
    this.isProcessing = true;
    this.cdr.detectChanges();
    action$.subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.showFeedback(res.message, true);
        onSuccess();
        this.loadDashboardData();
      },
      error: (err) => {
        this.isProcessing = false;
        this.showFeedback(err.error?.message || 'Transaction failed.', false);
        this.cdr.detectChanges();
      }
    });
  }

  onDeposit(): void {
    if (!this.depositAmount || this.depositAmount <= 0) return;
    this.handleAction(this.bankingService.deposit(this.depositAmount, this.depositNote), () => {
      this.depositAmount = null;
      this.depositNote = '';
    });
  }

  onWithdraw(): void {
    if (!this.withdrawAmount || this.withdrawAmount <= 0) return;
    this.handleAction(this.bankingService.withdraw(this.withdrawAmount, this.withdrawNote), () => {
      this.withdrawAmount = null;
      this.withdrawNote = '';
    });
  }

  onTransfer(): void {
    if (!this.targetAccountNumber || !this.transferAmount || this.transferAmount <= 0) return;
    if (this.isSelfTransfer) {
      this.showFeedback('Cannot transfer funds to your own account.', false);
      return;
    }
    this.handleAction(this.bankingService.transfer(this.targetAccountNumber.trim(), this.transferAmount, this.transferNote), () => {
      this.targetAccountNumber = '';
      this.transferAmount = null;
      this.transferNote = '';
    });
  }

  copy(text?: string, type: 'acc' | 'ifsc' = 'acc'): void {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    if (type === 'acc') this.isAccCopied = true;
    if (type === 'ifsc') this.isIfscCopied = true;
    this.showFeedback(`${type === 'ifsc' ? 'IFSC' : 'Account number'} copied!`, true);
    setTimeout(() => {
      this.isAccCopied = false;
      this.isIfscCopied = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  copyAccountNumber(): void { this.copy(this.account?.accountNumber, 'acc'); }
  copyIfsc(): void { this.copy(this.ifscCode, 'ifsc'); }

  downloadStatement(): void {
    if (this.transactions.length === 0) {
      this.showFeedback('No transactions available to download.', false);
      return;
    }

    const headers = ['Date', 'Type', 'Description', 'Amount (INR)', 'Balance After (INR)', 'Counterparty'];
    const rows = this.transactions.map((t) => [
      `"${new Date(t.date).toLocaleString('en-IN')}"`,
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
    a.download = `Statement_${this.account?.accountNumber || 'Account'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showFeedback('Statement downloaded successfully as CSV!', true);
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
