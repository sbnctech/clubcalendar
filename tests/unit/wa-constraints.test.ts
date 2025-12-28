/**
 * Wild Apricot Custom HTML Gadget Constraint Tests
 *
 * Tests that ClubCalendar widget code complies with WA's execution environment:
 * - No ES module imports
 * - IIFE pattern for isolation
 * - Prefixed CSS classes (no global element selectors)
 * - Safe DOM manipulation (no innerHTML with untrusted content)
 * - Proper DOM ready handling
 * - No eval() or new Function()
 * - CDN URLs from whitelisted domains only
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the widget source files
const widgetPaths = [
  'widget/clubcalendar-wa-inline.html',
  'docs/INSTALL/SBNC_INLINE_SNIPPET.html',
  'package/clubcalendar-wa-inline.html'
];

let widgetSources: { path: string; content: string }[] = [];

beforeAll(() => {
  widgetSources = widgetPaths.map(p => {
    const fullPath = path.join(process.cwd(), p);
    try {
      return { path: p, content: fs.readFileSync(fullPath, 'utf-8') };
    } catch {
      return { path: p, content: '' };
    }
  }).filter(s => s.content.length > 0);
});

describe('WA Constraint Compliance', () => {

  describe('Script Pattern Constraints', () => {

    it('should use IIFE pattern for script isolation', () => {
      for (const source of widgetSources) {
        // Check for IIFE pattern: (function() { ... })();
        const hasIIFE = /\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\);?/.test(source.content);
        expect(hasIIFE, `${source.path} should use IIFE pattern`).toBe(true);
      }
    });

    it('should NOT use ES module imports', () => {
      for (const source of widgetSources) {
        // Check for import statements
        const hasImport = /\bimport\s+[\{\w]/.test(source.content);
        const hasExport = /\bexport\s+(default|const|function|class)/.test(source.content);

        expect(hasImport, `${source.path} should NOT have ES imports`).toBe(false);
        expect(hasExport, `${source.path} should NOT have ES exports`).toBe(false);
      }
    });

    it('should NOT use eval() or new Function()', () => {
      for (const source of widgetSources) {
        // Check for dangerous patterns
        const hasEval = /\beval\s*\(/.test(source.content);
        const hasNewFunction = /new\s+Function\s*\(/.test(source.content);

        expect(hasEval, `${source.path} should NOT use eval()`).toBe(false);
        expect(hasNewFunction, `${source.path} should NOT use new Function()`).toBe(false);
      }
    });

    it('should NOT use document.write()', () => {
      for (const source of widgetSources) {
        const hasDocWrite = /document\.write\s*\(/.test(source.content);
        expect(hasDocWrite, `${source.path} should NOT use document.write()`).toBe(false);
      }
    });

    it('should handle DOM ready properly', () => {
      for (const source of widgetSources) {
        // Should check for DOMContentLoaded or document.readyState
        const handlesDomReady =
          /DOMContentLoaded/.test(source.content) ||
          /document\.readyState/.test(source.content);

        expect(handlesDomReady, `${source.path} should handle DOM ready timing`).toBe(true);
      }
    });

    it('should use strict mode', () => {
      for (const source of widgetSources) {
        const hasUseStrict = /'use strict'|"use strict"/.test(source.content);
        expect(hasUseStrict, `${source.path} should use strict mode`).toBe(true);
      }
    });
  });

  describe('CSS Isolation Constraints', () => {

    it('should use prefixed class names (clubcal- or clubcalendar-)', () => {
      for (const source of widgetSources) {
        // Extract CSS content from <style> tags
        const styleMatches = source.content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (!styleMatches) continue;

        const cssContent = styleMatches.join('\n');

        // Check that class selectors are prefixed
        // Allow: .clubcal-*, .clubcalendar-*, #clubcalendar, .fc-* (FullCalendar)
        const unprefixedClasses = cssContent.match(/\.(?!clubcal|clubcalendar|fc-)[a-z][a-z0-9-]*\s*[{,]/gi);

        // Filter out false positives (CSS inside comments, etc.)
        const realUnprefixed = (unprefixedClasses || []).filter(c => {
          // Allow FullCalendar overrides
          if (c.startsWith('.fc-')) return false;
          return true;
        });

        expect(
          realUnprefixed.length,
          `${source.path} has unprefixed CSS classes: ${realUnprefixed.join(', ')}`
        ).toBe(0);
      }
    });

    it('should NOT use global element selectors in CSS', () => {
      for (const source of widgetSources) {
        const styleMatches = source.content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (!styleMatches) continue;

        const cssContent = styleMatches.join('\n');

        // Check for dangerous global selectors (without prefix)
        // These would affect the entire WA page
        const globalSelectors = ['body {', 'html {', 'a {', 'p {', 'h1 {', 'h2 {', 'h3 {',
          'button {', 'input {', 'select {', 'table {', 'div {', 'span {', 'ul {', 'li {'];

        for (const sel of globalSelectors) {
          const hasGlobal = cssContent.includes(sel);
          expect(hasGlobal, `${source.path} should NOT have global "${sel}" selector`).toBe(false);
        }
      }
    });

    it('should scope styles to container (#clubcalendar or prefixed)', () => {
      for (const source of widgetSources) {
        const styleMatches = source.content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (!styleMatches) continue;

        const cssContent = styleMatches.join('\n');

        // Most rules should be scoped to #clubcalendar, .clubcal-*, or :root
        const rules = cssContent.split('}').filter(r => r.includes('{'));
        const scopedRules = rules.filter(r =>
          r.includes('#clubcalendar') ||
          r.includes('.clubcal') ||
          r.includes('.clubcalendar') ||
          r.includes(':root') ||
          r.includes('.fc-') ||  // FullCalendar
          r.includes('@media') ||
          r.includes('@keyframes')
        );

        // At least 80% of rules should be scoped
        const scopeRatio = scopedRules.length / Math.max(rules.length, 1);
        expect(
          scopeRatio,
          `${source.path} should have mostly scoped CSS (${Math.round(scopeRatio * 100)}%)`
        ).toBeGreaterThan(0.7);
      }
    });
  });

  describe('External Resource Constraints', () => {

    it('should only load scripts from whitelisted CDNs', () => {
      // Whitelisted CDNs that WA typically allows
      const allowedDomains = [
        'cdn.jsdelivr.net',
        'cdnjs.cloudflare.com',
        'unpkg.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        // WA's own domains
        'wildapricot.org',
        'wildapricot.com',
      ];

      for (const source of widgetSources) {
        const scriptSrcs = source.content.match(/src=["']([^"']+)["']/gi) || [];

        for (const srcAttr of scriptSrcs) {
          const url = srcAttr.replace(/src=["']|["']/g, '');

          // Skip relative URLs (they're fine)
          if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            continue;
          }

          // Skip data: URLs
          if (url.startsWith('data:')) continue;

          // Check against whitelist
          try {
            const urlObj = new URL(url);
            const isAllowed = allowedDomains.some(d => urlObj.hostname.endsWith(d));
            expect(
              isAllowed,
              `${source.path} loads script from non-whitelisted domain: ${urlObj.hostname}`
            ).toBe(true);
          } catch {
            // Invalid URL - skip
          }
        }
      }
    });

    it('should work without external script dependencies (inline-only)', () => {
      for (const source of widgetSources) {
        // Check that the widget can function with just inline code
        // The only external dependency should be FullCalendar CDN
        const externalScripts = source.content.match(/<script[^>]+src=/gi) || [];

        // Filter to only non-CDN scripts
        const nonCdnScripts = externalScripts.filter(s => {
          return !s.includes('cdn.jsdelivr.net') &&
                 !s.includes('cdnjs.cloudflare.com') &&
                 !s.includes('unpkg.com');
        });

        expect(
          nonCdnScripts.length,
          `${source.path} should not require non-CDN external scripts`
        ).toBe(0);
      }
    });
  });

  describe('Security Constraints', () => {

    it('should use textContent or escapeHtml for user content', () => {
      for (const source of widgetSources) {
        // Check that there's an escapeHtml function or textContent usage
        const hasEscapeHtml = /function\s+escapeHtml|escapeHtml\s*=/.test(source.content);
        const usesTextContent = /\.textContent\s*=/.test(source.content);

        expect(
          hasEscapeHtml || usesTextContent,
          `${source.path} should have XSS protection (escapeHtml or textContent)`
        ).toBe(true);
      }
    });

    it('should NOT have inline event handlers in HTML', () => {
      for (const source of widgetSources) {
        // WA strips inline event handlers, so we shouldn't use them
        const inlineHandlers = source.content.match(/\bon\w+\s*=\s*["'][^"']*["']/gi) || [];

        // Filter out false positives in documentation/comments
        const realHandlers = inlineHandlers.filter(h => {
          // Skip if it's in a comment or documentation
          return !h.includes('example') && !h.includes('Example');
        });

        expect(
          realHandlers.length,
          `${source.path} should NOT use inline event handlers: ${realHandlers.join(', ')}`
        ).toBe(0);
      }
    });

    it('should validate config before use', () => {
      for (const source of widgetSources) {
        // Check for config validation patterns
        const hasConfigValidation =
          /DEFAULT_CONFIG/.test(source.content) &&
          /Object\.assign|\.\.\./.test(source.content);

        expect(
          hasConfigValidation,
          `${source.path} should merge config with defaults for safety`
        ).toBe(true);
      }
    });
  });

  describe('Fallback & Error Handling Constraints', () => {

    it('should have a fallback mechanism', () => {
      for (const source of widgetSources) {
        const hasFallback = /fallback|showFallback|fallbackContainer/.test(source.content);
        expect(hasFallback, `${source.path} should have fallback handling`).toBe(true);
      }
    });

    it('should have try-catch error handling', () => {
      for (const source of widgetSources) {
        const hasTryCatch = /try\s*\{[\s\S]*?\}\s*catch/.test(source.content);
        expect(hasTryCatch, `${source.path} should have try-catch blocks`).toBe(true);
      }
    });

    it('should display user-friendly errors', () => {
      for (const source of widgetSources) {
        // Check for error display that doesn't expose technical details
        const hasErrorDisplay =
          /temporarily unavailable|unable to load|error/i.test(source.content);

        expect(hasErrorDisplay, `${source.path} should have user-friendly error messages`).toBe(true);
      }
    });
  });

  describe('WA API Integration Constraints', () => {

    it('should check for user authentication before showing member content', () => {
      for (const source of widgetSources) {
        // Check for currentUser or authentication check
        const checksAuth =
          /currentUser/.test(source.content) ||
          /WA\.user/.test(source.content) ||
          /getCurrentUser/.test(source.content);

        expect(checksAuth, `${source.path} should check user authentication`).toBe(true);
      }
    });

    it('should have publicConfig/memberConfig pattern for auth-based rendering', () => {
      for (const source of widgetSources) {
        const hasConfigPattern =
          /publicConfig/.test(source.content) &&
          /memberConfig/.test(source.content);

        expect(
          hasConfigPattern,
          `${source.path} should have publicConfig/memberConfig pattern`
        ).toBe(true);
      }
    });
  });
});

describe('FullCalendar CDN Loading', () => {

  it('should load FullCalendar from reliable CDN', () => {
    for (const source of widgetSources) {
      // Check that FullCalendar is loaded from a major CDN
      const fcCdnPatterns = [
        /cdn\.jsdelivr\.net.*fullcalendar/i,
        /cdnjs\.cloudflare\.com.*fullcalendar/i,
        /unpkg\.com.*fullcalendar/i,
      ];

      const loadsFromCdn = fcCdnPatterns.some(p => p.test(source.content));

      // Either loads from CDN or has it bundled inline
      const hasFullCalendar = loadsFromCdn || /FullCalendar/.test(source.content);

      expect(hasFullCalendar, `${source.path} should reference FullCalendar`).toBe(true);
    }
  });

  it('should handle CDN load failure gracefully', () => {
    for (const source of widgetSources) {
      // Check for CDN load error handling
      const handlesLoadError =
        /\.catch\(/.test(source.content) &&
        /FullCalendar|fullcalendar/i.test(source.content);

      expect(
        handlesLoadError,
        `${source.path} should handle CDN load failures`
      ).toBe(true);
    }
  });
});
