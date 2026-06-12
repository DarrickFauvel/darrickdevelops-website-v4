Ship the current changes: create a branch, commit all staged/modified files, push, open a PR, and merge it.

## Steps

1. **Check state** — run `git status` and `git diff` to understand what's changing. If there's nothing to commit, report that and stop.

2. **Branch** — if already on a feature branch (not `main`/`master`), use it. Otherwise create a new branch named after the primary change (e.g. `feat/add-image-editor`, `fix/card-layout`). Keep it short and kebab-case.

3. **Commit** — stage the changed files by name (never `git add -A` blindly — skip `.env`, secrets, binaries). Write a concise commit message focused on the *why*. Use a HEREDOC. Append:
   ```
   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   ```

4. **Push** — `git push -u origin <branch>`.

5. **PR** — create with `gh pr create`. Title under 70 chars. Body:
   ```
   ## Summary
   <bullet points>

   ## Test plan
   <checklist>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```
   Use a HEREDOC for the body.

6. **Merge** — merge with `gh pr merge --squash --auto --delete-branch`. If auto-merge isn't available, merge immediately with `gh pr merge --squash --delete-branch`.

7. **Finish** — switch back to `main` and pull: `git checkout main && git pull`.

Report the PR URL and the final merged commit.

## Rules
- Never force-push, never skip hooks (`--no-verify`).
- Never commit `.env` or credential files — warn and abort if they are staged.
- If any step fails, stop and explain what went wrong before continuing.
- Ask for confirmation before merging if the diff is large (>200 lines changed) or touches sensitive paths (auth, payments, migrations).
