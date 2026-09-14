# Releasing

The release workflow publishes `@owlvigil/sdk` to npm through npm Trusted
Publishing (OIDC). It does not use an npm token stored in GitHub Secrets.

## One-time Admin setup

1. Create the npm organization/package namespace and configure a pending Trusted
   Publisher for `@owlvigil/sdk`:
   - GitHub owner: `Syrovex`
   - Repository: `owlvigil_sdk_nodejs`
   - Workflow: `release.yml`
   - Environment: `npm`
2. Create the GitHub `npm` environment and protect it with the desired review or
   branch policy. The environment name must exactly match the npm publisher.
3. Keep the package public. `publishConfig.access` is `public` and
   `publishConfig.provenance` is enabled in `package.json`.

Do not create or store a long-lived npm token when Trusted Publishing is
available.

## Version release

1. Update `package.json`, `package-lock.json`, the public User-Agent version,
   README, and `CHANGELOG.md` in one reviewed change. The tag and package
   version must match.
2. Run verification locally:

   ```bash
   npm ci
   npm run check
   npm pack --dry-run
   ```

   `check` compiles and tests the package, validates the generated Management
   catalog, checks examples, and inspects package contents. When the private
   OpenAPI repository is available, set `OWLVIGIL_OPENAPI_SPEC` to its
   `api/swagger.json` for full contract validation; otherwise the committed
   public contract snapshot is checked.

3. Merge the release commit to `main` and create an annotated tag:

   ```bash
   git tag -a v0.2.1 -m "Release v0.2.1"
   git push origin v0.2.1
   ```

4. The `v*` tag triggers `.github/workflows/release.yml`. The workflow checks
   semver, that the tag commit is already on `main`, changelog/version
   alignment, tests, the generated Management contract, examples, package
   contents, and then runs `npm publish --access public --provenance`.
5. Verify the public registry:

   ```bash
   npm view @owlvigil/sdk version dist-tags
   npm install @owlvigil/sdk@<version>
   ```

An ordinary annotated tag is accepted by the workflow; GitHub GPG verification
is not required. Release authorization comes from the protected GitHub
environment and npm Trusted Publisher configuration.
