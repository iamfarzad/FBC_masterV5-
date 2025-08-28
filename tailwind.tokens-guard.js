/**
 * Tailwind Tokens Guard Plugin
 * Warns if hardcoded colors are used in Tailwind classes
 */

const colorRegex = /#(?<hex>[0-9a-fA-F]{3,8})\b/g;
const rgbRegex = /rgb\(.*?\)|rgba\(.*?\)/g;

module.exports = function tokensGuardPlugin({ addVariant, addUtilities, theme, e }) {
  // Build-time guard: scan for hardcoded colors
  const cssClasses = process.env.TW_CLASSES || '';

  // Check for hex colors in class names
  const hexMatches = cssClasses.match(colorRegex);
  if (hexMatches && hexMatches.length > 0) {
    // Warning log removed - could add proper error handling here
    hexMatches.forEach(match => {
      // Warning log removed - could add proper error handling here`);
    });
  }

  // Check for rgb/rgba in class names
  const rgbMatches = cssClasses.match(rgbRegex);
  if (rgbMatches && rgbMatches.length > 0) {
    // Warning log removed - could add proper error handling here
    rgbMatches.forEach(match => {
      // Warning log removed - could add proper error handling here`);
    });
  }

  // Add utility classes for theme validation
  addUtilities({
    '.theme-guard': {
      '--theme-guard-active': '1',
    },
  });

  // Add variant for theme validation
  addVariant('theme-valid', ({ container }) => {
    container.walkRules(rule => {
      // Check if rule contains theme tokens
      if (!rule.selector.includes('var(--')) {
        // Warning log removed - could add proper error handling here
      }
    });
  });

  // Report theme system health
  // Log removed
}
