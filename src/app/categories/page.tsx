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
      <div className="px-4 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow h-48"></div>
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage expense and income categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Makan & Minum, Transport, Gaji"
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'expense' | 'income' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      {/* Expense Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Categories</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenseCategories.map((category) => (
                <tr key={category.id} className={category.isArchived ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.isArchived ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!category.isArchived && (
                      <button
                        onClick={() => handleArchive(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {expenseCategories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No expense categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Income Categories */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Categories</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomeCategories.map((category) => (
                <tr key={category.id} className={category.isArchived ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.isArchived ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!category.isArchived && (
                      <button
                        onClick={() => handleArchive(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {incomeCategories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No income categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
