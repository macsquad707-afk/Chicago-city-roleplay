# Mod Panel: agent rules

## No JavaScript pop-ups

Never use the browser's built-in dialogs: `alert()`, `confirm()` or `prompt()`. They block the page, can't be styled, and look out of place in the panel.

Use the in-page pop-ups in `panel.js` instead:

- `toast(message)`: short messages and errors. Replaces `alert()`.
- `await ask({ title, text, ok, no, danger, input })`: confirmations and simple text input. Resolves to `true` (confirmed), the typed text (when `input` is set), or `null` (cancelled). Replaces `confirm()` and `prompt()`. Set `danger: true` for destructive actions.
- `openForm(title, sub, body, submitLabel, onSubmit)`: dialogs with several fields. If `onSubmit` throws, the error shows inside the dialog.

If none of these fit, build a new in-page pop-up that matches the existing `.modal` styles. Do not fall back to a native dialog.

## Icons

Use Lucide icons only. Add them to the `ICONS` map in `panel.js` by pasting the inner SVG markup from lucide.dev (no `<svg>` wrapper), then render them with `ico("name")`. Don't draw icons by hand and don't mix in other icon sets.
