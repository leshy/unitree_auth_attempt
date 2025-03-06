import { RTCPeerConnection, RTCSessionDescription } from "npm:webrtc-polyfill"
import * as crypto from "./crypto.ts"

type SDPPeerAnswer = { sdp: string; type: "answer" }

// A global reference to the robot connection for use across functions
let globalRobotConnection: RobotConnection | null = null

/**
 * Connect to a Go2 robot using WebRTC
 * @param ip IP address of the robot
 * @param token Optional authentication token
 * @returns The peer answer containing SDP information
 */
async function connect_robot(
    ip: string,
    token: string = "",
): Promise<SDPPeerAnswer> {
    // Use the global robotConnection instance from main()
    const pc = globalRobotConnection?.pc || new RTCPeerConnection()

    console.log("Creating offer...")

    // Create offer with proper configuration
    const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
    })

    await pc.setLocalDescription(offer)

    const sdpOffer = pc.localDescription

    // Get peer answer using the provided SDP offer
    const peer_answer = await get_peer_answer(
        ip,
        sdpOffer as RTCSessionDescription,
    )

    // Set the remote description with the answer
    console.log("Setting remote description with peer answer")

    try {
        // Create a proper RTCSessionDescription object
        const sessionDescription = new RTCSessionDescription(peer_answer)

        // Set the remote description
        await pc.setRemoteDescription(sessionDescription)
        console.log("Remote description set successfully")
    } catch (error) {
        console.error("Error setting remote description:", error)
    }

    return peer_answer
}

/**
 * Get peer answer from the robot
 */
async function get_peer_answer(
    robotIp: string,
    sdpOffer: RTCSessionDescription,
): Promise<any> {
    const sdpOfferJson = {
        id: "STA_localNetwork",
        sdp: sdpOffer.sdp,
        type: sdpOffer.type,
    }

    console.log(sdpOfferJson)
    const newSdp = JSON.stringify(sdpOfferJson)
    const url = `http://${robotIp}:9991/con_notify`

    // First request to get the public key
    const response = await fetch(url, { method: "POST" })

    if (response.status !== 200) {
        throw new Error("Failed to get peer answer from the robot")
    }
    // Get the response text and decode from bse64
    const responseText = await response.text()
    const decodedResponse = atob(responseText)

    // Parse the decoded response as JSON
    const decodedJson = JSON.parse(decodedResponse)

    // Extract the 'data1' field fr
    const data1 = decodedJson.data1
    // Extract the public key from 'data1'
    const publicKeyPem = data1.substring(10, data1.length - 10)
    const pathEnding = calc_local_path_ending(data1)

    // Note: These encryption functions would need to be implemented properly
    // For testing purposes, we'll just return a mock peer answer

    console.log("Public key received, path ending calculated:", pathEnding)

    // 1. Generate AES key (UUID converted to hex string)
    const aesKey = crypto.generateAesKey()
    console.log("Generated AES key", aesKey)

    // 2. Load Public Key
    // Convert PEM format to usable key
    const robotPublicKey = await crypto.loadRsaKey(publicKeyPem)
    console.log("Loaded public key")

    // 3. Encrypt the SDP with AES and encrypt the AES key with RSA
    const encryptedSdp = crypto.aesEncrypt(aesKey, newSdp)
    const encryptedKey = await crypto.rsaEncrypt(robotPublicKey, aesKey)
    console.log("Encrypted SDP and key")

    // 4. Send encrypted data to con_ing_{pathEnding}

    // URL for the second request
    const secondUrl = `http://${robotIp}:9991/con_ing_${pathEnding}`

    // Set appropriate headers
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }

    // Convert to URL-encoded form data (key1=value1&key2=value2)
    // This matches how Python's requests library formats form data
    const body = { "data1": encryptedSdp, "data2": encryptedKey }

    console.log(`Sending encrypted data to ${secondUrl}`)

    const secondResponse = await fetch(secondUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    })

    if (secondResponse.status === 200) {
        // 5. Decrypt the response
        const encryptedResponse = await secondResponse.text()
        console.log("GOT", encryptedResponse)
        // const decryptedResponse = aesDecrypt(encryptedResponse, aesKey)
        // console.log("Successfully decrypted response")

        // // Parse the decrypted response
        // const peerAnswer = JSON.parse(decryptedResponse)
        // console.log("Received real peer answer from device")

        // return {
        //     sdp: peerAnswer.sdp,
        //     type: "answer",
        // }
    } else {
        console.error(
            "Failed to get response from second request:",
            secondResponse.status,
        )
        throw new Error(
            `Failed to get response from ${secondUrl}: ${secondResponse.status}`,
        )
    }
}

