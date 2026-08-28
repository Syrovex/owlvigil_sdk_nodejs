# Releasing

1. Create the `owlvigil` npm organization and connect this repository as a
   trusted publisher for `@owlvigil/sdk`. Protect the `npm` GitHub environment.
2. Update `package.json`, `package-lock.json`, the public User-Agent version,
   README, and `CHANGELOG.md` in one reviewed pull request.
3. Run `npm ci`, `npm test`, and `npm pack --dry-run` from a clean checkout.
4. Merge the release commit and create the matching signed tag, such as
   `v0.1.0`. The Release workflow publishes publicly with provenance.
5. Verify installation from npm and complete the GitHub release notes.

Do not store npm tokens in the repository; trusted publishing uses OIDC.
