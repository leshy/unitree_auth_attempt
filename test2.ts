import * as crypto from "./crypto.ts"

// read json file
// const data = JSON.parse(await Deno.readTextFile("./mock/aes.json"))

const data = { sdp: { bla: 3 } }

console.log(JSON.stringify(data.sdp))

console.log(
    crypto.aesEncrypt(
        "d0288048ddb84ab9811b1dca3fc96eb5",
        JSON.stringify(data.sdp),
    ),
)
