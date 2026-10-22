# Mod Panel: agent rules

The site is a SvelteKit app (Svelte 5, TypeScript) in `web/`. `backend.py` (Flask) is the API and serves the built app from `web/build`, so run `cd web && npm run build` after front-end changes. The panel lives in `web/src/lib/panel/`.

## No JavaScript pop-ups

Never use the browser's built-in dialogs: `alert()`, `confirm()` or `prompt()`. They block the page, can't be styled, and look out of place in the panel.

Use the in-page pop-ups in `web/src/lib/panel/` instead:

- `toast(message)` from `dialogs.svelte.ts`: short messages and errors. Replaces `alert()`.
- `await ask({ title, text, ok, no, danger, input })` from `dialogs.svelte.ts`: confirmations and simple text input. Resolves to `true` (confirmed), the typed text (when `input` is set), or `null` (cancelled). Replaces `confirm()` and `prompt()`. Set `danger: true` for destructive actions.
- `<FormDialog title sub submitLabel onsubmit onclose>` (`FormDialog.svelte`): dialogs with several fields. If `onsubmit` throws, the error shows inside the dialog.

If none of these fit, build a new in-page pop-up that matches the existing `.modal` styles, with `use:portal` and `use:trap` from `actions.ts`. Do not fall back to a native dialog.

## Icons

Use Lucide icons only. Add them to the `ICONS` map in `web/src/lib/panel/icons.ts` by pasting the inner SVG markup from lucide.dev (no `<svg>` wrapper), then render them with `<Icon name="..." />`. Don't draw icons by hand and don't mix in other icon sets.
