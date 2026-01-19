import type { LangFile, FileTreeNode } from '../types';

export function buildFileTree(files: LangFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const nodeMap = new Map<string, FileTreeNode>();

  files.forEach((file) => {
    const parts = file.path.split('/').filter(Boolean);
    let currentPath = '';
    let currentLevel = root;

    parts.forEach((part, index) => {
      currentPath += (currentPath ? '/' : '') + part;
      const isFile = index === parts.length - 1;
      
      let node = nodeMap.get(currentPath);
      
      if (!node) {
        node = {
          id: crypto.randomUUID(),
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          fileId: isFile ? file.id : undefined,
        };
        
        nodeMap.set(currentPath, node);
        currentLevel.push(node);
      }
      
      if (!isFile && node.children) {
        currentLevel = node.children;
      }
    });
  });

  return sortTree(root);
}

function sortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.sort((a, b) => {
    // Folders first
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    // Then alphabetically
    return a.name.localeCompare(b.name);
  }).map((node) => {
    if (node.children) {
      node.children = sortTree(node.children);
    }
    return node;
  });
}

export function findNodeByPath(tree: FileTreeNode[], path: string): FileTreeNode | null {
  for (const node of tree) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function findNodeByFileId(tree: FileTreeNode[], fileId: string): FileTreeNode | null {
  for (const node of tree) {
    if (node.fileId === fileId) {
      return node;
    }
    if (node.children) {
      const found = findNodeByFileId(node.children, fileId);
      if (found) return found;
    }
  }
  return null;
}

export function getAllFiles(tree: FileTreeNode[]): FileTreeNode[] {
  const files: FileTreeNode[] = [];
  
  function traverse(nodes: FileTreeNode[]) {
    nodes.forEach((node) => {
      if (node.type === 'file') {
        files.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  }
  
  traverse(tree);
  return files;
}
