'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategoryAction } from '@/actions/categories';
import AddCategoryModal from '@/components/AddCategoryModal';

// v1.2: removed isArchived field
interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  createdAt: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // v1.2: removed include_archived parameter
      const res = await fetch('/api/categories');
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

  const handleModalSuccess = async () => {
    await fetchCategories();
  };

  // v1.2: Hard delete with SET NULL behavior for transactions
  const handleDelete = async (id: number, name: string) => {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());

      const result = await deleteCategoryAction(formData);

      if (result.success) {
        alert(result.message || 'Category deleted. Transactions moved to uncategorized.');
        setDeleteConfirm(null);
        await fetchCategories();
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="shimmer h-6 w-40 rounded-full" />
        <div className="space-y-3">
          {[1, 2].map((s) => (
            <div key={s} className="shimmer h-20 rounded-[20px] shadow-[var(--shadow-md)]" />
          ))}
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <>
      <AddCategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
      
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[24px] font-semibold tracking-[0.2px]">Categories</h1>
            <p className="text-[14px] text-[var(--color-text-muted)]">
              Organise expenses and income streams
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
          >
            + Add
          </button>
        </div>

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
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]">
                  Expense
                </span>
              </div>
              {deleteConfirm === category.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="rounded-full bg-[var(--color-negative)] px-4 py-1.5 text-[12px] font-semibold text-white transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="rounded-full bg-[var(--color-divider)] px-4 py-1.5 text-[12px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(category.id)}
                  className="mt-3 text-[12px] text-[var(--color-negative)] underline"
                >
                  Delete category
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
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]">
                  Income
                </span>
              </div>
              {deleteConfirm === category.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="rounded-full bg-[var(--color-negative)] px-4 py-1.5 text-[12px] font-semibold text-white transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="rounded-full bg-[var(--color-divider)] px-4 py-1.5 text-[12px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(category.id)}
                  className="mt-3 text-[12px] text-[var(--color-negative)] underline"
                >
                  Delete category
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
    </>
  );
}
