export interface AuthResponse {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: 'Customer' | 'Manager' | string;
  roleDescription: string;
  portalGreeting: string;
  accountNumber?: string;
  balance?: number;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  customerId: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id?: string;
  accountId: string;
  accountNumber: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer Out' | 'Transfer In' | string;
  amount: number;
  balanceAfter: number;
  relatedAccountId?: string;
  relatedAccountNumber?: string;
  description: string;
  date: string;
}

export interface CustomerDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleDescription: string;
  createdAt: string;
  accountId?: string;
  accountNumber?: string;
  balance?: number;
  isActive?: boolean;
}

export interface AccountDetailDto {
  id: string;
  accountNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface PayeeDto {
  accountNumber: string;
  customerName: string;
}
