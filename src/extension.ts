import * as vscode from 'vscode';
import * as git from 'isomorphic-git';
import * as path from 'path';
import * as fs from 'fs';

const extensionName = 'filter-problems-by-author';
export function activate(context: vscode.ExtensionContext) {
  const interval =
    vscode.workspace
      .getConfiguration()
      .get<number>(`${extensionName}.interval`) || 30000;

  setInterval(async () => {
    try {
      const gitConfig = await git.getConfig({
        fs,
        dir:
          vscode.workspace.getConfiguration('git').get<string>('path') ||
          '.git',
        path: 'config',
      });
      const authorName = gitConfig['user.name'];
      const authorEmail = gitConfig['user.email'];

      const unfilteredFiles = await git.listFiles({
        dir:
          vscode.workspace.getConfiguration('git').get<string>('path') ||
          '.git',
        fs,
      });
      const files = unfilteredFiles.filter((f) => f);

      const patterns = await getGlobPatterns(files, authorName, authorEmail);
      const patternString = shortestPossibleGlobPattern(patterns);

      vscode.workspace
        .getConfiguration('problems')
        .update('files.exclude', patterns.join(', '), true);
    } catch (err) {
      console.error(err);
    }
  }, interval);
}

async function getAuthors() {
  const commits = await git.log({
    fs,
    depth: 1000,
    dir: vscode.workspace.getConfiguration('git').get<string>('path') || '.git',
  });
  const authors = new Set<{ name: string; email: string }>();
  commits.forEach(({ commit }) => {
    const authorName = commit.author.name;
    const authorEmail = commit.author.email;
    authors.add({ name: authorName, email: authorEmail });
  });
  return Array.from(authors);
}

async function getGlobPatterns(
  files: string[],
  authorName: string,
  authorEmail: string
): Promise<string[]> {
  const contributors = await getAuthors();
  const contributedFiles = files.filter(async (file) => {
    return contributors.some(
      (contributor) =>
        contributor.name === authorName && contributor.email === authorEmail
    );
  });

  return constructGlobPatterns(contributedFiles);
}

function constructGlobPatterns(files: string[]): string[] {
  const patterns = [];

  for (const file of files) {
    const dir = path.dirname(file);
    const base = path.basename(file);
    let pattern = path.join(dir, '**', base);
    pattern = pattern.replace(/\\/g, '/'); // replace backslashes with forward slashes for Windows compatibility
    patterns.push(pattern);
  }

  return patterns;
}

function shortestPossibleGlobPattern(files: string[]): string[] {
  if (files.length === 0) {
    return [];
  }

  // Construct a set of unique directory names for the files
  const directories = new Set<string>();
  files.forEach((file) => {
    const directory = path.dirname(file);
    directories.add(directory);
  });

  // If all files are in the same directory, return a single glob pattern
  if (directories.size === 1) {
    const directory = directories.values().next().value;
    return [`${directory}/**`];
  }

  // Construct a set of unique file extensions for the files
  const extensions = new Set<string>();
  files.forEach((file) => {
    const extension = path.extname(file);
    extensions.add(extension);
  });

  // If all files have the same extension, return a single glob pattern
  if (extensions.size === 1) {
    const extension = extensions.values().next().value;
    return [`${directories.values().next().value}/**/*.${extension}`];
  }

  // Construct multiple glob patterns for files with different extensions
  const patterns: string[] = [];
  extensions.forEach((extension) => {
    const pattern = `**/*${extension}`;
    patterns.push(pattern);
  });

  return patterns;
}

export function deactivate() {}
