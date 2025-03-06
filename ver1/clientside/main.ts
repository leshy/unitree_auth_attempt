import * as wm from "./wm.ts"
import * as controls from "./controls.ts"

const root = new wm.Window()
document.getElementById("window-container")?.appendChild(root.element)

const testWin = root.addWindow(new wm.Window("unitree auth v1"))
testWin.element.style.height = "100vh"
// @ts-ignore
globalThis.testWin = testWin

const ctrl = new controls.Controls(testWin)
ctrl.addButton("connectRobot", "connect robot", connectRobot)

function getReadableTimeString(): string {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const seconds = now.getSeconds().toString().padStart(2, "0")
    const ms = now.getMilliseconds().toString().padStart(2, "0")

    return `${hours}:${minutes}:${seconds}:${ms}`
}

// deno-lint-ignore no-explicit-any
function log(...values: any[]) {
    const el = document.createElement("div")
    el.className = "logLine"
    el.textContent = getReadableTimeString() + " | " +
        // @ts-ignore
        values.map(JSON.stringify).join(" ")
    testWin.element.prepend(el)
}

async function connectRobot() {
    // @ts-ignore
    const pc = new RTCPeerConnection({ sdpSemantics: "unified-plan" })

    const channel = pc.createDataChannel("data")

    pc.addTransceiver("video", { direction: "recvonly" })
    pc.addTransceiver("audio", { direction: "sendrecv" })
    pc.addEventListener("track", console.log)
    channel.onmessage = console.log

    log("creating SDP offer...")

    await pc
        .createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
            log("offer created, sending")
        })

    const sdpreq = {
        token: "",
        id: "STA_localNetwork",
        type: "offer",
        ip: "192.168.12.1",
        // @ts-ignore
        sdp: pc.localDescription.sdp,
    }

    console.log("SDP OFFER", sdpreq)

    // Get peer answer using the provided SDP offer
    const peer_answer = await getPeerAnswer(
        sdpreq,
        "192.168.12.1",
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
function getPeerAnswer(
    // deno-lint-ignore no-explicit-any
    sdp: any,
    ip: string,
): Promise<RTCSessionDescription> {
    return fetch("/sdp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sdp, ip }),
    })
        .then((response) => response.json())
        .then((data) => {
            log(data)
            console.log("session data received:", data)
            return new RTCSessionDescription(data)
        })
        .catch((error) => {
            console.error("Error connecting to robot:", error)
        }) as Promise<RTCSessionDescription>
}
