# Changelog

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and uses [Semantic Versioning](https://semver.org/). During the 0.x preview,
minor releases may include announced breaking changes.

## [Unreleased]

### Added

- Typed Gateway helpers for models, chat completions, Responses, embeddings,
  Anthropic Messages, and Server-Sent Events.
- OAuth 2.0 authorization-code, refresh-token, client-credentials, token
  revocation, and user-info flows.
- A generated, checked-in Management OpenAPI catalog with 144 operations and
  generated TypeScript schema types.
- Consistent SDK error handling for API, OAuth, transport, timeout, and
  malformed-response failures.

### Changed

- Added Node.js 20/22/24 CI coverage, package smoke checks, and a public
  Management contract snapshot so CI does not depend on a private API repo.

## [0.2.0] - 2026-08-28

### Added

- Initial Gateway, Management, streaming, error-handling, retry, and webhook
  functionality.
- Open-source governance, CI, packaging, and release configuration.

[Unreleased]: https://github.com/Syrovex/owlvigil_sdk_nodejs/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Syrovex/owlvigil_sdk_nodejs/releases/tag/v0.2.0
