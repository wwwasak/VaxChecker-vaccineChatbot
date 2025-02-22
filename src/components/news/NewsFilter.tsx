'use client';

interface NewsFilterProps {
  onFilterChange: (filter: string) => void;
}

export function NewsFilter({ onFilterChange }: NewsFilterProps) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'health', label: 'Health' },
    { id: 'research', label: 'Research' },
    { id: 'safety', label: 'Safety' },
    { id: 'children', label: 'Children' },
    { id: 'covid', label: 'COVID-19' },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id === 'all' ? '' : filter.label)}
            className="px-4 py-2 text-sm font-medium rounded-full border border-gray-300 
                     hover:border-blue-500 hover:text-blue-500 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
} 