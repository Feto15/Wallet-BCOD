# 🚀 Quick Start: Testing v1.2

**Ready for manual testing in browser!**

---

## ✅ What's Already Done

1. ✅ **Database Migration** - Schema updated successfully
2. ✅ **API Fixes** - All endpoints working (no isArchived)
3. ✅ **Dev Server** - Running at http://localhost:3000
4. ✅ **API Tests** - All endpoints responding correctly

---

## 🎯 Your Next Steps (5-10 minutes)

### Step 1: Open Browser
```
http://localhost:3000
```

### Step 2: Test Wallets Page
**URL**: http://localhost:3000/wallets

**Check**:
- [ ] Page loads without errors
- [ ] Wallet cards display with summary (Income/Expense/Net)
- [ ] Summary values look correct
- [ ] Click "Delete wallet" → confirmation appears
- [ ] Click "Cancel" → returns to normal
- [ ] **OPTIONAL**: Create test wallet for delete testing

**Expected**: Wallet summary displays income/expense like this:
```
Income: +Rp 0
Expense: -Rp 9,494,994
Net: -Rp 9,494,994
```

---

### Step 3: Test Categories Page
**URL**: http://localhost:3000/categories

**Check**:
- [ ] Page loads without errors
- [ ] Categories display
- [ ] "Delete category" button shows (NOT "Archive")
- [ ] Click delete → confirmation appears

---

### Step 4: Test NEW Summary API Endpoint
**Open in browser**: http://localhost:3000/api/wallets/1/summary

**Expected Response**:
```json
{
  "walletId": 1,
  "income": "0",
  "expense": "9494994",
  "net": -9494994,
  "uncategorized": "0"
}
```

**Check**:
- [ ] JSON displays correctly
- [ ] Values match wallet transactions

---

### Step 5: Critical Test - CASCADE Delete
**This is the most important test!**

1. [ ] Create a test wallet: "Test Delete"
2. [ ] Go to Transactions → create 2-3 transactions for this wallet
3. [ ] Note: Check transactions exist (via API or Transactions page)
4. [ ] Go back to Wallets
5. [ ] Delete "Test Delete" wallet
6. [ ] **VERIFY**: Transactions CASCADE deleted (check API or Transactions page)

**To verify via API**:
```bash
# Before delete - should show transactions
curl http://localhost:3000/api/transactions?wallet_id=[ID]

# After delete - should return empty array []
curl http://localhost:3000/api/transactions?wallet_id=[DELETED_ID]
```

---

### Step 6: Critical Test - SET NULL
**Also very important!**

1. [ ] Create test category: "Test Delete Category"
2. [ ] Create 2-3 transactions using this category
3. [ ] Delete the category
4. [ ] **VERIFY**: Transactions still exist but now show "Uncategorized"

**Via Transactions page**:
- Transactions should still be visible
- Category shows as null or "Uncategorized"

---

## 🐛 If You Find Issues

Document in: `V1.2_MANUAL_TESTING_CHECKLIST.md` (section: ISSUES FOUND)

Or just tell me and I'll fix it!

---

## ✅ If Everything Works

You're ready to merge and deploy! 🎉

```bash
# Merge to main
git checkout main
git merge feature/v1.2-hard-delete-wallet-summary
git push origin main
```

---

## 📚 Full Documentation

- **Detailed Testing**: `V1.2_MANUAL_TESTING_CHECKLIST.md` (9 parts, comprehensive)
- **Implementation Summary**: `V1.2_IMPLEMENTATION_SUMMARY.md`
- **API Test Results**: `V1.2_API_TEST_RESULTS.md`

---

## 🆘 Helper Scripts

**Check schema**:
```bash
node scripts/check-schema.js
```

**Check data**:
```bash
node scripts/check-data.js
```

**Re-run migration** (if needed):
```bash
node scripts/run-pending-migrations.js
```

---

**Happy testing! 🚀**
