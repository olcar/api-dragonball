# Changelog

## [Unreleased]

### Added
- Docker dev environment (Dockerfile, docker-compose.yml, .dockerignore)
- GitHub Actions CI (lint, test, build)
- .editorconfig, .nvmrc
- Local file storage driver (UPLOAD_DRIVER=local)

### Changed
- Replaced TypeORM synchronize with proper migrations
- Switched JWT and TypeORM config to use ConfigService (async factory)
- Replaced console.log with NestJS Logger + graceful shutdown
- README with Docker setup, API docs, test counts

### Fixed
- Dead code in auth.service.ts (unreachable return, undefined variable)
- Removed unused CharactersModule import in TransformationModule
- Typed updatedCharacter as Partial<Character> instead of any
- Removed empty inject: [] in CloudinaryProvider
- Removed unused src/config/data.source.ts

## 0.0.1

Initial NestJS scaffold with MySQL, Cloudinary, JWT auth, and CRUD for characters, planets, transformations.
