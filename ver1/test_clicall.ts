// test_clicall.ts - Test the clicall.ts RPC wrapper

import { pyRpc } from "./clicall.ts"

// Test simple addition
async function testAdd() {
  console.log("Testing add function...")
  try {
    const result = await pyRpc("add", [5, 3])
    console.log("Result:", result)
    console.log("Test passed: 5 + 3 =", result)
  } catch (error) {
    console.error("Test failed:", error)
  }
}

// Run the tests
console.log("Starting tests for Python RPC calls")
await testAdd()
console.log("Tests completed")
