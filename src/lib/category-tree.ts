/** Nested tree for hierarchical category pickers (client-safe, no DB imports). */
export type CategoryTreeNode = {
  id: string;
  slug: string;
  label: string;
  children: CategoryTreeNode[] | null;
};

/** First leaf in DFS order (stable default selection). */
export function firstLeafIdInTree(nodes: CategoryTreeNode[]): string | null {
  for (const n of nodes) {
    if (n.children === null) {
      return n.id;
    }
    const x = firstLeafIdInTree(n.children);
    if (x) {
      return x;
    }
  }
  return null;
}

/**
 * Stack of ancestor folders whose children contain `leafId`, so the last folder’s
 * children are the leaf row (siblings of the selected leaf).
 */
export function findAncestorStackForLeaf(
  nodes: CategoryTreeNode[],
  leafId: string,
  acc: CategoryTreeNode[] = [],
): CategoryTreeNode[] | null {
  for (const n of nodes) {
    if (!n.children?.length) {
      continue;
    }
    for (const ch of n.children) {
      if (ch.id === leafId && ch.children === null) {
        return [...acc, n];
      }
    }
    const sub = findAncestorStackForLeaf(n.children, leafId, [...acc, n]);
    if (sub) {
      return sub;
    }
  }
  return null;
}

/** Human path for the selected leaf (e.g. for summary line). */
export function getPathLabelsForLeaf(nodes: CategoryTreeNode[], leafId: string): string {
  const parts: string[] = [];
  function dfs(ns: CategoryTreeNode[], acc: string[]): boolean {
    for (const n of ns) {
      if (n.children === null) {
        if (n.id === leafId) {
          parts.push(...acc, n.label);
          return true;
        }
      } else if (dfs(n.children, [...acc, n.label])) {
        return true;
      }
    }
    return false;
  }
  dfs(nodes, []);
  return parts.join(" › ");
}

/** Găsește un nod după id (DFS). */
export function findCategoryNodeById(nodes: CategoryTreeNode[], id: string): CategoryTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) {
      return n;
    }
    if (n.children?.length) {
      const x = findCategoryNodeById(n.children, id);
      if (x) {
        return x;
      }
    }
  }
  return null;
}

/** Frunză = categorie finală (fără subcategorii). */
export function isLeafCategoryNode(nodes: CategoryTreeNode[], categoryId: string): boolean {
  const n = findCategoryNodeById(nodes, categoryId);
  return n !== null && n.children === null;
}

/** Slug for a leaf node by id (publish form → listing profile). */
export function findLeafSlugById(nodes: CategoryTreeNode[], id: string): string | null {
  for (const n of nodes) {
    if (n.id === id && n.children === null) {
      return n.slug;
    }
    if (n.children) {
      const s = findLeafSlugById(n.children, id);
      if (s) {
        return s;
      }
    }
  }
  return null;
}
