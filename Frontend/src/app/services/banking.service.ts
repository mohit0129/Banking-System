import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount, Transaction, CustomerDto, AccountDetailDto, PayeeDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private readonly bankingUrl = 'http://localhost:5073/api/banking';
  private readonly managerUrl = 'http://localhost:5073/api/manager';

  constructor(private http: HttpClient) {}

  // Customer Operations
  getAccount(): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.bankingUrl}/account`);
  }

  deposit(amount: number, note?: string): Observable<{ message: string; accountNumber: string; balance: number }> {
    return this.http.post<{ message: string; accountNumber: string; balance: number }>(`${this.bankingUrl}/deposit`, { amount, note });
  }

  withdraw(amount: number, note?: string): Observable<{ message: string; accountNumber: string; balance: number }> {
    return this.http.post<{ message: string; accountNumber: string; balance: number }>(`${this.bankingUrl}/withdraw`, { amount, note });
  }

  transfer(targetAccountNumber: string, amount: number, note?: string): Observable<{
    message: string;
    accountNumber: string;
    balance: number;
    targetAccountNumber: string;
  }> {
    return this.http.post<any>(`${this.bankingUrl}/transfer`, { targetAccountNumber, amount, note });
  }

  getCustomerTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.bankingUrl}/transactions`);
  }

  getPayees(): Observable<PayeeDto[]> {
    return this.http.get<PayeeDto[]>(`${this.bankingUrl}/payees`);
  }

  // Manager Operations
  getManagerCustomers(): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>(`${this.managerUrl}/customers`);
  }

  getManagerAccounts(): Observable<AccountDetailDto[]> {
    return this.http.get<AccountDetailDto[]>(`${this.managerUrl}/accounts`);
  }

  createCustomerAccount(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    initialDeposit?: number;
  }): Observable<{ message: string; customer: any }> {
    return this.http.post<{ message: string; customer: any }>(`${this.managerUrl}/create-customer-account`, data);
  }

  getManagerTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.managerUrl}/transactions`);
  }

  toggleAccountStatus(accountId: string, isActive: boolean): Observable<{
    message: string;
    accountId: string;
    accountNumber: string;
    isActive: boolean;
  }> {
    return this.http.patch<any>(`${this.managerUrl}/accounts/${accountId}/toggle-status`, { isActive });
  }
}
