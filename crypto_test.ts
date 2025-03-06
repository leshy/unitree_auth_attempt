import aes from "npm:aes-cross"
import * as crypto from "node:crypto"
import { Buffer } from "node:buffer"
//import { assertEquals } from "ht ps://deno.land/std@0.208.0/assert/mod.ts"
import rsa from "npm:js-crypto-rsa" // for npm
import { Key } from "npm:js-crypto-key-utils"
import CryptoJS from "npm:crypto-js"

// Extract the crypto functions from main.ts
function generateAesKey(): string {
    // Generate a UUID (16 bytes)
    const randomValues = new Uint8Array(16)
    crypto.getRandomValues(randomValues)

    // Convert to hex string - will be 32 characters long
    return Array.from(randomValues)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
}

function base64ToArray(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

function aesEncrypt(key: string, text: string): string {
    // Match Python implementation - use key as UTF-8 encoded string (not hex)
    // Use AES-256-ECB to match Python's default with 32 byte key
    return aes.enc(
        text,
        Buffer.from(key, "utf8"), // Use UTF-8 encoding to match Python
        aes.emptyIV,
        "utf-8",
        "base64",
        "aes-256-ecb", // Use AES-256 to match Python
        true,
    )
}

function aesEncryptNode(key: string, text: string): string {
    // Match Python implementation using Node's crypto
    const keyBytes = Buffer.from(key, "utf8") // Use UTF-8 encoding to match Python
    const secret_msg = Buffer.from(text, "utf-8")

    // Use AES-256-ECB to match Python's implementation
    const cipher = crypto.createCipheriv(
        "aes-256-ecb",
        keyBytes,
        Buffer.alloc(0),
    )

    // Use PKCS padding to match Python's default
    cipher.setAutoPadding(true)

    const encryptedData = Buffer.concat([
        cipher.update(secret_msg),
        cipher.final(),
    ])
    console.log(encryptedData)
    return encryptedData.toString("base64")
}

// Function to decrypt using AES-ECB

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

function aesDecrypt(encryptedData: string, key: string): string {
    // Convert the key to bytes as in Python
    const keyBytes = CryptoJS.enc.Utf8.parse(key)

    // Decrypt using AES in ECB mode
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyBytes, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    })

    // Convert the decrypted data to UTF-8 string
    return decrypted.toString(CryptoJS.enc.Utf8)
}

function calc_local_path_ending(data1: string): string {
    // Initialize an array of strings
    const strArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

    // Extract the last 10 characters of data1
    const last10Chars = data1.substring(data1.length - 10)

    // Split the last 10 characters into chunks of size 2
    const chunked = []
    for (let i = 0; i < last10Chars.length; i += 2) {
        chunked.push(last10Chars.substring(i, i + 2))
    }

    // Initialize an empty array to store indices
    const arrayList = []

    // Iterate over the chunks and find the index of the second character in strArr
    for (const chunk of chunked) {
        if (chunk.length > 1) {
            const secondChar = chunk[1]
            const index = strArr.indexOf(secondChar)
            if (index !== -1) {
                arrayList.push(index)
            }
        }
    }

    // Convert arrayList to a string
    const joinToString = arrayList.join("")

    return joinToString
}

async function rsaEncrypt(
    key: unknown,
    data: string,
): Promise<string> {
    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(data)

    // Encrypt the data
    const encryptedBuffer = await rsa.encrypt(
        dataBytes,
        // @ts-ignore
        await key.export("jwk") as JsonWebKey,
    )

    // Convert to base64
    return arrayBufferToBase64(encryptedBuffer)
}

async function rsaLoadPublicKey(der: string): Promise<unknown> {
    return new Key("der", base64ToArray(der))
}

/**
 * Prepare encrypted request payload for the Go2 robot
 */
