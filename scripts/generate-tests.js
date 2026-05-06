#!/usr/bin/env node
/*
 * Scans Expo/React Native components for missing test files and scaffolds
 * lightweight render tests to ensure components mount without crashing.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = ['App.tsx', 'app'];
const TEST_ROOT = path.join(PROJECT_ROOT, '__tests__');
const LOG_DIR = path.join(PROJECT_ROOT, '.logs');
const SUMMARY_PATH = path.join(LOG_DIR, 'latest-nightly-summary.md');

const createdTests = [];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return '';
  }
}

function hasDefaultExport(contents) {
  return /export\s+default\s+(function|class|React\.memo|\w+)/.test(contents);
}

function normalizedTestName(relativePath) {
  return relativePath
    .replace(/[\\/]/g, '__')
    .replace(/\.tsx?$/, '')
    .replace(/[^A-Za-z0-9_]/g, '_');
}

function buildTestTemplate(importPath, displayName) {
  return `import React from 'react';
import { render } from '@testing-library/react-native';
import Component from '${importPath}';

describe('${displayName}', () => {
  it('renders without crashing', () => {
    const screen = render(<Component />);
    expect(screen.toJSON()).toBeTruthy();
  });
});
`;
}

function handleFile(absPath) {
  if (!absPath.endsWith('.tsx')) return;
  const relPath = path.relative(PROJECT_ROOT, absPath);
  const contents = readFileSafe(absPath);
  if (!hasDefaultExport(contents)) return;

  const testName = normalizedTestName(relPath);
  const testPath = path.join(TEST_ROOT, `${testName}.test.tsx`);
  if (fs.existsSync(testPath)) return;

  const importPath = relPath.startsWith('.') ? relPath : `../${relPath}`;
  const displayName = relPath;
  const template = buildTestTemplate(importPath.replace(/\.tsx?$/, ''), displayName);
  ensureDir(path.dirname(testPath));
  fs.writeFileSync(testPath, template, 'utf8');
  createdTests.push(relPath);
}

function walkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const stat = fs.statSync(dirPath);
  if (stat.isFile()) {
    handleFile(dirPath);
    return;
  }
  const entries = fs.readdirSync(dirPath);
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry);
    const entryStat = fs.statSync(fullPath);
    if (entryStat.isDirectory()) {
      if (['node_modules', '.git', '__tests__', '.expo', '.logs'].includes(entry)) {
        return;
      }
      walkDirectory(fullPath);
    } else {
      handleFile(fullPath);
    }
  });
}

function main() {
  ensureDir(TEST_ROOT);
  ensureDir(LOG_DIR);
  TARGET_DIRS.forEach((target) => {
    const abs = path.join(PROJECT_ROOT, target);
    if (fs.existsSync(abs)) {
      walkDirectory(abs);
    }
  });

  const timestamp = new Date().toISOString();
  if (createdTests.length === 0) {
    fs.writeFileSync(
      SUMMARY_PATH,
      `### Nightly test generation summary (${timestamp})\n- No new tests were added.\n`,
      'utf8'
    );
    console.log('No new tests generated.');
    return;
  }

  const summaryLines = createdTests.map((file) => `- Added smoke test for \`${file}\``);
  const summary = `### Nightly test generation summary (${timestamp})\n${summaryLines.join('\n')}\n`;
  fs.writeFileSync(SUMMARY_PATH, summary, 'utf8');
  const logPath = path.join(LOG_DIR, 'nightly-test-log.md');
  fs.appendFileSync(logPath, `${summary}\n`, 'utf8');
  console.log(summary);
}

main();
