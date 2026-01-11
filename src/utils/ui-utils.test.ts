import { describe, it, expect } from 'vitest';
import { getSelectLabel } from './ui-utils';

describe('ui-utils', () => {
  describe('getSelectLabel', () => {
    it('returns the label when value matches an option', () => {
      const field = {
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
        ],
      };
      expect(getSelectLabel(field, 'opt2')).toBe('Option 2');
    });

    it('returns the value as string when no option matches', () => {
      const field = {
        options: [{ label: 'Option 1', value: 'opt1' }],
      };
      expect(getSelectLabel(field, 'unknown')).toBe('unknown');
    });

    it('returns value converted to string when options are undefined', () => {
      const field = {};
      expect(getSelectLabel(field, 123)).toBe('123');
    });
  });
});
