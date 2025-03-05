/**
 * Data collector script for Go2 robot
 * This script captures the real responses from the robot to use in our tests
 */

// Set the robot's IP address
const ROBOT_IP = "192.168.12.1";

/**
 * Collect the initial public key response
 */
async function collectInitialResponse() {
    console.log(`Connecting to robot at ${ROBOT_IP}...`);
    
    const url = `http://${ROBOT_IP}:9991/con_notify`;
    
    try {
        // First request to get the public key
        const response = await fetch(url, { method: "POST" });
        
        if (response.status === 200) {
            const responseText = await response.text();
            console.log("Successfully received response!");
            console.log("\nBase64 encoded response:");
            console.log(responseText);
            
            // Decode the base64 response
            const decodedResponse = atob(responseText);
            console.log("\nDecoded response:");
            console.log(decodedResponse);
            
            // Parse the decoded response as JSON
            const decodedJson = JSON.parse(decodedResponse);
            
            // Extract the 'data1' field
            const data1 = decodedJson.data1;
            console.log("\ndata1 field:");
            console.log(data1);
            
            // Extract the public key
            const publicKeyPem = data1.substring(10, data1.length - 10);
            console.log("\nPublic key PEM:");
            console.log(publicKeyPem);
            
            // Extract path ending
            const pathEnding = calcLocalPathEnding(data1);
            console.log("\nPath ending:");
            console.log(pathEnding);
            
            // Save the data to a JSON file
            const collectedData = {
                base64Response: responseText,
                decodedResponse: decodedResponse,
                data1: data1,
                publicKeyPem: publicKeyPem,
                pathEnding: pathEnding
            };
            
            // Output as a valid TypeScript object
            console.log("\nCollected data as TS object:");
            console.log("const ROBOT_SAMPLE_DATA = " + JSON.stringify(collectedData, null, 2) + ";");
            
            // Save to JSON file
            await Deno.writeTextFile("robot_data.json", JSON.stringify(collectedData, null, 2));
            console.log("\nData saved to robot_data.json");
            
            return collectedData;
        } else {
            console.error(`Failed to get response: ${response.status}`);
        }
    } catch (error) {
        console.error("Error collecting data:", error);
    }
}

/**
 * Calculate the local path ending based on the data1 string
 */
function calcLocalPathEnding(data1: string): string {
    // Initialize an array of strings
    const strArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    
    // Extract the last 10 characters of data1
    const last10Chars = data1.substring(data1.length - 10);
    
    // Split the last 10 characters into chunks of size 2
    const chunked = [];
    for (let i = 0; i < last10Chars.length; i += 2) {
        chunked.push(last10Chars.substring(i, i + 2));
    }
    
    // Initialize an empty array to store indices
    const arrayList = [];
    
    // Iterate over the chunks and find the index of the second character in strArr
    for (const chunk of chunked) {
        if (chunk.length > 1) {
            const secondChar = chunk[1];
            const index = strArr.indexOf(secondChar);
            if (index !== -1) {
                arrayList.push(index);
            }
        }
    }
    
    // Convert arrayList to a string
    const joinToString = arrayList.join("");
    
    return joinToString;
}

// Run the data collection
await collectInitialResponse();