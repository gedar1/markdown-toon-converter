import { describe, it, expect } from 'vitest';
import { TokenMetricsServiceImpl } from './TokenMetricsServiceImpl';

describe('TokenMetricsServiceImpl', () => {
  const service = new TokenMetricsServiceImpl();

  describe('calculate', () => {
    it('should calculate token counts for TOON and Markdown', () => {
      const toonContent = `--- users
id | name | email
1 | Alice | alice@example.com
2 | Bob | bob@example.com`;

      const markdownContent = `## users

| id | name | email |
| --- | --- | --- |
| 1 | Alice | alice@example.com |
| 2 | Bob | bob@example.com |`;

      const metrics = service.calculate(toonContent, markdownContent);

      expect(metrics.toonTokens).toBeGreaterThan(0);
      expect(metrics.markdownTokens).toBeGreaterThan(0);
      expect(metrics.markdownTokens).toBeGreaterThan(metrics.toonTokens);
    });

    it('should calculate savings percentage correctly', () => {
      const toonContent = `--- test
a | b
1 | 2`;

      const markdownContent = `## test

| a | b |
| --- | --- |
| 1 | 2 |`;

      const metrics = service.calculate(toonContent, markdownContent);

      // Markdown should have more tokens due to extra pipes and dashes
      expect(metrics.savingsPercent).toBeGreaterThan(0);
      expect(metrics.savingsPercent).toBeLessThanOrEqual(100);
    });

    it('should calculate file sizes in bytes', () => {
      const toonContent = `--- users
id | name
1 | Alice`;

      const markdownContent = `## users

| id | name |
| --- | --- |
| 1 | Alice |`;

      const metrics = service.calculate(toonContent, markdownContent);

      expect(metrics.toonBytes).toBeGreaterThan(0);
      expect(metrics.markdownBytes).toBeGreaterThan(0);
      expect(metrics.markdownBytes).toBeGreaterThan(metrics.toonBytes);
    });

    it('should handle empty content', () => {
      const metrics = service.calculate('', '');

      expect(metrics.toonTokens).toBe(0);
      expect(metrics.markdownTokens).toBe(0);
      expect(metrics.savingsPercent).toBe(0);
      expect(metrics.toonBytes).toBe(0);
      expect(metrics.markdownBytes).toBe(0);
    });

    it('should handle content with only whitespace', () => {
      const metrics = service.calculate('   \n\t  ', '   \n\t  ');

      expect(metrics.toonTokens).toBe(0);
      expect(metrics.markdownTokens).toBe(0);
      expect(metrics.savingsPercent).toBe(0);
    });

    it('should tokenize consistently regardless of whitespace variations', () => {
      const toon1 = 'a | b | c';
      const toon2 = 'a|b|c';
      const toon3 = 'a  |  b  |  c';

      const md = 'x y z';

      const metrics1 = service.calculate(toon1, md);
      const metrics2 = service.calculate(toon2, md);
      const metrics3 = service.calculate(toon3, md);

      // All should have same token count (a, b, c = 3 tokens)
      expect(metrics1.toonTokens).toBe(3);
      expect(metrics2.toonTokens).toBe(3);
      expect(metrics3.toonTokens).toBe(3);
    });

    it('should handle zero markdown tokens gracefully', () => {
      const toonContent = 'a | b | c';
      const markdownContent = '';

      const metrics = service.calculate(toonContent, markdownContent);

      expect(metrics.toonTokens).toBe(3);
      expect(metrics.markdownTokens).toBe(0);
      expect(metrics.savingsPercent).toBe(0); // No savings when markdown is empty
    });

    it('should calculate correct savings when TOON has fewer tokens', () => {
      // TOON: 5 tokens (test, a, b, 1, 2)
      const toonContent = `--- test
a | b
1 | 2`;

      // Markdown: 10 tokens (test, a, b, 1, 2, plus separators)
      const markdownContent = `## test

| a | b |
| --- | --- |
| 1 | 2 |`;

      const metrics = service.calculate(toonContent, markdownContent);

      // Should show positive savings
      expect(metrics.savingsPercent).toBeGreaterThan(0);
      
      // Verify the calculation: (markdown - toon) / markdown * 100
      const expectedSavings = Math.round(
        ((metrics.markdownTokens - metrics.toonTokens) / metrics.markdownTokens) * 100
      );
      expect(metrics.savingsPercent).toBe(expectedSavings);
    });

    it('should handle UTF-8 characters in file size calculation', () => {
      const toonContent = '--- test\némoji | text\n😀 | hello';
      const markdownContent = '## test\n\n| emoji | text |\n| --- | --- |\n| 😀 | hello |';

      const metrics = service.calculate(toonContent, markdownContent);

      // Emoji takes multiple bytes in UTF-8
      expect(metrics.toonBytes).toBeGreaterThan(toonContent.length);
      expect(metrics.markdownBytes).toBeGreaterThan(markdownContent.length);
    });

    it('should handle multiple tables in content', () => {
      const toonContent = `--- table1
a | b
1 | 2

--- table2
x | y
3 | 4`;

      const markdownContent = `## table1

| a | b |
| --- | --- |
| 1 | 2 |

## table2

| x | y |
| --- | --- |
| 3 | 4 |`;

      const metrics = service.calculate(toonContent, markdownContent);

      expect(metrics.toonTokens).toBeGreaterThan(0);
      expect(metrics.markdownTokens).toBeGreaterThan(0);
      expect(metrics.savingsPercent).toBeGreaterThan(0);
    });

    it('should produce deterministic results for same input', () => {
      const toonContent = '--- test\na | b\n1 | 2';
      const markdownContent = '## test\n\n| a | b |\n| --- | --- |\n| 1 | 2 |';

      const metrics1 = service.calculate(toonContent, markdownContent);
      const metrics2 = service.calculate(toonContent, markdownContent);
      const metrics3 = service.calculate(toonContent, markdownContent);

      expect(metrics1).toEqual(metrics2);
      expect(metrics2).toEqual(metrics3);
    });
  });
});
