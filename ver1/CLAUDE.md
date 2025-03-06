# GO2 WebRTC Project Guide

## Build & Test Commands
- Run project: `deno run -A main.ts`
- Format code: `deno fmt`
- Lint code: `deno lint`
- Run all tests: `deno test`
- Run specific test: `deno test main_test.ts`
- Watch for changes: `deno run -A --watch main.ts`

## Code Style Guidelines
- **Formatting**: 4 spaces indentation, no tabs, no semicolons
- **Imports**: Use explicit imports from npm packages with "npm:" prefix
- **Types**: TypeScript with `// @ts-ignore` comments when needed
- **Naming**:
  - Classes: PascalCase (e.g., `RobotConnection`)
  - Variables/functions: camelCase (e.g., `robotIP`, `encryptKey`)
  - Constants: UPPER_SNAKE_CASE (if applicable)
- **Error Handling**: Use try/catch blocks with console.error logging
- **Promises**: Prefer async/await over Promise chains
- **Comments**: JSDoc style comments for function documentation