async function prepareEncryptedRequest(
    publicKeyResponse: string,
    sdpData: string,
    aesKey?: string,
): Promise<{
    formData: URLSearchParams
    pathEnding: string
    aesKey: string
    encrypted_sdp: string
    encrypted_key: string
}> {
    // Decode the base64 response
    const decodedResponse = atob(publicKeyResponse)

    // Parse the decoded response as JSON
    const decodedJson = JSON.parse(decodedResponse)

    // Extract the 'data1' field
    const data1 = decodedJson.data1

    const pathEnding = calc_local_path_ending(data1)
    console.log("PATH:", pathEnding)

    // 1. Generate AES key (UUID converted to hex string) or use the fixed key
    if (!aesKey) aesKey = generateAesKey()
    console.log("AES key:", aesKey)

    // Extract the public key from 'data1'
    const publicKeyPem = data1.substring(10, data1.length - 10)
    console.log("RSA PEM:", publicKeyPem)

    // 2. Load Public Key
    // Convert PEM format to usable key
    const rsaKey = await rsaLoadPublicKey(publicKeyPem)
    // @ts-ignore
    console.log("\n", await rsaKey.export("pem"), "\n")

    console.log("TEST", aesEncrypt(aesKey, "test"))
    //console.log("TEST", aesEncryptNode(aesKey, "test"))

    // 3. Encrypt the SDP with AES and encrypt the AES key with RSA

    const encryptedSdp = aesEncryptNode(aesKey, JSON.stringify(sdpData))
    console.log("\n\nEncrypted SDP", encryptedSdp, "\n\n")

    const encryptedKey = await rsaEncrypt(rsaKey, aesKey)
    console.log("Encrypted SDP and key")

    // Create form data for the request
    const formData = new URLSearchParams()
    formData.append("data1", encryptedSdp)
    formData.append("data2", encryptedKey)

    return {
        formData,
        pathEnding,
        aesKey,
        encrypted_sdp: encryptedSdp,
        encrypted_key: encryptedKey,
    }
}

// Main function to use the real robot data and output to a JSON file
async function main() {
    try {
        // Get the base64 response from robot_data.json
        const base64Response = await Deno.readTextFile("./mock/robot_data.raw")

        const clientData = JSON.parse(
            await Deno.readTextFile("./mock/aes.json"),
        )

        // Prepare the encrypted request with the fixed AES key
        const result = await prepareEncryptedRequest(
            base64Response,
            clientData.sdp,
            clientData.aes_key,
        )

        // Create output object similar to python_crypto_output.json
        const outputData = {
            aes_key: result.aesKey,
            encrypted_sdp: result.encrypted_sdp,
            encrypted_key: result.encrypted_key,
            url_encoded_form: result.formData.toString(),
            path_ending: result.pathEnding,
            url: `http://<robot-ip>:9991/con_ing_${result.pathEnding}`,
        }

        // Write to ts_crypto_output.json
        await Deno.writeTextFile(
            "./ts_crypto_output.json",
            JSON.stringify(outputData, null, 2),
        )

        console.log("Successfully wrote output to ts_crypto_output.json")
        console.log("Path ending calculated:", result.pathEnding)

        // Compare with Python output
        const pythonOutputText = await Deno.readTextFile(
            "./python_crypto_output.json",
        )
        const pythonOutput = JSON.parse(pythonOutputText)

        console.log("\nComparison with Python output:")
        console.log(`TypeScript Path Ending: ${result.pathEnding}`)
        console.log(`Python Path Ending: ${pythonOutput.path_ending}`)
        console.log(
            `Path Endings Match: ${
                result.pathEnding === pythonOutput.path_ending
            }`,
        )

        // Compare encrypted data
        const encSdpMatch = result.encrypted_sdp === pythonOutput.encrypted_sdp
        const encKeyMatch = result.encrypted_key === pythonOutput.encrypted_key

        console.log(`Encrypted SDP Match: ${encSdpMatch}`)
        console.log(`Encrypted Key Match: ${encKeyMatch}`)
    } catch (error) {
        console.error("Error:", error)
    }
}

// Run the main function if this is the main module
if (import.meta.main) {
    await main()
}

// Run the tests with: deno test crypto_test.ts
// Run the main function with: deno run -A crypto_test.ts
