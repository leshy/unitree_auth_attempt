// clicall.ts - Wrapper for calling clirpc.py from Deno

/**
 * Calls a Python RPC function through clirpc.py
 * @param functionName - The name of the registered Python function to call
 * @param args - Array of arguments to pass to the function
 * @returns Promise that resolves with the result of the function call
 */
export async function pyRpc(
  functionName: string,
  args: any[] = [],
): Promise<any> {
  try {
    // Create the RPC request object
    const request = {
      functionName,
      args,
    }

    // Convert request to JSON string
    const jsonRequest = JSON.stringify(request)

    // Create a command that activates the virtual environment and calls clirpc.py
    const command =
      `cd ${Deno.cwd()}/python && source env/bin/activate && python clirpc.py '${jsonRequest}'`

    console.log(command)
    // Execute the command using Deno subprocess
    // @ts-ignore
    const process = Deno.run({
      cmd: ["bash", "-c", command],
      stdout: "piped",
      stderr: "piped",
    })

    // Wait for the command to complete and get stdout
    const [status, stdout, stderr] = await Promise.all([
      process.status(),
      process.output(),
      process.stderrOutput(),
    ])

    // Close the process
    process.close()

    // Check if command was successful
    if (!status.success) {
      const errorText = new TextDecoder().decode(stderr)
      throw new Error(`Python RPC call failed: ${errorText}`)
    }

    // Parse the response
    const responseText = new TextDecoder().decode(stdout).trim()
    const response = JSON.parse(responseText)

    // Check if there was an error in the RPC call
    if (response.error) {
      throw new Error(`RPC error: ${response.error}`)
    }

    // Return the result
    return response.result
  } catch (error) {
    console.error("Error calling Python RPC:", error)
    throw error
  }
}

// Example usage:
// import { callPythonRpc } from "./clicall.ts";
//
// // Call the add function
// const sum = await callPythonRpc("add", [5, 3]);
// console.log("Sum:", sum);
//
// // Call the fetch_data function
// const data = await callPythonRpc("fetch_data", ["https://example.com"]);
// console.log("Data:", data);
//
// // Call the send_sdp_to_local_peer_new_method function
// const sdpResponse = await callPythonRpc("send_sdp_to_local_peer_new_method", ["192.168.1.100", "sdp_offer_string"]);
// console.log("SDP Response:", sdpResponse);
