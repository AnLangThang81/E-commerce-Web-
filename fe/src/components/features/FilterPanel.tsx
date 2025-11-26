import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import { formatPrice } from "@/utils/format";

interface PriceRange {
  min: number;
  max: number;
}

interface FilterOption {
  id: string;
  name: string;
  children?: FilterOption[];
}

interface FilterGroup {
  id: string;
  name: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (
    groupId: string,
    optionId: string,
    isSelected: boolean
  ) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

type FilterOptionState = Record<string, boolean>;

const getDefaultExpandedGroups = (
  groups: FilterGroup[]
): Record<string, boolean> =>
  groups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {});

const getDefaultExpandedOptions = (
  groups: FilterGroup[]
): FilterOptionState => {
  const state: FilterOptionState = {};

  const visit = (options?: FilterOption[]) => {
    options?.forEach((option) => {
      if (option.children?.length) {
        state[option.id] = true;
        visit(option.children);
      }
    });
  };

  groups.forEach((group) => visit(group.options));
  return state;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  priceRange,
  onPriceRangeChange,
  filterGroups,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  isMobile = false,
  onCloseMobile,
}) => {
  const [localPriceRange, setLocalPriceRange] =
    useState<PriceRange>(priceRange);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => getDefaultExpandedGroups(filterGroups)
  );
  const [expandedOptions, setExpandedOptions] = useState<FilterOptionState>(
    () => getDefaultExpandedOptions(filterGroups)
  );

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  useEffect(() => {
    if (!filterGroups.length) return;
    setExpandedGroups((prev) =>
      Object.keys(prev).length ? prev : getDefaultExpandedGroups(filterGroups)
    );
    setExpandedOptions((prev) =>
      Object.keys(prev).length ? prev : getDefaultExpandedOptions(filterGroups)
    );
  }, [filterGroups]);

  const handlePriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value = parseInt(e.target.value) || 0;
    setLocalPriceRange((prev) => ({ ...prev, [type]: value }));
  };

  const handlePriceRangeApply = () => {
    onPriceRangeChange(localPriceRange);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const baseClasses = `bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-5 ${
    isMobile
      ? "fixed inset-0 z-50 overflow-auto"
      : "sticky top-24 max-h-[calc(100vh-120px)] overflow-auto"
  }`;

  const renderOptions = (
    options: FilterOption[],
    groupId: string,
    level = 0
  ) => {
    return options.map((option) => {
      const hasChildren = option.children && option.children.length > 0;
      const isExpanded = expandedOptions[option.id] || false;
      const isSelected = selectedFilters[groupId]?.includes(option.id) || false;
      return (
        <div
          key={option.id}
          style={{ marginLeft: level * 16 }} // mỗi cấp thụt 16px
          className="mb-1"
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) =>
                onFilterChange(groupId, option.id, e.target.checked)
              }
            />
            <span>{option.name}</span>
            {hasChildren && (
              <button
                onClick={() =>
                  setExpandedOptions((prev) => ({
                    ...prev,
                    [option.id]: !prev[option.id],
                  }))
                }
                className="text-sm text-neutral-500 ml-2"
              >
                {isExpanded ? "▲" : "▼"}
              </button>
            )}
          </div>

          {hasChildren &&
            isExpanded &&
            renderOptions(option.children!, groupId, level + 1)}
        </div>
      );
    });
  };
  return (
    <div className={baseClasses}>
      {isMobile && (
        <div className="flex justify-between items-center mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-3">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Bộ lọc sản phẩm
          </h2>
          <button
            onClick={onCloseMobile}
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Đóng bộ lọc"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Price Range Filter */}
        <div>
          <h3 className="text-md font-medium text-neutral-800 dark:text-neutral-100 mb-3">
            Khoảng Giá
          </h3>

          {/* Quick Price Presets */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "Dưới 100K", min: 0, max: 100000 },
              { label: "100K - 500K", min: 100000, max: 500000 },
              { label: "500K - 1M", min: 500000, max: 1000000 },
              { label: "1M - 5M", min: 1000000, max: 5000000 },
              { label: "5M - 10M", min: 5000000, max: 10000000 },
              { label: "Trên 10M", min: 10000000, max: 100000000 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setLocalPriceRange({ min: preset.min, max: preset.max });
                }}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  localPriceRange.min === preset.min &&
                  localPriceRange.max === preset.max
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex space-x-3 mb-3">
            <div className="w-1/2">
              <label className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 block">
                Tối thiểu (VND)
              </label>
              <input
                type="number"
                value={localPriceRange.min}
                onChange={(e) => handlePriceInputChange(e, "min")}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                min={0}
                placeholder="0"
              />
            </div>
            <div className="w-1/2">
              <label className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 block">
                Tối đa (VND)
              </label>
              <input
                type="number"
                value={localPriceRange.max}
                onChange={(e) => handlePriceInputChange(e, "max")}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                min={0}
                placeholder="10000000"
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-2">
            <span>{formatPrice(localPriceRange.min)}</span>
            <span>-</span>
            <span>{formatPrice(localPriceRange.max)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePriceRangeApply}
            fullWidth
          >
            Áp dụng khoảng giá
          </Button>
        </div>

        {/* Filter Groups */}
        {filterGroups.map((group) => (
          <div
            key={group.id}
            className="border-t border-neutral-200 dark:border-neutral-700 pt-4"
          >
            <button
              className="flex justify-between items-center w-full text-left mb-3"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={expandedGroups[group.id]}
            >
              <h3 className="text-md font-medium text-neutral-800 dark:text-neutral-100">
                {group.name}
              </h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-neutral-500 transition-transform ${
                  expandedGroups[group.id] ? "transform rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* {expandedGroups[group.id] && (
              <div className="space-y-2 ml-1">
                {group.options.map((option) => {
                  const isSelected =
                    selectedFilters[group.id]?.includes(option.id) || false;
                  return (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${group.id}-${option.id}`}
                        checked={isSelected}
                        onChange={(e) =>
                          onFilterChange(group.id, option.id, e.target.checked)
                        }
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label
                        htmlFor={`${group.id}-${option.id}`}
                        className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                      >
                        {option.name}
                      </label>
                    </div>
                  );
                })}
               
              </div>
            )} */}
            {expandedGroups[group.id] && (
              <div className="space-y-2 flex flex-col">
                {renderOptions(group.options, group.id)}
              </div>
            )}
          </div>
        ))}

        {/* Clear Filters Button */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="ghost" size="sm" onClick={onClearFilters} fullWidth>
            Xóa tất cả bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
