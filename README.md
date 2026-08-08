# 🏦 Money Bank - Digital Banking System

**Money Bank** is a modern full-stack web application for digital banking. It allows everyday customers to manage their bank accounts and lets bank managers oversee customers, accounts, and bank-wide transactions.

Built with **C# (.NET 8/10 Web API)**, **Angular**, **Modern CSS**, and **MongoDB**.

---

## 📌 Table of Contents
1. [Overview & Highlights](#-overview--highlights)
2. [What You Can Do (Features)](#-what-you-can-do-features)
   - [Customer Features](#customer-features)
   - [Manager Features](#manager-features)
3. [Object-Oriented Programming (OOP) Explained Simply](#-object-oriented-programming-oop-explained-simply)
4. [Technology Stack](#-technology-stack)
5. [Database Details (MongoDB)](#-database-details-mongodb)
6. [Important Banking Rules](#-important-banking-rules)
7. [Project Folder Structure](#-project-folder-structure)
8. [How to Run the Application](#-how-to-run-the-application)
9. [Default Login Accounts](#-default-login-accounts)
10. [Automated Testing](#-automated-testing)

---

## 🌟 Overview & Highlights

- **Clean Fintech Interface**: Built with modern CSS and crisp SVG vector icons (0 emojis used).
- **Indian Banking Theme**: Formatted in Indian Rupees (`₹` / INR) with IFSC codes and a virtual RuPay Platinum debit card.
- **Strict Data Safety**: Users can only see and manage their own financial information.
- **Full Database Persistence**: All customers, account balances, and transaction history are stored permanently in MongoDB.

---

## 🚀 What You Can Do (Features)

### Customer Features
* **Virtual RuPay Platinum Card**: Shows your name, account number, IFSC code, and branch with easy 1-click **Copy A/C** and **Copy IFSC** buttons.
* **Live Balance Card**: Displays your current available balance with real-time updates.
* **Money In & Money Out**: Instant overview of your total deposits and total withdrawals.
* **Deposit Money**: Add funds directly into your account with custom amounts or convenient quick-presets (`₹500`, `₹1,000`, `₹5,000`, `₹10,000`).
* **Withdraw Money**: Withdraw funds anytime, with built-in checks to ensure you cannot withdraw more than your current balance.
* **Send Money (Transfer)**: Transfer money securely to any other Money Bank account number. Prevents accidental self-transfers before sending.
* **Transaction History**:
  * View all past deposits, withdrawals, and transfers with dates and times.
  * Search transactions by description or account number.
  * Filter by category: **All**, **Deposits**, **Withdrawals**, **Money In**, or **Money Out**.
* **Download Statement**: Export your full transaction history to a CSV file at any time.

### Manager Features
* **Executive Analytics**:
  * **Total Bank Balance**: Shows total money held across all customer accounts.
  * **Total Deposits**: Total money deposited by customers since system start.
  * **Total Withdrawals**: Total cash withdrawn.
  * **Active Accounts Ratio**: Percentage of customer accounts that are currently active.
* **Customer Directory**:
  * List of all registered bank customers with their name, email, phone, account number, balance, and account status.
  * Search customers by name, email, phone, or account number.
  * Filter customers by status (**All**, **Active Only**, **Deactivated Only**).
* **Activate / Deactivate Accounts**: Freeze or unfreeze any customer account with a single click. Deactivated accounts cannot perform transactions.
* **Open New Customer Account**: Modal form to register a new customer with opening balance and auto-generated account number.
* **Central Transaction Ledger**:
  * View every single transaction that occurred anywhere in the bank.
  * Search and filter by transaction type.
  * Export the complete bank ledger to a CSV file.

---

## 🧠 Object-Oriented Programming (OOP) Explained Simply

This application was carefully built following the 5 core principles of Object-Oriented Programming. Here is how each concept is used:

### 1. Class and Object
* **What is it?** A **Class** is a blueprint (like an architectural drawing of a house), and an **Object** is the real thing created from that blueprint.
* **In this project:**
  - `BankAccount` is a class with fields like `AccountNumber`, `Balance`, and `IsActive`.
  - When Rohan opens an account, a new `BankAccount` object is created in memory and saved to MongoDB.
  - Other classes include `User`, `Customer`, `Manager`, and `Transaction`.

### 2. Encapsulation (Data Protection)
* **What is it?** Encapsulation hides internal data and prevents outside code from changing it directly or incorrectly.
* **In this project:**
  - The `Balance` property has a **private setter** (`public decimal Balance { get; private set; }`).
  - Outside code **cannot** do `account.Balance = 1000000;`.
  - The balance can only be changed by calling authorized methods:
    ```csharp
    // To add money safely:
    account.Deposit(amount);

    // To take money out safely:
    account.Withdraw(amount);
    ```
  - These methods verify that the amount is greater than zero, that the account is active, and that there are sufficient funds before changing the balance.

### 3. Inheritance (Code Reuse)
* **What is it?** Inheritance allows a child class to automatically inherit fields and logic from a parent class, avoiding duplicate code.
* **In this project:**
  - `User` is the base class containing common information: `Id`, `FullName`, `Email`, `PasswordHash`, `Role`, and `CreatedAt`.
  - `Customer` inherits from `User` and adds `PhoneNumber`.
  - `Manager` inherits from `User` and adds `Department`.
  ```csharp
  public abstract class User {
      public string Id { get; set; }
      public string FullName { get; set; }
      public string Email { get; set; }
      public string Role { get; set; }
  }

  public class Customer : User {
      public string PhoneNumber { get; set; }
  }

  public class Manager : User {
      public string Department { get; set; }
  }
  ```

### 4. Abstraction (Hiding Complexity)
* **What is it?** Abstraction provides a simple menu of what a system can do without cluttering the caller with how it works behind the scenes.
* **In this project:**
  - The controllers communicate through interfaces:
    - `IBankingService`: Defines methods like `DepositAsync`, `WithdrawAsync`, `TransferAsync`, and `GetAccountByCustomerIdAsync`.
    - `IAuthService`: Defines methods for user login, registration, and token generation.
  - The web controllers simply call `_bankingService.DepositAsync(...)`. They do not need to know anything about MongoDB database queries or connection strings.

### 5. Polymorphism ("Many Forms")
* **What is it?** Polymorphism lets different classes implement the same method in their own unique way.
* **In this project:**
  - The base class `User` declares abstract methods:
    ```csharp
    public abstract string GetRoleDescription();
    public abstract string GetPortalGreeting();
    ```
  - When called on a `Customer`, it returns:
    - Greeting: *"Welcome to Money Bank, Rohan Sharma!"*
    - Role: *"Customer - Everyday Retail Banking Member"*
  - When called on a `Manager`, it returns:
    - Greeting: *"Money Bank Executive Control - Manager Vikram Malhotra"*
    - Role: *"Manager - System & Customer Operations Administrator"*

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend API** | C# / ASP.NET Core Web API | Fast, secure REST API with dependency injection |
| **Frontend UI** | Angular (Zoneless) | Clean, reactive single-page app with signals |
| **Styling** | Modern CSS | Custom variables, glassmorphic toasts, clean tables |
| **Database** | MongoDB | Document database running on `localhost:27017` |
| **Database Driver** | MongoDB C# Driver (`MongoDB.Driver`) | Direct document mapping and atomic operations |
| **Security** | JWT (JSON Web Tokens) & BCrypt | Encrypted password storage and role-based route guards |

---

## 🗄️ Database Details (MongoDB)

All application data is saved in a MongoDB database named **`MoneyBankDb`**:

1. **`users` Collection**:
   - Stores user profiles (both Customers and Managers).
   - Contains encrypted password hashes (`BCrypt`), emails, full names, and timestamps.
   - Has a unique index on `Email` to prevent duplicate accounts.
2. **`accounts` Collection**:
   - Stores account records linked to a customer by `CustomerId`.
   - Stores `AccountNumber` (e.g. `MB17816160`), `Balance`, and `IsActive` flag.
   - Has a unique index on `AccountNumber`.
3. **`transactions` Collection**:
   - Stores the permanent financial history for all accounts.
   - Fields: `AccountId`, `AccountNumber`, `Type` (Deposit, Withdrawal, Transfer In, Transfer Out), `Amount`, `BalanceAfter`, `Description`, `RelatedAccountNumber`, and `Date`.

---

## 🔒 Important Banking Rules

* **No Overdrafts**: A customer can never withdraw or transfer more money than their current balance.
* **Positive Amounts Only**: Every deposit, withdrawal, and transfer must be greater than ₹0.
* **Self-Transfer Block**: A customer cannot send money to their own account number.
* **Inactive Account Freeze**: If a manager deactivates an account, that customer cannot deposit, withdraw, or send money until a manager re-activates it.
* **Role Protection**: Customers cannot access any manager screens or manager API endpoints (returns HTTP 403 Forbidden).
* **Automatic Token Handling**: An HTTP interceptor automatically attaches the user's security token to every request and logs out if expired.

---

## 📂 Project Folder Structure

```text
MoneyBank/
├── Backend/
│   ├── Controllers/
│   │   ├── AuthController.cs          (Sign In, Register, Auth verification)
│   │   ├── BankingController.cs       (Customer account, Deposit, Withdraw, Transfer)
│   │   └── ManagerController.cs       (Manager dashboard metrics, Toggle status, Create customer)
│   ├── Models/
│   │   ├── User.cs                    (Base User class, Customer, Manager)
│   │   ├── BankAccount.cs             (Protected Balance & domain business methods)
│   │   ├── Transaction.cs             (Financial audit log model)
│   │   └── DTOs/                      (Data transfer objects for requests & responses)
│   ├── Interfaces/
│   │   ├── IBankingService.cs         (Abstraction contract for banking operations)
│   │   └── IAuthService.cs            (Abstraction contract for authentication)
│   ├── Services/
│   │   ├── BankingService.cs          (Core banking logic & MongoDB interactions)
│   │   └── AuthService.cs             (User creation, password hashing, JWT creation)
│   ├── Data/
│   │   ├── MongoDbContext.cs          (MongoDB database and collection setup)
│   │   └── MongoDbSettings.cs         (Connection string configuration)
│   ├── Program.cs                     (Application startup, middleware, DI setup)
│   └── appsettings.json               (Configuration settings)
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── navbar/            (Top navigation bar with user profile & logout)
│   │   │   ├── pages/
│   │   │   │   ├── login/             (Sign in screen with validation)
│   │   │   │   ├── register/          (Open new account screen)
│   │   │   │   ├── customer-dashboard/(Customer portal, RuPay card, actions, transactions)
│   │   │   │   └── manager-dashboard/ (Manager portal, analytics, customer directory, audit)
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts    (Auth state management & current user signal)
│   │   │   │   └── banking.service.ts (HTTP client calls to backend API)
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts      (Route protection for Customer and Manager)
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts(Auto-injects JWT token, catches 401s)
│   │   │   ├── models/                (TypeScript interfaces matching backend models)
│   │   │   ├── app.routes.ts          (Page routing configuration)
│   │   │   └── app.config.ts          (Global Angular providers)
│   │   ├── styles.css                 (Global CSS design tokens & utilities)
│   │   └── main.ts                    (Angular application bootstrap)
│   ├── angular.json
│   └── package.json
└── README.md
```

---

## 🚀 How to Run the Application

### What You Need Installed
1. **.NET SDK** (version 8 or newer)
2. **Node.js** (version 18 or newer) with npm
3. **MongoDB** running locally on port `27017`

---

### Step 1: Start the Backend API
Open a terminal in the project directory:

```powershell
cd Backend
dotnet run
```

* The backend will build and start at: **`http://localhost:5073`**
* On first launch, it will automatically connect to MongoDB and seed the default Manager and Customer accounts if they don't already exist.

---

### Step 2: Start the Frontend UI
Open a second terminal window:

```powershell
cd Frontend
npm start
```

* The Angular application will compile and open at: **`http://localhost:4200`**

---

## 🔑 Default Login Accounts

You can log in immediately with either of these pre-configured accounts:

| Role | Email | Password | Name | What You Can Test |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `customer@moneybank.com` | `Customer@123` | Rohan Sharma | RuPay card, Deposit, Withdraw, Transfer money, View & search transactions, Download CSV statement |
| **Manager** | `manager@moneybank.com` | `Manager@123` | Vikram Malhotra | View total bank balance, View all customers, Activate/Deactivate accounts, Open new customer accounts, View complete bank transaction ledger |

> **Tip**: You can also click **"Open Account"** on the login page to register a brand new customer account anytime!

---

## 🧪 Automated Testing

An automated test suite is included to verify all backend API endpoints, validation logic, and error handling.

To run the integration test suite:

```powershell
node test_suite.mjs
```

### Verified Test Cases:
- Invalid email format returns HTTP 400
- Empty password returns HTTP 400
- Incorrect password returns HTTP 401 with proper message
- Customer login succeeds with role `Customer`
- Customer can retrieve bank account and balance
- Valid deposit succeeds and increases balance
- Negative deposit is rejected with HTTP 400
- Valid withdrawal succeeds and reduces balance
- Overdraft / excessive withdrawal is rejected with HTTP 400
- Customer can retrieve transaction history
- Customer is blocked (HTTP 403) from accessing manager endpoints
- Manager login succeeds with role `Manager`
- Manager can view all customers and accounts
- Manager can toggle account status between Active and Deactivated
- Unauthenticated requests correctly return HTTP 401 Unauthorized
