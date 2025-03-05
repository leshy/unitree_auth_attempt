# GO2 WebRTC Project Guide

## Build & Test Commands
- Run project: `deno run -A main.ts`
- Format code: `deno fmt`
- Lint code: `deno lint`
- Run all tests: `deno test`
- Run specific test: `deno test main_test.ts`
- Watch for changes: `deno run -A build.ts --watch`

## Code Style Guidelines
- **Formatting**: 4 spaces indentation, no tabs, no semicolons
- **Imports**: Use relative paths with file extension (e.g., `./utils.js`)
- **Types**: TypeScript with `// @ts-ignore` comments when needed
- **Naming**:
  - Classes: PascalCase (e.g., `Go2WebRTC`)
  - Variables/functions: camelCase (e.g., `robotIP`, `encryptKey`)
  - Constants: UPPER_SNAKE_CASE (e.g., `SPORT_CMD`)
- **Error Handling**: Use Promise-based error handling with catch blocks
- **Promises**: Prefer async/await where applicable, use Promise chaining elsewhere
- **Comments**: TODO comments for future work, function descriptions for complex logic