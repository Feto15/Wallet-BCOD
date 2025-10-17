'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  isArchived: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' as 'expense' | 'income' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories?include_archived=true');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (res.ok) {
        setNewCategory({ name: '', type: 'expense' });
        setShowForm(false);
        await fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Are you sure you want to archive this category?')) return;

    try {
      const res = await fetch(`/api/categories/${id}/archive`, {
        method: 'PATCH',
      });

      if (res.ok) {
        await fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to archive category');
      }
    } catch (error) {
      console.error('Failed to archive category:', error);
      alert('Failed to archive category');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 rounded-full bg-[var(--color-divider)]" />
        <div className="space-y-3">
          {[1, 2].map((s) => (
            <div key={s} className="h-20 rounded-[20px] bg-[rgba(30,30,30,0.6)] shadow-[var(--shadow-md)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[24px] font-semibold tracking-[0.2px]">Categories</h1>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Organise expenses and income streams
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
        >
          {showForm ? 'Close' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-[20px] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-md)]">
          <h3 className="text-[16px] font-semibold">Create new category</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="category-name"
                className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]"
              >
                Category name
              </label>
              <input
                type="text"
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="e.g., Transport, Salary"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="category-type"
                className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]"
              >
                Type
              </label>
              <select
                id="category-type"
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'expense' | 'income' })}
                className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create category'}
            </button>
          </form>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold">Expense categories</h2>
        <div className="space-y-3">
          {expenseCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-[20px] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-semibold">{category.name}</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${
                    category.isArchived
                      ? 'bg-[rgba(115,115,115,0.2)] text-[var(--color-text-muted)]'
                      : 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]'
                  }`}
                >
                  {category.isArchived ? 'Archived' : 'Expense'}
                </span>
              </div>
              {!category.isArchived && (
                <button
                  onClick={() => handleArchive(category.id)}
                  className="mt-3 text-[12px] text-[var(--color-negative)] underline"
                >
                  Archive category
                </button>
              )}
            </div>
          ))}

          {expenseCategories.length === 0 && (
            <div className="rounded-[20px] bg-[var(--color-card)] p-6 text-center text-[var(--color-text-muted)] shadow-[var(--shadow-md)]">
              <p>No expense categories yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold">Income categories</h2>
        <div className="space-y-3">
          {incomeCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-[20px] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-semibold">{category.name}</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${
                    category.isArchived
                      ? 'bg-[rgba(115,115,115,0.2)] text-[var(--color-text-muted)]'
                      : 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]'
                  }`}
                >
                  {category.isArchived ? 'Archived' : 'Income'}
                </span>
              </div>
              {!category.isArchived && (
                <button
                  onClick={() => handleArchive(category.id)}
                  className="mt-3 text-[12px] text-[var(--color-negative)] underline"
                >
                  Archive category
                </button>
              )}
            </div>
          ))}

          {incomeCategories.length === 0 && (
            <div className="rounded-[20px] bg-[var(--color-card)] p-6 text-center text-[var(--color-text-muted)] shadow-[var(--shadow-md)]">
              <p>No income categories yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
