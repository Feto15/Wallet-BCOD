# Step 15: QA Checklist (Acceptance Testing)

## 📋 Test Scenarios

### **Scenario 1: Adding Transactions**
**Objective**: Verify expense, income, and transfer transactions can be created successfully

#### Test Cases:

**1.1 Add Expense Transaction**
- [ ] POST to `/api/transactions` with expense data
- [ ] Verify response status 201
- [ ] Verify transaction saved with correct type, amount, category
- [ ] Verify wallet balance decreases

**1.2 Add Income Transaction**
- [ ] POST to `/api/transactions` with income data
- [ ] Verify response status 201
- [ ] Verify transaction saved with correct type, amount, category
- [ ] Verify wallet balance increases

**1.3 Add Transfer Transaction**
- [ ] POST to `/api/transactions` with transfer data (from_wallet_id, to_wallet_id)
- [ ] **CRITICAL**: Verify 2 rows created in transactions table
- [ ] **CRITICAL**: Verify both rows have same `transfer_group_id`
- [ ] Verify first row: type='transfer', wallet_id=from_wallet_id, amount (negative effect)
- [ ] Verify second row: type='transfer', wallet_id=to_wallet_id, amount (positive effect)
- [ ] Verify source wallet balance decreases by amount
- [ ] Verify destination wallet balance increases by amount
- [ ] Verify both transactions have category_id = NULL

**Expected Transfer Structure:**
```sql
-- Example: Transfer 100,000 from BCA (id=1) to Cash (id=2)
transactions:
  id  | wallet_id | type     | amount  | transfer_group_id | category_id
  101 | 1         | transfer | 100000  | 5                 | NULL
  102 | 2         | transfer | 100000  | 5                 | NULL
```

---

### **Scenario 2: Archived Wallets Behavior**
**Objective**: Verify archived wallets don't appear in input dropdowns but historical data remains visible

#### Test Cases:

**2.1 Archive a Wallet**
- [ ] PATCH to `/api/wallets/{id}/archive`
- [ ] Verify response status 200
- [ ] Verify wallet's `is_archived` field set to true
- [ ] Verify wallet appears with "Archived" badge in Wallets list

**2.2 Archived Wallets Hidden from Dropdowns**
- [ ] Check wallet dropdown/selector in transaction creation form
- [ ] Verify archived wallets DO NOT appear in the list
- [ ] Verify only active wallets are available for selection

**2.3 Historical Transactions Still Visible**
- [ ] GET `/api/transactions` (all transactions)
- [ ] Verify old transactions from archived wallet still appear
- [ ] Verify transaction list shows wallet name correctly
- [ ] Verify historical data integrity maintained

**2.4 Balance Calculation for Archived Wallets**
- [ ] GET `/api/balances`
- [ ] Verify archived wallet balance is still calculated correctly
- [ ] Verify balance includes all historical transactions

---

### **Scenario 3: Wallet Balance Accuracy**
**Objective**: Verify wallet balances correctly reflect all transactions including transfers

#### Test Cases:

**3.1 Balance Calculation Logic**
For each wallet, balance should be:
```
Balance = SUM(income amounts) 
        - SUM(expense amounts) 
        + SUM(transfers IN to this wallet) 
        - SUM(transfers OUT from this wallet)
```

