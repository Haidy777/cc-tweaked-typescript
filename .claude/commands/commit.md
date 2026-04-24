Look at the current changes using `git diff`, `git diff --cached`, and `git status`, then create a commit.

## Rules

- Use conventional commit format: `type(scope): description`
  - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `build`
  - Scope is optional but encouraged (e.g. `feat(bot):`, `fix(navigation):`, `chore(deps):`)
- Keep the subject line under 72 characters
- Use imperative mood ("add feature" not "added feature")
- Add a body if the change needs explanation (separated by blank line)
- Only stage files related to the change — don't `git add -A` blindly
- Never stage `.env`, credentials, or secrets
- If `$ARGUMENTS` is provided, use it as guidance for the commit message
