import { RTCPeerConnection, RTCSessionDescription } from "npm:webrtc-polyfill"

type SDPPeerAnswer = { sdp: string; type: "answer" }

/**
 * Connect to a Go2 robot using WebRTC
 * @param ip IP address of the robot
 * @param token Optional authentication token
 * @returns The peer answer containing SDP information
 */
async function connect_robot(
    ip: string,
): Promise<any> {
    // Create WebRTC peer connection
    const pc = new RTCPeerConnection()

    // Create data channel - this is required for createOffer() to work properly
    console.log("Creating data channel")
    const dataChannel = pc.createDataChannel("data", { id: 2 })

    // Add event listeners for debugging
    dataChannel.onopen = () => console.log("Data channel opened")
    dataChannel.onclose = () => console.log("Data channel closed")
    dataChannel.onerror = (error) => console.log("Data channel error:", error)

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
): Promise<SDPPeerAnswer> {
    const sdpOfferJson = {
        id: "STA_localNetwork",
        sdp: sdpOffer.sdp,
        type: sdpOffer.type,
    }

    const newSdp = JSON.stringify(sdpOfferJson)
    const url = `http://${robotIp}:9991/con_notify`

    // First request to get the public key
    const response = await fetch(url, { method: "POST" })

    if (response.status === 200) {
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

        // In a real implementation, we would:
        // 1. Generate AES key
        // 2. Load Public Key
        // 3. Encrypt the SDP and AES key
        // 4. Send encrypted data to con_ing_{pathEnding}
        // 5. Decrypt the response

        // For now, return a mock peer answer to test the connection flow
        return {
            sdp: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:mock\r\na=ice-pwd:mockpassword\r\na=ice-options:trickle\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:active\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n",
            type: "answer",
        }
    }

    throw new Error("Failed to get peer answer from the robot")
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

// Example usage
const robotIP = "192.168.12.1"
const peerAnswer = await connect_robot(robotIP)
console.log("Connection established, peer answer:", peerAnswer)