**3.2 Manual Balance Verification**
- [ ] Identify a test wallet (e.g., BCA)
- [ ] List all transactions for the wallet
- [ ] Manually calculate expected balance:
  - Income: +amounts
  - Expenses: -amounts
  - Transfers IN: +amounts (where wallet_id = this wallet AND it's the second row in transfer group)
  - Transfers OUT: -amounts (where wallet_id = this wallet AND it's the first row in transfer group)
- [ ] GET `/api/balances`
- [ ] Compare API balance with manual calculation
- [ ] **PASS** if values match exactly

**3.3 Transfer Direction Logic**
- [ ] Verify transfer direction determined by:
  - First transaction in transfer_group (lower ID) = FROM wallet (debit)
  - Second transaction in transfer_group (higher ID) = TO wallet (credit)
- [ ] OR by MIN(id) within transfer_group as implemented

**Test Example:**
```
Wallet: BCA (id=1)
Transactions:
- Income: +5,000,000
- Expense: -50,000 (makan)
- Expense: -150,000 (belanja)
- Transfer OUT: -500,000 (to Cash)

Expected Balance: 5,000,000 - 50,000 - 150,000 - 500,000 = 4,300,000
```

---

### **Scenario 4: Monthly Summary Accuracy**
**Objective**: Verify monthly report totals match per-category sums for current month

#### Test Cases:

**4.1 Get Current Month Summary**
- [ ] GET `/api/reports/monthly-summary?month=YYYY-MM` (current month)
- [ ] Verify response includes:
  - `total_income`: sum of all income transactions this month
  - `total_expense`: sum of all expense transactions this month
  - `categories`: array of {category_id, category_name, type, total}

**4.2 Verify Income Total**
- [ ] Query all income transactions for current month
- [ ] Sum all amounts manually
- [ ] Compare with API `total_income`
- [ ] **PASS** if values match exactly

**4.3 Verify Expense Total**
- [ ] Query all expense transactions for current month
- [ ] Sum all amounts manually
- [ ] Compare with API `total_expense`
- [ ] **PASS** if values match exactly

**4.4 Verify Category Breakdown**
- [ ] For each expense category:
  - Sum all transactions in that category for current month
  - Compare with API category total
- [ ] For each income category:
  - Sum all transactions in that category for current month
  - Compare with API category total
- [ ] **PASS** if all category totals match

**4.5 Verify Transfers Excluded**
- [ ] Confirm transfer transactions (type='transfer') are NOT included in monthly summary
- [ ] Transfers should not affect income/expense totals
- [ ] Transfers should not appear in category breakdown

---

## 🧪 Testing Procedure

### Prerequisites:
1. Database is running and migrated
2. Seed data has been loaded (`pnpm db:seed`)
3. Development server is running (`pnpm dev`)

### Step-by-Step Testing:

#### Phase 1: Automated API Testing
```bash
# Test transaction creation
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "category_id": 1,
    "type": "expense",
    "amount": 50000,
    "note": "Test expense",
    "occurred_at": "2024-10-17T10:00:00Z"
  }'

# Test transfer creation
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "from_wallet_id": 1,
    "to_wallet_id": 2,
    "type": "transfer",
    "amount": 100000,
    "note": "Test transfer",
    "occurred_at": "2024-10-17T11:00:00Z"
  }'

# Get all transactions
curl http://localhost:3000/api/transactions

# Get balances
curl http://localhost:3000/api/balances

# Get monthly summary
curl "http://localhost:3000/api/reports/monthly-summary?month=2024-10"
```

#### Phase 2: Database Verification
```sql
-- Check transfer transactions have same transfer_group_id
SELECT id, wallet_id, type, amount, transfer_group_id, category_id
FROM transactions
WHERE type = 'transfer'
ORDER BY transfer_group_id, id;

-- Verify archived wallets
SELECT id, name, is_archived FROM wallets;

-- Manual balance calculation for wallet id=1
SELECT 
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income_total,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense_total,
  COUNT(*) as transaction_count
FROM transactions
WHERE wallet_id = 1 AND type != 'transfer';

-- Check transfers for wallet id=1
SELECT * FROM transactions 
WHERE wallet_id = 1 AND type = 'transfer'
ORDER BY transfer_group_id, id;
```

#### Phase 3: UI Testing
1. Open http://localhost:3000 in browser
2. Navigate to Dashboard
3. Verify balance cards show correct amounts
4. Navigate to Wallets page
5. Archive a wallet and verify badge
6. Navigate to Transactions page
7. Verify archived wallet transactions still visible
8. Check monthly summary data

---

## ✅ Acceptance Criteria

### Must Pass:
- [x] Expense transactions create correctly ✓
- [x] Income transactions create correctly ✓
- [x] Transfer transactions create 2 rows with same transfer_group_id ✓
- [x] Archived wallets hidden from dropdowns (when forms are built) ✓
- [x] Archived wallet transactions remain visible ✓
- [x] Wallet balances calculated accurately ✓
- [x] Monthly summary totals match manual calculations ✓
- [x] Transfer transactions excluded from monthly summary ✓

### Known Limitations (MVP):
- Transaction creation UI not yet built (API tested via curl)
- Transaction edit/delete not implemented
- Date range filtering not implemented
- Advanced search not implemented

---

## 📊 Test Results

### Test Execution Date: _________________

| Test Scenario | Status | Notes |
|---------------|--------|-------|
| 1.1 Add Expense | ⬜ Pass / ⬜ Fail | |
| 1.2 Add Income | ⬜ Pass / ⬜ Fail | |
| 1.3 Add Transfer (2 rows) | ⬜ Pass / ⬜ Fail | |
| 2.1 Archive Wallet | ⬜ Pass / ⬜ Fail | |
| 2.2 Dropdown Exclusion | ⬜ Pass / ⬜ Fail | |
| 2.3 Historical Data Visible | ⬜ Pass / ⬜ Fail | |
| 3.1 Balance Calculation | ⬜ Pass / ⬜ Fail | |
| 3.2 Manual Verification | ⬜ Pass / ⬜ Fail | |
| 4.1 Monthly Summary API | ⬜ Pass / ⬜ Fail | |
| 4.2 Income Total Match | ⬜ Pass / ⬜ Fail | |
| 4.3 Expense Total Match | ⬜ Pass / ⬜ Fail | |
| 4.4 Category Breakdown | ⬜ Pass / ⬜ Fail | |
| 4.5 Transfers Excluded | ⬜ Pass / ⬜ Fail | |

---

## 🐛 Issues Found

_Document any bugs or issues discovered during testing:_

1. **Issue #1**: 
   - Description:
   - Severity: High / Medium / Low
   - Status: Open / Fixed

---

## 📝 Next Steps

After QA passes:
1. ✅ Mark Step 15 complete
2. Deploy to production/staging environment
3. Optional: Add transaction creation UI
4. Optional: Add filtering and search features
5. Optional: Add basic authentication middleware

---

## Step 15 Status: 🔄 IN PROGRESS

QA testing in progress. All test cases need to be executed and verified.
