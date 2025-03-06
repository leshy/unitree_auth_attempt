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

    // const captured_from_legion_py_sdp = {
    //     "id": "",
    //     "sdp":
    //         "v=0\r\no=- 3950241439 3950241439 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1 2\r\na=msid-semantic:WMS *\r\nm=audio 47886 UDP/TLS/RTP/SAVPF 96 0 8\r\nc=IN IP4 172.17.0.1\r\na=sendrecv\r\na=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:2 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=mid:0\r\na=msid:08bf71f3-2056-4487-a6ae-f8e02448ac39 802b5f53-5f08-46c4-b198-7aeb3e4e586b\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=rtcp-mux\r\na=ssrc:2423869274 cname:5b335376-6089-4951-9193-35f7d9b1ffe5\r\na=rtpmap:96 opus/48000/2\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=candidate:580b5f32035da7f14a30ea7a8d826c67 1 udp 2130706431 172.17.0.1 47886 typ host\r\na=candidate:6e97dfe71117b08efa859b3be391006f 1 udp 2130706431 192.168.12.119 47443 typ host\r\na=candidate:348906676dcb58d1f77c4056aef9d9ab 1 udp 2130706431 10.144.103.9 49715 typ host\r\na=end-of-candidates\r\na=ice-ufrag:kCSs\r\na=ice-pwd:H1wfCmRWxPj5tRXU8hcaZn\r\na=fingerprint:sha-256 4B:5D:A2:C3:59:D3:E0:85:0D:6F:72:35:B8:30:5D:58:32:38:90:79:26:68:47:D4:F7:CB:2F:59:2A:06:FF:A5\r\na=fingerprint:sha-384 7A:D5:84:D7:61:17:AA:5B:44:D6:9C:7D:DC:04:36:43:76:41:19:66:12:71:36:F7:77:A8:65:1D:E6:EC:9A:2C:C3:FF:EE:E1:38:04:34:54:0E:C0:7A:72:1D:E7:91:07\r\na=fingerprint:sha-512 E7:A2:AD:70:02:05:D9:3A:9F:3D:CE:84:19:85:D1:E3:26:B3:04:A4:EC:DF:02:3A:59:CF:C0:B6:13:C2:52:B0:0F:61:61:00:0B:65:E3:84:99:D3:75:87:47:9E:40:49:40:30:C8:FE:8C:F0:E5:E4:14:91:B9:1B:1B:9C:20:5E\r\na=setup:actpass\r\nm=video 50963 UDP/TLS/RTP/SAVPF 97 98 99 100 101 102\r\nc=IN IP4 172.17.0.1\r\na=recvonly\r\na=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=mid:1\r\na=msid:08bf71f3-2056-4487-a6ae-f8e02448ac39 e1bb5bb8-b9ae-407e-8eaf-1af7ef051d05\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=rtcp-mux\r\na=ssrc-group:FID 2728868107 4080167128\r\na=ssrc:2728868107 cname:5b335376-6089-4951-9193-35f7d9b1ffe5\r\na=ssrc:4080167128 cname:5b335376-6089-4951-9193-35f7d9b1ffe5\r\na=rtpmap:97 VP8/90000\r\na=rtcp-fb:97 nack\r\na=rtcp-fb:97 nack pli\r\na=rtcp-fb:97 goog-remb\r\na=rtpmap:98 rtx/90000\r\na=fmtp:98 apt=97\r\na=rtpmap:99 H264/90000\r\na=rtcp-fb:99 nack\r\na=rtcp-fb:99 nack pli\r\na=rtcp-fb:99 goog-remb\r\na=fmtp:99 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:100 rtx/90000\r\na=fmtp:100 apt=99\r\na=rtpmap:101 H264/90000\r\na=rtcp-fb:101 nack\r\na=rtcp-fb:101 nack pli\r\na=rtcp-fb:101 goog-remb\r\na=fmtp:101 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:102 rtx/90000\r\na=fmtp:102 apt=101\r\na=candidate:580b5f32035da7f14a30ea7a8d826c67 1 udp 2130706431 172.17.0.1 50963 typ host\r\na=candidate:6e97dfe71117b08efa859b3be391006f 1 udp 2130706431 192.168.12.119 47784 typ host\r\na=candidate:348906676dcb58d1f77c4056aef9d9ab 1 udp 2130706431 10.144.103.9 33408 typ host\r\na=end-of-candidates\r\na=ice-ufrag:kCSs\r\na=ice-pwd:H1wfCmRWxPj5tRXU8hcaZn\r\na=fingerprint:sha-256 4B:5D:A2:C3:59:D3:E0:85:0D:6F:72:35:B8:30:5D:58:32:38:90:79:26:68:47:D4:F7:CB:2F:59:2A:06:FF:A5\r\na=fingerprint:sha-384 7A:D5:84:D7:61:17:AA:5B:44:D6:9C:7D:DC:04:36:43:76:41:19:66:12:71:36:F7:77:A8:65:1D:E6:EC:9A:2C:C3:FF:EE:E1:38:04:34:54:0E:C0:7A:72:1D:E7:91:07\r\na=fingerprint:sha-512 E7:A2:AD:70:02:05:D9:3A:9F:3D:CE:84:19:85:D1:E3:26:B3:04:A4:EC:DF:02:3A:59:CF:C0:B6:13:C2:52:B0:0F:61:61:00:0B:65:E3:84:99:D3:75:87:47:9E:40:49:40:30:C8:FE:8C:F0:E5:E4:14:91:B9:1B:1B:9C:20:5E\r\na=setup:actpass\r\nm=application 54593 DTLS/SCTP 5000\r\nc=IN IP4 172.17.0.1\r\na=mid:2\r\na=sctpmap:5000 webrtc-datachannel 65535\r\na=max-message-size:65536\r\na=candidate:580b5f32035da7f14a30ea7a8d826c67 1 udp 2130706431 172.17.0.1 54593 typ host\r\na=candidate:6e97dfe71117b08efa859b3be391006f 1 udp 2130706431 192.168.12.119 49646 typ host\r\na=candidate:348906676dcb58d1f77c4056aef9d9ab 1 udp 2130706431 10.144.103.9 56202 typ host\r\na=end-of-candidates\r\na=ice-ufrag:kCSs\r\na=ice-pwd:H1wfCmRWxPj5tRXU8hcaZn\r\na=fingerprint:sha-256 4B:5D:A2:C3:59:D3:E0:85:0D:6F:72:35:B8:30:5D:58:32:38:90:79:26:68:47:D4:F7:CB:2F:59:2A:06:FF:A5\r\na=fingerprint:sha-384 7A:D5:84:D7:61:17:AA:5B:44:D6:9C:7D:DC:04:36:43:76:41:19:66:12:71:36:F7:77:A8:65:1D:E6:EC:9A:2C:C3:FF:EE:E1:38:04:34:54:0E:C0:7A:72:1D:E7:91:07\r\na=fingerprint:sha-512 E7:A2:AD:70:02:05:D9:3A:9F:3D:CE:84:19:85:D1:E3:26:B3:04:A4:EC:DF:02:3A:59:CF:C0:B6:13:C2:52:B0:0F:61:61:00:0B:65:E3:84:99:D3:75:87:47:9E:40:49:40:30:C8:FE:8C:F0:E5:E4:14:91:B9:1B:1B:9C:20:5E\r\na=setup:actpass\r\n",
    //     "type": "offer",
    //     "token": "",
    // }

    const sdpreq = {
        id: "",
        // id: "STA_localNetwork",
        //ip: "192.168.12.1",
        // @ts-ignore
        sdp: pc.localDescription.sdp,
        type: "offer",
        token: "",
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