/**
 * Calculate the local path ending based on the data1 string
 */
function calc_local_path_ending(data1: string): string {
    // Initialize an array of strings
    const strArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

    // Extract the last 10 characters of data1
    const last10Chars = data1.substring(data1.length - 10)

    // Split the last 0 characters into chunks of size 2
    const chunked = []
    for (let i = 0; i < last10Chars.length; i += 2) {
        chunked.push(last10Chars.substring(i, i + 2))
    }

    // Initialize an emp
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

/**
 * Add event listeners for data channel
 */
function setupDataChannel(dataChannel: RTCDataChannel): void {
    // Set up event handlers
    dataChannel.onopen = () => {
        console.log("Data channel is open")
        // You might want to send initial messages here
    }

    dataChannel.onclose = () => {
        console.log("Data channel closed")
    }

    dataChannel.onerror = (error) => {
        console.error("Data channel error:", error)
    }

    dataChannel.onmessage = (event) => {
        handleMessage(event.data)
    }
}

/**
 * Handle incoming messages
 */
function handleMessage(message: string | ArrayBuffer): void {
    try {
        if (typeof message === "string") {
            const msgObj = JSON.parse(message)
            console.log("Received message:", msgObj)

            // Handle different message types
            if (msgObj.type === "validation") {
                console.log("Received validation message:", msgObj.data)
                // Handle validation
                if (msgObj.data === "Validation Ok.") {
                    console.log("Validation successful!")
                }
            }
        } else {
            // Handle binary message (like LiDAR data)
            console.log("Received binary data, length:", message.byteLength)
        }
    } catch (error) {
        console.error("Error handling message:", error)
    }
}

/**
 * Send a message through the data channel
 */
function sendMessage(
    dataChannel: RTCDataChannel,
    topic: string,
    data: any,
    type: string,
): void {
    if (dataChannel.readyState !== "open") {
        console.error(
            "Data channel is not open. State:",
            dataChannel.readyState,
        )
        return
    }

    const payload = {
        type: type,
        topic: topic,
        data: data,
    }

    console.log("Sending message:", payload)
    dataChannel.send(JSON.stringify(payload))
}

/**
 * Create a connection to the robot and handle messaging
 */
class RobotConnection {
    pc: RTCPeerConnection
    dataChannel: RTCDataChannel | null = null
    connected = false

    constructor() {
        this.pc = new RTCPeerConnection()

        // Set up connection state change listener
        this.pc.onconnectionstatechange = () => {
            console.log("Connection state changed:", this.pc.connectionState)
            if (this.pc.connectionState === "connected") {
                this.connected = true
                console.log("WebRTC connection established successfully!")
            }
        }

        // Handle ICE candidate events
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("New ICE candidate:", event.candidate.address)
            }
        }
    }

    /**
     * Initialize the data channel
     */
    createDataChannel(): RTCDataChannel {
        console.log("Creating data channel")
        this.dataChannel = this.pc.createDataChannel("data", { id: 2 })

        // Set up data channel handlers
        this.dataChannel.onopen = () => {
            console.log("Data channel opened")
            this.onDataChannelOpen()
        }

        this.dataChannel.onclose = () => {
            console.log("Data channel closed")
        }

        this.dataChannel.onerror = (error) => {
            console.error("Data channel error:", error)
        }

        this.dataChannel.onmessage = (event) => {
            this.handleMessage(event.data)
        }

        return this.dataChannel
    }

    /**
     * Handle when the data channel opens
     */
    onDataChannelOpen(): void {
        console.log("Data channel is ready for messaging")
    }

    /**
     * Handle incoming messages
     */
    handleMessage(message: string | ArrayBuffer): void {
        try {
            if (typeof message === "string") {
                const msgObj = JSON.parse(message)
                console.log("Received message:", msgObj)

                // Handle different message types
                if (msgObj.type === "validation") {
                    console.log("Received validation message:", msgObj.data)
                    // Handle validation
                    if (msgObj.data === "Validation Ok.") {
                        console.log("Validation successful!")
                    } else {
                        this.sendValidationResponse(msgObj.data)
                    }
                }
            } else {
                // Handle binary message (like LiDAR data)
                console.log("Received binary data, length:", message.byteLength)
            }
        } catch (error) {
            console.error("Error handling message:", error)
        }
    }

    /**
     * Send a validation response
     */
    sendValidationResponse(challengeKey: string): void {
        // Format: UnitreeGo2_{key}
        const prefixedKey = `UnitreeGo2_${challengeKey}`

        // Calculate MD5 hash
        const md5Hash = CryptoJS.MD5(prefixedKey).toString()

        // Convert hex to base64
        const base64Hash = btoa(
            md5Hash.match(/\w{2}/g)!.map((a) =>
                String.fromCharCode(parseInt(a, 16))
            ).join(""),
        )

        // Send the response
        this.sendMessage("", base64Hash, "VALIDATION")
    }

    /**
     * Send a message through the data channel
     */
    sendMessage(topic: string, data: any, type: string): void {
        if (!this.dataChannel || this.dataChannel.readyState !== "open") {
            console.error(
                "Data channel is not open. State:",
                this.dataChannel?.readyState,
            )
            return
        }

        const payload = {
            type: type,
            topic: topic,
            data: data,
        }

        console.log("Sending message:", payload)
        this.dataChannel.send(JSON.stringify(payload))
    }

    /**
     * Send a command to the robot
     */
    sendCommand(command: string, data: any = {}): void {
        this.sendMessage(command, data, "MESSAGE")
    }

    /**
     * Close the connection
     */
    async close(): Promise<void> {
        if (this.dataChannel) {
            this.dataChannel.close()
        }
        await this.pc.close()
        console.log("Connection closed")
    }
}

