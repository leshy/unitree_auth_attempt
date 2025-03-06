import * as crypto from "./crypto.ts"
import { RTCPeerConnection, RTCSessionDescription } from "npm:webrtc-polyfill"

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

export async function send_sdp_to_local_peer_new_method(
    ip: string,
    // @ts-ignore
    sdpOfferJson,
): RTCSessionDescriptionInit {
    // for now we expect client to create this
    // const sdpOfferJson = {
    //     id: "STA_localNetwork",
    //     sdp: sdp.sdp,
    //     type: sdp.type,
    //     token: "",
    // }

    console.log("OFFER IS", sdpOfferJson)
    console.log("Initiating handshake with", ip)

    const url = `http://${ip}:9991/con_notify`
    console.log("Requesting", url)
    const publicKeyResponse = await fetch(new Request(url, { method: "GET" }))
    const decodedResponse = atob(await publicKeyResponse.text())

    console.log("Received response", decodedResponse)
    const { data1 } = JSON.parse(decodedResponse)

    const rsaPubKeyPem = data1.substring(10, data1.length - 10)
    const rsaPubKey = crypto.loadRsaKey(rsaPubKeyPem)

    console.log(
        "\nDecoded Robot RSA key:\n",
        // @ts-ignore
        await rsaPubKey.export("pem"),
        "\n",
    )
    const aesKey = crypto.generateAesKey()

    console.log("Generated AES key", aesKey)

    const body = {
        // TODO :verify AES
        "data1": crypto.aesEncrypt(aesKey, JSON.stringify(sdpOfferJson)),
        // TODO :verify RSA
        "data2": await crypto.rsaEncrypt(rsaPubKey, aesKey),
    }

    const pathEnding = calc_local_path_ending(data1)

    const localIp = "localhost"
    const connect_url = `http://${ip}:9991/con_ing_${pathEnding}`

    console.log("connect url:", connect_url)

    //    console.log(body)

    const resp = await fetch(
        new Request(connect_url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate",
                "Accept": "*/*",
                "Connection": "keep-alive",
            },
            body: JSON.stringify(body),
            method: "POST",
        }),
    )

    console.log("STATUS", resp.status)
    console.log("STATUS TEXT", resp.statusText)
    console.log(await resp.text())
}

export async function connect_robot(
    ip: string,
    token: string = "",
): Promise<SDPPeerAnswer> {
    const pc = new RTCPeerConnection()
    const dataChannel = pc.createDataChannel("data", { id: 2 })

    // Set up data channel handlers
    dataChannel.onopen = () => {
        console.log("Data channel opened")
    }

    console.log("Creating offer...")

    // Create offer with proper configuration
    pc.addTransceiver("video", { direction: "recvonly" })
    pc.addTransceiver("audio", { direction: "recvonly" })
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    console.log("created offer")
    const sdpOffer: RTCSessionDescription = pc
        .localDescription as RTCSessionDescription

    const sdpreq = {
        token: "",
        id: "STA_localNetwork",
        type: "offer",
        ip: ip,
        // @ts-ignore
        sdp: pc.localDescription.sdp,
    }

    return await send_sdp_to_local_peer_new_method(ip, sdpreq)

    // Set the remote description with the answer
    //console.log("Setting remote description with peer answer", peer_answer)

    // try {
    //     // Create a proper RTCSessionDescription object
    //     const sessionDescription = new RTCSessionDescription(peer_answer)
    //     // Set the remote description
    //     await pc.setRemoteDescription(sessionDescription)
    //     console.log("Remote description set successfully")
    // } catch (error) {
    //     console.error("Error setting remote description:", error)
    // }

    // return peer_answer
}

//await connect_robot("192.168.12.1")
