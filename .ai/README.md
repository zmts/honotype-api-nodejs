- [en/](en/) — English document versions referenced by `AGENTS.md`.
- [ru/](ru/) — corresponding Russian versions.

| Document | English | Russian |
|---|---|---|
| Architecture | [architecture.md](en/architecture.md) | [architecture.md](ru/architecture.md) |
| Code quality | [code-quality.md](en/code-quality.md) | [code-quality.md](ru/code-quality.md) |
| Clean code | [clean-code-rules.md](en/clean-code-rules.md) | [clean-code-rules.md](ru/clean-code-rules.md) |
| JavaScript | [javascript-best-practices.md](en/javascript-best-practices.md) | [javascript-best-practices.md](ru/javascript-best-practices.md) |
| TypeScript | [typescript-best-practices.md](en/typescript-best-practices.md) | [typescript-best-practices.md](ru/typescript-best-practices.md) |
| Migrations | [migrations.md](en/migrations.md) | [migrations.md](ru/migrations.md) |

## Required Synchronization

- Whenever documents change, update both versions in `en/` and `ru/` together in the same change. This applies to adding, editing, renaming, moving, and deleting documents.
- Keep the same file sets and relative paths in both directories. Requirements, exceptions, structure, and examples must have the same meaning; translation must not change the strength of the rules.
- Update links in both versions. Links between localized documents must point to documents in the same language; links from `AGENTS.md` must point only to `en/`.
- Update this index when the document set or locations change. Do not consider the work complete until both language versions agree and links have been checked.
