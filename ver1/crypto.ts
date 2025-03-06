import rsa from "npm:js-crypto-rsa"
import * as crypto from "node:crypto"
import { Buffer } from "node:buffer"
import { Key } from "npm:js-crypto-key-utils"
import aes from "npm:aes-cross"

export function aesEncryptAlt(key: string, text: string): string {
    // Use AES-256-ECB to match Python's default with 32 byte key
    return aes.enc(
        text,
        Buffer.from(key, "utf8"),
        aes.emptyIV,
        "utf-8",
        "base64",
        "aes-256-ecb",
        true,
    )
}

export function aesEncrypt(key: string, text: string): string {
    const keyBytes = Buffer.from(key, "utf8")
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
    return encryptedData.toString("base64")
}

function base64ToArray(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export async function rsaEncrypt(
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

export function loadRsaKey(der: string): Promise<unknown> {
    // @ts-ignore
    return new Key("der", base64ToArray(der))
}

export function generateAesKey(): string {
    // Generate a UUID (16 bytes)
    // This is what Python does with uuid.uuid4().bytes
    const randomValues = new Uint8Array(16)
    crypto.getRandomValues(randomValues)

    // Convert to hex string - this will be 32 characters long
    // Just like the Python binascii.hexlify(uuid_32).decode("utf-8")
    return Array.from(randomValues)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
}
