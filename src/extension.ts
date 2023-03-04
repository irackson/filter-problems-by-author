import * as vscode from 'vscode';
import simpleGit, { type SimpleGit, type SimpleGitOptions } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';

const extensionName = 'filter-problems-by-author';
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(`${extensionName}.runextension`, () => {
      console.log('yooooo');
      runExtension();
    })
  );
}

const runExtension = async () => {
  // const interval =
  //   vscode.workspace
  //     .getConfiguration()
  //     .get<number>(`${extensionName}.interval`) || 300;
  const options: Partial<SimpleGitOptions> = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
  };
  const git = simpleGit(options);
  const gitGlobalConfig = await git.listConfig('global');
  const { values, files } = gitGlobalConfig;
  const configValues = Object.values(values)[0];

  const userName = configValues['user.name'];
  const userEmail = configValues['user.email'];

  console.log({ userName, userEmail });
};

// async function getAuthors() {
//   const commits = await git.log({
//     fs,
//     depth: 1000,
//     dir: vscode.workspace.getConfiguration('git').get<string>('path') || '.git',
//   });
//   const authors = new Set<{ name: string; email: string }>();
//   commits.forEach(({ commit }) => {
//     const authorName = commit.author.name;
//     const authorEmail = commit.author.email;
//     authors.add({ name: authorName, email: authorEmail });
//   });
//   return Array.from(authors);
// }

// async function getGlobPatterns(
//   files: string[],
//   authorName: string,
//   authorEmail: string
// ): Promise<string[]> {
//   const contributors = await getAuthors();
//   const contributedFiles = files.filter(async (file) => {
//     return contributors.some(
//       (contributor) =>
//         contributor.name === authorName && contributor.email === authorEmail
//     );
//   });

//   return constructGlobPatterns(contributedFiles);
// }

// function constructGlobPatterns(files: string[]): string[] {
//   const patterns = [];

//   for (const file of files) {
//     const dir = path.dirname(file);
//     const base = path.basename(file);
//     let pattern = path.join(dir, '**', base);
//     pattern = pattern.replace(/\\/g, '/'); // replace backslashes with forward slashes for Windows compatibility
//     patterns.push(pattern);
//   }

//   return patterns;
// }

// function shortestPossibleGlobPattern(files: string[]): string[] {
//   if (files.length === 0) {
//     return [];
//   }

//   // Construct a set of unique directory names for the files
//   const directories = new Set<string>();
//   files.forEach((file) => {
//     const directory = path.dirname(file);
//     directories.add(directory);
//   });

//   // If all files are in the same directory, return a single glob pattern
//   if (directories.size === 1) {
//     const directory = directories.values().next().value;
//     return [`${directory}/**`];
//   }

//   // Construct a set of unique file extensions for the files
//   const extensions = new Set<string>();
//   files.forEach((file) => {
//     const extension = path.extname(file);
//     extensions.add(extension);
//   });

//   // If all files have the same extension, return a single glob pattern
//   if (extensions.size === 1) {
//     const extension = extensions.values().next().value;
//     return [`${directories.values().next().value}/**/*.${extension}`];
//   }

//   // Construct multiple glob patterns for files with different extensions
//   const patterns: string[] = [];
//   extensions.forEach((extension) => {
//     const pattern = `**/*${extension}`;
//     patterns.push(pattern);
//   });

//   return patterns;
// }

// export function deactivate() {}
