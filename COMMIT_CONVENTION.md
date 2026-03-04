# Commit Convention

## Format

```
<type>: <description>
```

Single line, no body or footer required.

## Types

| Type | Usage |
|------|-------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, or tooling changes |

## Rules

1. Use **English** for all commit messages
2. Use lowercase for the description (e.g. `feat: add biometric unlock toggle in user settings`)
3. Keep the description concise and under 72 characters
4. Use imperative mood (e.g. "add" not "added", "fix" not "fixed")
5. No period at the end

## Examples

```
feat: add Touch ID biometric unlock backend
feat: add i18n translations for biometric unlock feature
fix: prevent quick search window from stealing focus
chore: add biometric cache to gitignore
docs: update README with new features
refactor: extract common window logic to base class
```
