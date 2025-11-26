export interface CategoryFlat {
  id: string;
  name: string;
  parentId?: string | null;
  level?: number;
  productCount?: number;
}

export interface CategoryTree extends CategoryFlat {
  level: number;
  children: CategoryTree[];
}

/**
 * Convert a flat category list into a nested tree structure.
 * Ensures every node exposes a children array and a consistent level depth.
 */
export const buildCategoryTree = (
  flatCategories: CategoryFlat[] = []
): CategoryTree[] => {
  const nodes: Record<string, CategoryTree> = {};
  const roots: CategoryTree[] = [];

  flatCategories.forEach((item) => {
    nodes[item.id] = {
      ...item,
      level: item.level ?? 1,
      children: [],
    };
  });

  Object.values(nodes).forEach((node) => {
    if (node.parentId && nodes[node.parentId]) {
      const parent = nodes[node.parentId];
      node.level = parent.level + 1;
      parent.children.push(node);
    } else {
      node.level = node.level || 1;
      roots.push(node);
    }
  });

  return roots;
};

