## 2025-11-26 – Nested Category Filter Update

### `fe/src/utils/categoryTree.ts`
- Added helper module defining `CategoryFlat`/`CategoryTree` interfaces.
- Implemented `buildCategoryTree(flatCategories)` to convert flat API payloads into nested trees with consistent `children` arrays and depth levels.

### `fe/src/pages/ShopPage.tsx`
- Imported the tree helper to normalize category data regardless of API shape.
- Added `normalizeCategories` to detect flat vs. nested responses and always output a `CategoryTree`.
- Created `mapTreeToOptions` so `FilterPanel` receives the nested structure it expects.
- Updated `filterGroups` to use the normalized tree, ensuring hierarchical rendering and indentation for any nesting depth.

### Impact
- **Consistent hierarchy:** FilterPanel now displays correct indentation even when the backend returns flat category lists.
- **Better UX:** Parent/child relationships remain clear on desktop and mobile filter drawers.
- **Maintainability:** Centralized data shaping logic minimizes future changes in UI components when API formats evolve.

