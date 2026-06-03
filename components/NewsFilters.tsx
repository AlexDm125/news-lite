"use client";

import { useRouter } from "next/navigation";

interface NewsFiltersProps {
  categories: Array<{ id: string; name: string }>;
  currentSearch?: string;
  currentCategory?: string;
  currentSort?: string;
  currentPage?: number;
}

export function NewsFilters({
  categories,
  currentSearch = "",
  currentCategory = "",
  currentSort = "desc",
  currentPage = 1,
}: NewsFiltersProps) {
  const router = useRouter();

  const buildUrl = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams();
    
    if (currentSearch && !("q" in overrides)) params.set("q", currentSearch);
    if (currentCategory && !("category" in overrides)) params.set("category", currentCategory);
    if (currentSort !== "desc" && !("sort" in overrides)) params.set("sort", currentSort);
    if (currentPage > 1 && !("page" in overrides)) params.set("page", String(currentPage));

    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    router.push(buildUrl({ q, page: 1 }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildUrl({ category: e.target.value, page: 1 }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildUrl({ sort: e.target.value, page: 1 }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <form className="flex-1" onSubmit={handleSearch}>
          <input
            type="text"
            name="q"
            placeholder="Пошук новин..."
            defaultValue={currentSearch}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <select
          defaultValue={currentCategory}
          onChange={handleCategoryChange}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 lg:min-w-48"
        >
          <option value="">Всі категорії</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          defaultValue={currentSort}
          onChange={handleSortChange}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 lg:min-w-48"
        >
          <option value="desc">Від нових до старих</option>
          <option value="asc">Від старих до нових</option>
        </select>
      </div>
    </div>
  );
}