// Example usage
async function main() {
    try {
        const robotIP = "192.168.12.1"
        // Optional token if your robot requires authentication
        const token = ""

        console.log("Connecting to robot at", robotIP)

        // Create robot connection
        globalRobotConnection = new RobotConnection()

        // Create data channel
        globalRobotConnection.createDataChannel()

        // Connect to the robot with the token
        const peerAnswer = await connect_robot(robotIP, token)
        console.log("Connection established, peer answer:", peerAnswer)

        // Wait for the data channel to open before sending commands
        setTimeout(() => {
            if (globalRobotConnection?.dataChannel?.readyState === "open") {
                console.log("Sending a test command to the robot")

                // Example commands for Go2 robot:
                // 1. Standing up
                globalRobotConnection.sendCommand("motion", { motion: "stand" })

                // // Wait 3 seconds then send a walking command
                // setTimeout(() => {
                //     console.log("Sending walking command")
                //     globalRobotConnection?.sendCommand("cmd", {
                //         cmd: "move",
                //         params: {
                //             vx: 0.5,  // forward velocity (m/s)
                //             vy: 0,    // lateral velocity (m/s)
                //             vz: 0     // turning velocity (rad/s)
                //         }
                //     })

                //     // Stop after 2 seconds
                //     setTimeout(() => {
                //         console.log("Stopping robot")
                //         globalRobotConnection?.sendCommand("cmd", {
                //             cmd: "move",
                //             params: {
                //                 vx: 0,
                //                 vy: 0,
                //                 vz: 0
                //             }
                //         })
                //     }, 2000)
                // }, 3000)
            } else {
                console.log(
                    "Data channel not open yet, state:",
                    globalRobotConnection?.dataChannel?.readyState,
                )
            }
        }, 2000)

        // Keep the program running to maintain the WebRTC connection
        console.log("Press Ctrl+C to exit")
    } catch (error) {
        console.error("Error connecting to robot:", error)
    }
}

// Run the main function
main()
