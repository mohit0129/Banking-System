const BASE_URL = 'http://localhost:5073/api';

async function testSuite() {
  console.log('=== STARTING MONEY BANK API TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Invalid Email Format
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'Password123' })
    });
    assert(res.status === 400, `Invalid email format returns 400 (Got: ${res.status})`);
  } catch (e) {
    assert(false, `Invalid email test threw: ${e.message}`);
  }

  // 2. Empty Password
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@moneybank.com', password: '' })
    });
    assert(res.status === 400, `Empty password returns 400 (Got: ${res.status})`);
  } catch (e) {
    assert(false, `Empty password test threw: ${e.message}`);
  }

  // 3. Incorrect credentials
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'random@moneybank.com', password: 'WrongPassword999' })
    });
    const body = await res.json();
    assert(res.status === 401 && body.message.includes('Invalid email or password'), `Incorrect credentials returns 401 with proper message`);
  } catch (e) {
    assert(false, `Incorrect credentials test threw: ${e.message}`);
  }

  // 4. Customer Login
  let customerToken = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@moneybank.com', password: 'Customer@123' })
    });
    const body = await res.json();
    assert(res.status === 200 && body.token && body.role === 'Customer', `Customer login succeeds with role Customer`);
    customerToken = body.token;
  } catch (e) {
    assert(false, `Customer login threw: ${e.message}`);
  }

  // 5. Customer Get Account
  let account = null;
  try {
    const res = await fetch(`${BASE_URL}/banking/account`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    account = await res.json();
    assert(res.status === 200 && account.accountNumber, `Customer can retrieve bank account (Account: ${account.accountNumber}, Balance: ₹${account.balance})`);
  } catch (e) {
    assert(false, `Customer get account threw: ${e.message}`);
  }

  // 6. Deposit valid amount
  let newBalanceAfterDeposit = 0;
  try {
    const res = await fetch(`${BASE_URL}/banking/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ amount: 500, note: 'Automated test deposit' })
    });
    const body = await res.json();
    newBalanceAfterDeposit = body.balance;
    assert(res.status === 200 && body.balance > 0, `Deposit ₹500 succeeded (New Balance: ₹${body.balance})`);
  } catch (e) {
    assert(false, `Deposit test threw: ${e.message}`);
  }

  // 7. Deposit invalid / negative amount
  try {
    const res = await fetch(`${BASE_URL}/banking/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ amount: -100 })
    });
    assert(res.status === 400, `Negative deposit rejected with 400 (Got: ${res.status})`);
  } catch (e) {
    assert(false, `Negative deposit test threw: ${e.message}`);
  }

  // 8. Withdraw valid amount
  try {
    const res = await fetch(`${BASE_URL}/banking/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ amount: 200, note: 'Automated test withdrawal' })
    });
    const body = await res.json();
    assert(res.status === 200 && body.balance === (newBalanceAfterDeposit - 200), `Withdraw ₹200 succeeded (New Balance: ₹${body.balance})`);
  } catch (e) {
    assert(false, `Withdraw test threw: ${e.message}`);
  }

  // 9. Withdraw excessive amount
  try {
    const res = await fetch(`${BASE_URL}/banking/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ amount: 99999999, note: 'Excessive withdrawal' })
    });
    const body = await res.json();
    assert(res.status === 400 && body.message.toLowerCase().includes('insufficient'), `Excessive withdrawal rejected with 400 Insufficient balance`);
  } catch (e) {
    assert(false, `Excessive withdrawal test threw: ${e.message}`);
  }

  // 10. Customer Transactions
  try {
    const res = await fetch(`${BASE_URL}/banking/transactions`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const txs = await res.json();
    assert(res.status === 200 && Array.isArray(txs) && txs.length > 0, `Customer transactions retrieved (${txs.length} transactions found)`);
  } catch (e) {
    assert(false, `Customer transactions test threw: ${e.message}`);
  }

  // 11. Customer Payees
  try {
    const res = await fetch(`${BASE_URL}/banking/payees`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const payees = await res.json();
    assert(res.status === 200 && Array.isArray(payees), `Customer payees retrieved (${payees.length} payees found)`);
  } catch (e) {
    assert(false, `Customer payees test threw: ${e.message}`);
  }

  // 12. Customer Forbidden from Manager Endpoints
  try {
    const res = await fetch(`${BASE_URL}/manager/customers`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(res.status === 403, `Customer forbidden (403) from accessing manager endpoints (Got: ${res.status})`);
  } catch (e) {
    assert(false, `Customer forbidden test threw: ${e.message}`);
  }

  // 13. Manager Login
  let managerToken = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@moneybank.com', password: 'Manager@123' })
    });
    const body = await res.json();
    assert(res.status === 200 && body.token && body.role === 'Manager', `Manager login succeeds with role Manager`);
    managerToken = body.token;
  } catch (e) {
    assert(false, `Manager login threw: ${e.message}`);
  }

  // 14. Manager Get Customers
  try {
    const res = await fetch(`${BASE_URL}/manager/customers`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    const custs = await res.json();
    assert(res.status === 200 && Array.isArray(custs) && custs.length > 0, `Manager customers list retrieved (${custs.length} customers)`);
  } catch (e) {
    assert(false, `Manager customers test threw: ${e.message}`);
  }

  // 15. Manager Get Accounts
  let targetAcc = null;
  try {
    const res = await fetch(`${BASE_URL}/manager/accounts`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    const accs = await res.json();
    assert(res.status === 200 && Array.isArray(accs) && accs.length > 0, `Manager accounts list retrieved (${accs.length} accounts)`);
    targetAcc = accs[0];
  } catch (e) {
    assert(false, `Manager accounts test threw: ${e.message}`);
  }

  // 16. Manager Get Transactions
  try {
    const res = await fetch(`${BASE_URL}/manager/transactions`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    const txs = await res.json();
    assert(res.status === 200 && Array.isArray(txs) && txs.length > 0, `Manager transactions list retrieved (${txs.length} transactions)`);
  } catch (e) {
    assert(false, `Manager transactions test threw: ${e.message}`);
  }

  // 17. Manager Toggle Account Status
  if (targetAcc) {
    try {
      const targetId = targetAcc.id || targetAcc.accountNumber;
      // Toggle to inactive
      const res1 = await fetch(`${BASE_URL}/manager/accounts/${targetId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
        body: JSON.stringify({ isActive: false })
      });
      const body1 = await res1.json();
      assert(res1.status === 200 && body1.isActive === false, `Manager toggled account status to Inactive`);

      // Toggle back to active
      const res2 = await fetch(`${BASE_URL}/manager/accounts/${targetId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
        body: JSON.stringify({ isActive: true })
      });
      const body2 = await res2.json();
      assert(res2.status === 200 && body2.isActive === true, `Manager toggled account status back to Active`);
    } catch (e) {
      assert(false, `Manager toggle status threw: ${e.message}`);
    }
  }

  // 18. Unauthorized check
  try {
    const res = await fetch(`${BASE_URL}/banking/account`);
    assert(res.status === 401, `Unauthenticated request correctly returns 401 Unauthorized`);
  } catch (e) {
    assert(false, `Unauthenticated test threw: ${e.message}`);
  }

  console.log(`\n=== TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

testSuite();
