import aes from "npm:aes-cross"
import * as crypto from "node:crypto"
import { Buffer } from "node:buffer"

function aesEncrypt(hexKey: string, text: string): string {
    // aes.enc(target, key, iv = zero16IV, inputEncoding = 'utf-8', outputEncoding = 'base64', algorithm = 'aes-128-cbc', autoPadding = true);
    return aes.enc(
        text,
        Buffer.from(hexKey, "hex"),
        aes.emptyIV,
        "utf-8",
        "base64",
        "aes-128-ecb",
        true,
    )
}

function aesEncryptNode(hexKey: string, text: string): string {
    // Use the provided hex key instead of hardcoded value - convert hexKey to a Buffer
    const key = Buffer.from(hexKey, "hex")
    const secret_msg = Buffer.from(text, "utf-8")
    const cipher = crypto.createCipheriv("aes-128-ecb", key, Buffer.alloc(0))
    cipher.setAutoPadding(true)
    const encryptedData = Buffer.concat([
        cipher.update(secret_msg),
        cipher.final(),
    ])
    return encryptedData.toString("base64")
}

const key = "d0288048ddb84ab9811b1dca3fc96eb5"

console.log(aesEncrypt(key, "test"))
console.log(aesEncryptNode(key, "test"))
