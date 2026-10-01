/**
 * src/lib/diff.ts — Lightweight Text Diffing Utility
 * Computes word-level and paragraph-level diffs for story revisions.
 */

export interface DiffChunk {
  type: "added" | "removed" | "unchanged";
  value: string;
  added?: boolean;
  removed?: boolean;
}

/**
 * Strips HTML tags and normalizes whitespace for clean prose comparison.
 */
export function normalizeProse(text: string): string {
  if (!text) return "";
  return text
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\r\n/g, "\n")
    .trim();
}

/**
 * Computes word-level diff using Longest Common Subsequence (LCS).
 */
export function computeWordDiff(oldStr: string, newStr: string): DiffChunk[] {
  const oldText = normalizeProse(oldStr);
  const newText = normalizeProse(newStr);

  if (!oldText && !newText) return [];
  if (!oldText) return [{ type: "added", value: newText, added: true }];
  if (!newText) return [{ type: "removed", value: oldText, removed: true }];
  if (oldText === newText) return [{ type: "unchanged", value: newText }];

  // Tokenize by words and punctuation/whitespace
  const oldTokens: string[] = oldText.split(/(\s+)/).filter(Boolean);
  const newTokens: string[] = newText.split(/(\s+)/).filter(Boolean);

  const n = oldTokens.length;
  const m = newTokens.length;

  // For very large texts, fallback to paragraph diff for performance
  if (n * m > 4000000) {
    return computeParagraphDiff(oldText, newText);
  }

  // 1D flat Int32Array for memory efficiency and strict typing
  const stride = m + 1;
  const dp = new Int32Array((n + 1) * stride);

  for (let i = 1; i <= n; i++) {
    const prevRow = (i - 1) * stride;
    const currRow = i * stride;
    const oldTok = oldTokens[i - 1] ?? "";

    for (let j = 1; j <= m; j++) {
      const newTok = newTokens[j - 1] ?? "";
      if (oldTok === newTok) {
        dp[currRow + j] = (dp[prevRow + (j - 1)] ?? 0) + 1;
      } else {
        const top = dp[prevRow + j] ?? 0;
        const left = dp[currRow + (j - 1)] ?? 0;
        dp[currRow + j] = top > left ? top : left;
      }
    }
  }

  // Backtrack to build diff chunks
  let i = n;
  let j = m;
  const rawChunks: DiffChunk[] = [];

  while (i > 0 || j > 0) {
    const oldTok = i > 0 ? (oldTokens[i - 1] ?? "") : "";
    const newTok = j > 0 ? (newTokens[j - 1] ?? "") : "";
    const currRow = i * stride;
    const prevRow = (i - 1) * stride;

    if (i > 0 && j > 0 && oldTok === newTok) {
      rawChunks.push({ type: "unchanged", value: oldTok });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || (dp[currRow + (j - 1)] ?? 0) >= (dp[prevRow + j] ?? 0))) {
      rawChunks.push({ type: "added", value: newTok, added: true });
      j--;
    } else if (i > 0 && (j === 0 || (dp[currRow + (j - 1)] ?? 0) < (dp[prevRow + j] ?? 0))) {
      rawChunks.push({ type: "removed", value: oldTok, removed: true });
      i--;
    } else {
      break;
    }
  }

  rawChunks.reverse();

  // Consolidate consecutive chunks of the same type
  const mergedChunks: DiffChunk[] = [];
  for (const chunk of rawChunks) {
    const last = mergedChunks[mergedChunks.length - 1];
    if (last && last.type === chunk.type) {
      last.value += chunk.value;
    } else {
      mergedChunks.push({ ...chunk });
    }
  }

  return mergedChunks;
}

/**
 * Paragraph-level diffing for fast longform prose diffing.
 */
export function computeParagraphDiff(oldStr: string, newStr: string): DiffChunk[] {
  const oldParas: string[] = oldStr.split(/\n\n+/).filter(Boolean);
  const newParas: string[] = newStr.split(/\n\n+/).filter(Boolean);

  const n = oldParas.length;
  const m = newParas.length;

  const stride = m + 1;
  const dp = new Int32Array((n + 1) * stride);

  for (let i = 1; i <= n; i++) {
    const prevRow = (i - 1) * stride;
    const currRow = i * stride;
    const oldP = (oldParas[i - 1] ?? "").trim();

    for (let j = 1; j <= m; j++) {
      const newP = (newParas[j - 1] ?? "").trim();
      if (oldP === newP) {
        dp[currRow + j] = (dp[prevRow + (j - 1)] ?? 0) + 1;
      } else {
        const top = dp[prevRow + j] ?? 0;
        const left = dp[currRow + (j - 1)] ?? 0;
        dp[currRow + j] = top > left ? top : left;
      }
    }
  }

  let i = n;
  let j = m;
  const rawChunks: DiffChunk[] = [];

  while (i > 0 || j > 0) {
    const oldP = i > 0 ? (oldParas[i - 1] ?? "") : "";
    const newP = j > 0 ? (newParas[j - 1] ?? "") : "";
    const currRow = i * stride;
    const prevRow = (i - 1) * stride;

    if (i > 0 && j > 0 && oldP.trim() === newP.trim()) {
      rawChunks.push({ type: "unchanged", value: newP + "\n\n" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || (dp[currRow + (j - 1)] ?? 0) >= (dp[prevRow + j] ?? 0))) {
      rawChunks.push({ type: "added", value: newP + "\n\n", added: true });
      j--;
    } else if (i > 0 && (j === 0 || (dp[currRow + (j - 1)] ?? 0) < (dp[prevRow + j] ?? 0))) {
      rawChunks.push({ type: "removed", value: oldP + "\n\n", removed: true });
      i--;
    } else {
      break;
    }
  }

  rawChunks.reverse();
  return rawChunks;
}

