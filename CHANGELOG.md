# Changelog

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and uses [Semantic Versioning](https://semver.org/). During the 0.x preview,
minor releases may include announced breaking changes.

## [Unreleased]

## [0.2.1] - 2026-09-14

### Fixed

- Preserve explicit custom service URLs in local mode instead of redirecting
  them to hard-coded local ports.
- Allow caller cancellation to interrupt retry backoff after a timed-out
  attempt, and reject overrides for all SDK-managed headers.
- Correct the Management OpenAPI example to use the published `get_workspaces`
  operation ID.

### Documentation

- Add parallel English and Simplified Chinese ten-chapter guides based on the
  Go SDK documentation hierarchy.
- Document separate Gateway and Management credentials, generated Management
  operations, OAuth2, streaming, safe retries, and Webhook verification.
- Include both language directories in the published npm package.

## [0.2.0] - 2026-08-28

### Added

- Typed Gateway helpers for models, chat completions, Responses, embeddings,
  Anthropic Messages, and Server-Sent Events.
- OAuth 2.0 authorization-code, refresh-token, client-credentials, token
  revocation, and user-info flows.
- A generated, checked-in Management OpenAPI catalog with 144 operations and
  generated TypeScript schema types.
- Generated camelCase Management convenience methods for all 144 catalog
  operations, plus resource-oriented aliases for common workflows.
- Consistent SDK error handling for API, OAuth, transport, timeout, and
  malformed-response failures.
- Initial Gateway, Management, streaming, error-handling, retry, and webhook
  functionality.
- Open-source governance, CI, packaging, and release configuration.

### Changed

- Added Node.js 20/22/24 CI coverage, package smoke checks, and a public
  Management contract snapshot so CI does not depend on a private API repo.

[Unreleased]: https://github.com/Syrovex/owlvigil_sdk_nodejs/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/Syrovex/owlvigil_sdk_nodejs/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Syrovex/owlvigil_sdk_nodejs/releases/tag/v0.2.0
