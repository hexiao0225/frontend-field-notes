# Field Notes: Component Playground

## Key Takeaways

1. **Compound components use Context internally but expose a clean API externally.** The consumer sees `<Tabs.Tab value="x">` — they don't need to know Context exists underneath.

2. **`useId()` is essential for accessible components.** Every ARIA relationship (`aria-labelledby`, `aria-describedby`, `aria-controls`) needs stable, unique IDs. React 18's `useId` handles this elegantly.

3. **Roving tabindex > managing focus manually.** For Tabs and Dropdown, only the active item has `tabindex="0"`. Others get `tabindex="-1"`. This lets arrow keys control which item is focusable without fighting the browser.

4. **Focus trap edge case: dynamic content.** If modal content changes (e.g., a form step), the focusable elements list becomes stale. Solution: query focusables at keyboard event time, not just on mount.

5. **Click-outside handlers should use `mousedown`, not `click`.** Click fires after mouseup, which can cause issues if the trigger toggles visibility. Mousedown fires earlier and prevents race conditions.

6. **Toast queues need FIFO eviction.** When at max capacity, remove the oldest toast to make room. This feels more natural than rejecting new toasts.

7. **`aria-live="polite"` announces without interrupting.** For toasts, a separate visually-hidden live region works better than putting `aria-live` on each toast item.

8. **Form validation timing matters.** Validate on blur (not on every keystroke) to avoid frustrating users mid-typing. Re-validate on change only if already showing an error.

9. **Controlled/uncontrolled is about who owns the truth.** The `useControllable` hook pattern: if `value` prop is passed, use it; otherwise, use internal state. Always call `onChange` so parent can react.

10. **Portal rendering puts modals at document.body.** This breaks out of parent stacking contexts and z-index issues. Remember to handle SSR (no `document` on server).

## Patterns Worth Remembering

```tsx
// Compound component export pattern
const TabsComponent = Object.assign(Tabs, {
  List: TabsList,
  Tab: Tab,
  Panel: TabPanel,
});
export { TabsComponent as Tabs };

// Controlled/uncontrolled hook
const [value, setValue] = useControllable({
  value: controlledValue,
  defaultValue,
  onChange,
});

// Focus trap selector
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
```

## What I'd Do Differently

- Add exit animations (currently only enter animations work smoothly)
- Consider `floating-ui` for dropdown positioning near viewport edges
- Add `forwardRef` to all components for better composition
- Extract a shared `useKeyboardNavigation` hook for Tabs + Dropdown
