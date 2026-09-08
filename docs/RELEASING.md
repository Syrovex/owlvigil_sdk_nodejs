# Releasing

1. Create the `owlvigil` npm organization and connect this repository as a
   trusted publisher for `@owlvigil/sdk`. Protect the `npm` GitHub environment.
2. Update `package.json`, `package-lock.json`, the public User-Agent version,
   README, and `CHANGELOG.md` in one reviewed pull request.
3. Run `npm ci` and `npm run check` from a clean checkout. `check` compiles and
   tests the package, validates the generated OpenAPI Management catalog, and
   runs `npm pack --dry-run`. When the private OpenAPI repository is available,
   set `OWLVIGIL_OPENAPI_SPEC` to its `api/swagger.json` for full contract
   validation; otherwise the committed public contract snapshot is checked.
4. Merge the release commit and create the matching signed tag, such as
   `v0.2.0`. The Release workflow publishes publicly with provenance.
5. Verify installation from npm and complete the GitHub release notes.

Do not store npm tokens in the repository; trusted publishing uses OIDC.
