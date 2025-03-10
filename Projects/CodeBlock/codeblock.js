import { getHighlighter } from "https://cdn.jsdelivr.net/npm/shiki/+esm";

// Initialize highlight.js with more languages
hljs.configure({
  languages: ['javascript', 'python', 'html', 'css', 'java', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript', 'xml']
});

async function highlightCode(code) {
  try {
    const highlighter = await getHighlighter({
      theme: "github-dark",
      langs: ["javascript", "python", "html", "css", "java", "cpp", "csharp", "php", "ruby", "go", "rust", "swift", "kotlin", "typescript", "xml"]
    });

    const codeContainer = document.getElementById("code-container");
    const language = detectLanguage(code);

    // Update language display
    document.querySelector('.language').textContent = language || 'Plain Text';

    // Highlight code
    codeContainer.innerHTML = highlighter.codeToHtml(code, {
      lang: language || 'plaintext'
    });
  } catch (error) {
    console.error("Error highlighting code:", error);
  }
}

function detectLanguage(code) {
  // First try to detect HTML
  if (code.trim().startsWith('<') && (code.includes('</') || code.includes('/>'))) {
    return 'html';
  }

  // Then try highlight.js auto-detection
  const result = hljs.highlightAuto(code);
  if (result.language) {
    return result.language;
  }

  // Additional checks for specific languages
  if (code.includes('<?php')) return 'php';
  if (code.includes('<!DOCTYPE html>')) return 'html';
  if (code.includes('@media') || code.includes('{')) return 'css';
  if (code.includes('function') || code.includes('const') || code.includes('let')) return 'javascript';
  if (code.includes('def ') || code.includes('import ')) return 'python';
  if (code.includes('class ') || code.includes('public ')) return 'java';
  if (code.includes('#include') || code.includes('int main()')) return 'cpp';
  if (code.includes('using System;')) return 'csharp';
  if (code.includes('package ')) return 'go';
  if (code.includes('fn ') || code.includes('use ')) return 'rust';
  if (code.includes('fun ') || code.includes('val ')) return 'kotlin';
  if (code.includes('interface ') || code.includes('type ')) return 'typescript';

  return null;
}

function setupCodeInput() {
  const codeInput = document.getElementById("code-input");
  const originalTabKey = true; // Set to true to use our tab handler

  if (originalTabKey) {
    // Insert tab on Tab press
    codeInput.onkeydown = function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();

        // Insert tab
        document.execCommand('insertText', false, '    ');

        // Ensure highlight updates
        const code = this.value;
        highlightCode(code);
        return false;
      }
    };
  }

  // Handle input changes
  codeInput.addEventListener("input", (e) => {
    const code = e.target.value;
    highlightCode(code);
  });

  // Handle paste events
  codeInput.addEventListener("paste", (e) => {
    // Let the paste event complete
    setTimeout(() => {
      const code = e.target.value;
      highlightCode(code);
    }, 0);
  });

  // Set initial focus
  setTimeout(() => {
    codeInput.focus();
  }, 100);

  // Make sure textarea gets focus when clicked
  document.querySelector('.code-input-wrapper').addEventListener('click', () => {
    codeInput.focus();
  });
}

function setupCopyButton() {
  const copyBtn = document.querySelector(".copy-btn");
  const copyIcon = copyBtn.querySelector(".copy-icon");
  const copyText = copyBtn.querySelector(".copy-text");

  copyBtn.addEventListener("click", async () => {
    const code = document.getElementById("code-input").value;
    try {
      await navigator.clipboard.writeText(code);

      // Visual feedback
      copyBtn.classList.add("copied");
      copyIcon.textContent = "✓";
      copyText.textContent = "Copied!";

      // Reset after 2 seconds
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyIcon.textContent = "📋";
        copyText.textContent = "Copy";
      }, 2000);
    } catch (error) {
      console.error("Error copying code:", error);

      // Error feedback
      copyBtn.classList.add("error");
      copyText.textContent = "Failed";

      // Reset after 2 seconds
      setTimeout(() => {
        copyBtn.classList.remove("error");
        copyText.textContent = "Copy";
      }, 2000);
    }
  });
}

// Initialize
setupCodeInput();
setupCopyButton();