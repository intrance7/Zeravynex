import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('utils.ts - cn() pure function', () => {
  describe('Basic Class Merging', () => {
    it('returns an empty string when called with no arguments', () => {
      expect(cn()).toBe('');
    });

    it('returns a single class name untouched', () => {
      expect(cn('btn')).toBe('btn');
    });

    it('merges multiple string class names separated by spaces', () => {
      expect(cn('btn', 'btn-primary', 'active')).toBe('btn btn-primary active');
    });
  });

  describe('Falsy and Empty Value Filtering', () => {
    it('filters out null, undefined, false, and empty string arguments', () => {
      expect(cn('base', null, undefined, false, '', 'active')).toBe('base active');
    });

    it('returns empty string when only falsy arguments are provided', () => {
      expect(cn(null, undefined, false, '')).toBe('');
    });

    it('handles boolean conditional expressions cleanly', () => {
      const isVisible = false;
      const isExpanded = true;
      expect(cn('panel', isVisible && 'visible', isExpanded && 'expanded')).toBe('panel expanded');
    });
  });

  describe('Conditional Objects', () => {
    it('applies classes where object value is true and omits where false', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'font-bold': true,
      });
      expect(result).toBe('text-red-500 font-bold');
    });

    it('handles multiple object arguments', () => {
      expect(cn({ a: true }, { b: false }, { c: true })).toBe('a c');
    });

    it('handles objects combined with string arguments', () => {
      expect(cn('btn', { 'btn-disabled': true, 'btn-loading': false })).toBe('btn btn-disabled');
    });
  });

  describe('Arrays and Nested Collections', () => {
    it('flattens array inputs', () => {
      expect(cn(['flex', 'items-center'])).toBe('flex items-center');
    });

    it('flattens deeply nested arrays of class names', () => {
      expect(cn(['flex', ['items-center', ['justify-between', 'gap-2']]])).toBe(
        'flex items-center justify-between gap-2'
      );
    });

    it('handles arrays containing objects, strings, and falsy values', () => {
      expect(cn(['base', null, { active: true, hidden: false }])).toBe('base active');
    });
  });

  describe('Tailwind Merge Conflict Resolution', () => {
    it('resolves conflicting padding utilities with the latter taking precedence', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('px-2 py-4', 'px-6')).toBe('py-4 px-6');
    });

    it('resolves conflicting margin utilities', () => {
      expect(cn('m-2', 'm-4', 'mt-8')).toBe('m-4 mt-8');
    });

    it('resolves conflicting text colors', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('resolves conflicting background colors', () => {
      expect(cn('bg-red-500', 'bg-emerald-600')).toBe('bg-emerald-600');
    });

    it('resolves conflicting display utilities', () => {
      expect(cn('block', 'inline-block', 'flex')).toBe('flex');
    });

    it('resolves conflicting font size utilities', () => {
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    });

    it('resolves conflicting border radius utilities', () => {
      expect(cn('rounded-sm', 'rounded-lg')).toBe('rounded-lg');
    });

    it('preserves pseudo-class modifier variants without false collisions', () => {
      const result = cn('bg-white', 'hover:bg-gray-100', 'focus:ring-2', 'bg-slate-900');
      expect(result).toBe('hover:bg-gray-100 focus:ring-2 bg-slate-900');
    });

    it('resolves conflicting classes within the same responsive breakpoint', () => {
      expect(cn('sm:p-2', 'sm:p-4')).toBe('sm:p-4');
      expect(cn('p-2', 'sm:p-4')).toBe('p-2 sm:p-4');
    });
  });

  describe('Real-World Component Patterns', () => {
    it('supports button variant override pattern typical of design system components', () => {
      const baseButtonStyles = 'inline-flex items-center justify-center rounded-md font-medium px-4 py-2 bg-primary text-primary-foreground';
      const customOverride = 'px-6 bg-destructive';

      const result = cn(baseButtonStyles, customOverride);

      expect(result).toContain('px-6');
      expect(result).toContain('bg-destructive');
      expect(result).not.toContain('px-4');
      expect(result).not.toContain('bg-primary');
    });

    it('handles mixed combination of arrays, objects, strings, and conditionals', () => {
      const isError = true;
      const isLarge = false;

      const result = cn(
        'card',
        ['shadow-sm', { 'border-destructive': isError }],
        { 'p-6': isLarge, 'p-4': !isLarge },
        undefined,
        'hover:shadow-md'
      );

      expect(result).toBe('card shadow-sm border-destructive p-4 hover:shadow-md');
    });
  });
});
