import type { Workspace, SearchResult } from '../types';

export function searchInWorkspace(workspace: Workspace, query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const normalizedQuery = query.toLowerCase();

  workspace.files.forEach((file) => {
    Object.entries(file.content).forEach(([key, value]) => {
      const normalizedValue = value.toLowerCase();
      const normalizedKey = key.toLowerCase();

      if (
        normalizedValue.includes(normalizedQuery) ||
        normalizedKey.includes(normalizedQuery)
      ) {
        // Extract context (surrounding text)
        const index = normalizedValue.indexOf(normalizedQuery);
        const start = Math.max(0, index - 30);
        const end = Math.min(value.length, index + normalizedQuery.length + 30);
        const context = value.substring(start, end);

        results.push({
          fileId: file.id,
          fileName: file.path,
          key,
          value,
          context: (start > 0 ? '...' : '') + context + (end < value.length ? '...' : ''),
        });
      }
    });
  });

  return results;
}

export function findSimilarTranslations(
  workspace: Workspace,
  searchTerm: string,
  // currentFileId?: string
): SearchResult[] {
  const results: SearchResult[] = [];
  const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);

  workspace.files.forEach((file) => {
    Object.entries(file.content).forEach(([key, value]) => {
      const normalizedValue = value.toLowerCase();
      
      // Check if value contains any of the search words
      const matchCount = words.filter((word) => normalizedValue.includes(word)).length;
      
      if (matchCount > 0) {
        results.push({
          fileId: file.id,
          fileName: file.path,
          key,
          value,
          context: value,
        });
      }
    });
  });

  // Sort by relevance (number of matching words)
  return results.sort((a, b) => {
    const aMatches = words.filter((word) => a.value.toLowerCase().includes(word)).length;
    const bMatches = words.filter((word) => b.value.toLowerCase().includes(word)).length;
    return bMatches - aMatches;
  });
}

export function findByKey(workspace: Workspace, keyPattern: string): SearchResult[] {
  const results: SearchResult[] = [];
  const normalizedPattern = keyPattern.toLowerCase();

  workspace.files.forEach((file) => {
    Object.entries(file.content).forEach(([key, value]) => {
      if (key.toLowerCase().includes(normalizedPattern)) {
        results.push({
          fileId: file.id,
          fileName: file.path,
          key,
          value,
          context: value,
        });
      }
    });
  });

  return results;
}
