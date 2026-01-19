import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Workspace, LangFile } from '../types';

export async function importFromFile(fileContent: string): Promise<Workspace> {
  try {
    const content = JSON.parse(fileContent);
    const fileName = 'imported.json';
    
    const langFile: LangFile = {
      id: crypto.randomUUID(),
      path: `kubejs/assets/kubejs/lang/${fileName}`,
      namespace: 'kubejs',
      language: extractLanguageFromFileName(fileName),
      content,
    };

    return {
      id: crypto.randomUUID(),
      name: 'Imported Workspace',
      files: [langFile],
      currentLanguage: extractLanguageFromFileName(fileName),
      annotations: [],
      pinnedKeys: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
  } catch (error) {
    throw new Error('Failed to parse JSON file');
  }
}

export async function importFromZip(zipFile: File): Promise<Workspace> {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(zipFile);
  const files: LangFile[] = [];

  for (const [path, file] of Object.entries(zipData.files)) {
    if (!file.dir && path.endsWith('.json') && path.includes('/lang/')) {
      const content = await file.async('string');
      try {
        const parsed = JSON.parse(content);
        const pathParts = path.split('/');
        const langIndex = pathParts.indexOf('lang');
        const fileName = pathParts[pathParts.length - 1];
        
        // Extract namespace: look for pattern assets/NAMESPACE/lang
        let namespace = 'unknown';
        const assetsIndex = pathParts.indexOf('assets');
        if (assetsIndex !== -1 && assetsIndex + 1 < langIndex) {
          namespace = pathParts[assetsIndex + 1];
        } else {
          namespace = pathParts[langIndex - 1] || 'unknown';
        }

        files.push({
          id: crypto.randomUUID(),
          path,
          namespace,
          language: extractLanguageFromFileName(fileName),
          content: parsed,
        });
      } catch (e) {
        console.warn(`Failed to parse ${path}:`, e);
      }
    }
  }

  if (files.length === 0) {
    throw new Error('No valid language files found in ZIP');
  }

  // Set reference file (en_us if available)
  const referenceFile = files.find((f) => f.language === 'en_us');
  if (referenceFile) {
    referenceFile.isReference = true;
  }

  return {
    id: crypto.randomUUID(),
    name: zipFile.name.replace('.zip', ''),
    files,
    referenceFile,
    currentLanguage: files.find((f) => f.language !== 'en_us')?.language || 'en_us',
    annotations: [],
    pinnedKeys: [],
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
}

export async function importFromGithub(githubUrl: string, branchName?: string): Promise<Workspace> {
  // Parse GitHub URL
  const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL');
  }

  const [, owner, repo] = match;

  try {
    let branch = branchName;
    
    // If no branch specified, get the default branch
    if (!branch) {
      const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const repoInfoResponse = await fetch(repoInfoUrl);
      
      if (!repoInfoResponse.ok) {
        throw new Error('Failed to fetch repository information');
      }
      
      const repoInfo = await repoInfoResponse.json();
      branch = repoInfo.default_branch || 'main';
    }

    // Fetch the repository tree
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch repository tree');
    }

    const data = await response.json();
    const files: LangFile[] = [];

    // Filter for lang files in kubejs or src/main/resources structure
    const langFiles = data.tree.filter(
      (item: any) =>
        item.type === 'blob' &&
        (item.path.includes('kubejs/assets/') || item.path.includes('src/main/resources/assets/')) &&
        item.path.includes('/lang/') &&
        item.path.endsWith('.json')
    );

    // Fetch each lang file
    for (const file of langFiles) {
      try {
        const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
        const fileResponse = await fetch(fileUrl);
        const content = await fileResponse.text();
        const parsed = JSON.parse(content);

        const pathParts = file.path.split('/');
        const langIndex = pathParts.indexOf('lang');
        const fileName = pathParts[pathParts.length - 1];
        
        // Extract namespace: look for pattern assets/NAMESPACE/lang
        let namespace = 'unknown';
        const assetsIndex = pathParts.indexOf('assets');
        if (assetsIndex !== -1 && assetsIndex + 1 < langIndex) {
          namespace = pathParts[assetsIndex + 1];
        } else {
          namespace = pathParts[langIndex - 1] || 'unknown';
        }

        files.push({
          id: crypto.randomUUID(),
          path: file.path,
          namespace,
          language: extractLanguageFromFileName(fileName),
          content: parsed,
        });
      } catch (e) {
        console.warn(`Failed to fetch ${file.path}:`, e);
      }
    }

    if (files.length === 0) {
      throw new Error('No language files found in repository (checked kubejs/assets/*/lang and src/main/resources/assets/*/lang)');
    }

    // Set reference file
    const referenceFile = files.find((f) => f.language === 'en_us');
    if (referenceFile) {
      referenceFile.isReference = true;
    }

    return {
      id: crypto.randomUUID(),
      name: `${owner}/${repo}`,
      files,
      referenceFile,
      currentLanguage: files.find((f) => f.language !== 'en_us')?.language || 'en_us',
      annotations: [],
      pinnedKeys: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to import from GitHub: ${error}`);
  }
}

export async function exportSingleFile(workspace: Workspace, fileId: string): Promise<void> {
  const file = workspace.files.find((f) => f.id === fileId);
  if (!file) {
    throw new Error('File not found');
  }

  const content = JSON.stringify(file.content, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const fileName = file.path.split('/').pop() || 'export.json';
  saveAs(blob, fileName);
}

export async function exportAsZip(
  workspace: Workspace,
  fileIds?: string[]
): Promise<void> {
  const zip = new JSZip();
  const filesToExport = fileIds
    ? workspace.files.filter((f) => fileIds.includes(f.id))
    : workspace.files;

  filesToExport.forEach((file) => {
    const content = JSON.stringify(file.content, null, 2);
    zip.file(file.path, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${workspace.name}.zip`);
}

export async function exportAsResourcePack(
  workspace: Workspace,
  options: {
    packName: string;
    packDescription: string;
    packFormat: number;
  }
): Promise<void> {
  const zip = new JSZip();

  // Add pack.mcmeta
  const packMcmeta = {
    pack: {
      pack_format: options.packFormat,
      description: options.packDescription,
    },
  };
  zip.file('pack.mcmeta', JSON.stringify(packMcmeta, null, 2));

  // Add language files
  workspace.files.forEach((file) => {
    const content = JSON.stringify(file.content, null, 2);
    // Convert kubejs path to resource pack path
    const packPath = file.path.replace('kubejs/', '');
    zip.file(packPath, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${options.packName}.zip`);
}

export async function exportWorkspaceComplete(workspace: Workspace): Promise<void> {
  // Export entire workspace including metadata
  const workspaceData = {
    id: workspace.id,
    name: workspace.name,
    currentLanguage: workspace.currentLanguage,
    annotations: workspace.annotations,
    pinnedKeys: workspace.pinnedKeys,
    files: workspace.files.map((f) => ({
      id: f.id,
      path: f.path,
      namespace: f.namespace,
      language: f.language,
      content: f.content,
      isReference: f.isReference,
    })),
    referenceFile: workspace.referenceFile
      ? {
          id: workspace.referenceFile.id,
          path: workspace.referenceFile.path,
          namespace: workspace.referenceFile.namespace,
          language: workspace.referenceFile.language,
          content: workspace.referenceFile.content,
        }
      : null,
    createdAt: workspace.createdAt,
    modifiedAt: workspace.modifiedAt,
  };

  const content = JSON.stringify(workspaceData, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  saveAs(blob, `${workspace.name}-workspace.json`);
}

export async function importWorkspaceComplete(fileContent: string): Promise<Workspace> {
  try {
    const data = JSON.parse(fileContent);
    
    // Validate workspace structure
    if (!data.files || !Array.isArray(data.files)) {
      throw new Error('Invalid workspace format');
    }

    return {
      id: data.id || crypto.randomUUID(),
      name: data.name || 'Imported Workspace',
      files: data.files,
      referenceFile: data.referenceFile || data.files.find((f: LangFile) => f.language === 'en_us'),
      currentLanguage: data.currentLanguage || 'en_us',
      annotations: data.annotations || [],
      pinnedKeys: data.pinnedKeys || [],
      createdAt: new Date(data.createdAt || Date.now()),
      modifiedAt: new Date(data.modifiedAt || Date.now()),
    };
  } catch (error) {
    throw new Error('Failed to parse workspace file');
  }
}

function extractLanguageFromFileName(fileName: string): string {
  const match = fileName.match(/([a-z]{2}_[a-z]{2})\.json$/i);
  return match ? match[1].toLowerCase() : 'unknown';
}

// Helper to handle file input
export function createFileInput(
  accept: string,
  callback: (file: File) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      callback(file);
    }
  };
  input.click();
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
