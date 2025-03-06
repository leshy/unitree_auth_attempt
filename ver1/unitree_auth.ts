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
    sdp: RTCSessionDescription,
    // @ts-ignore
): RTCSessionDescriptionInit {
    // const captured_from_legion_py_sdp = {
    //     "id": "",
    //     "sdp":
    //         "v=0\r\no=- 3950241439 3950241439 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1 2\r\na=msid-semantic:WMS *\r\nm=audio 47886 UDP/TLS/RTP/SAVPF 96 0 8\r\nc=IN IP4 172.17.0.1\r\na=sendrecv\r\na=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:2 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=mid:0\r\na=msid:08bf71f3-2056-4487-a6ae-f8e02448ac39 802b5f53-5f08-46c4-b198-7aeb3e4e586b\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=rtcp-mux\r\na=ssrc:2423869274 cname:5b335376-6089-4951-9193-35f7d9b1ffe5\r\na=rtpmap:96 opus/48000/2\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=candidate:580b5f32035da7f14a30ea7a8d826c67 1 udp 2130706431 172.17.0.1 47886 typ host\r\na=candidate:6e97dfe71117b08efa859b3be391006f 1 udp 2130706431 192.168.12.119 47443 typ host\r\na=candidate:348906676dcb58d1f77c4056aef9d9ab 1 udp 2130706431 10.144.103.9 49715 typ host\r\na=end-of-candidates\r\na=ice-ufrag:kCSs\r\na=ice-pwd:H1wfCmRWxPj5tRXU8hcaZn\r\na=fingerprint:sha-256 4B:5D:A2:C3:59:D3:E0:85:0D:6F:72:35:B8:30:5D:58:32:38:90:79:26:68:47:D4:F7:CB:2F:59:2A:06:FF:A5\r\na=fingerprint:sha-384 7A:D5:84:D7:61:17:AA:5B:44:D6:9C:7D:DC:04:36:43:76:41:19:66:12:71:36:F7:77:A8:65:1D:E6:EC:9A:2C:C3:FF:EE:E1:38:04:34:54:0E:C0:7A:72:1D:E7:91:07\r\na=fingerprint:sha-512 E7:A2:AD:70:02:05:D9:3A:9F:3D:CE:84:19:85:D1:E3:26:B3:04:A4:EC:DF:02:3A:59:CF:C0:B6:13:C2:52:B0:0F:61:61:00:0B:65:E3:84:99:D3:75:87:47:9E:40:49:40:30:C8:FE:8C:F0:E5:E4:14:91:B9:1B:1B:9C:20:5E\r\na=setup:actpass\r\nm=video 50963 UDP/TLS/RTP/SAVPF 97 98 99 100 101 102\r\nc=IN IP4 172.17.0.1\r\na=recvonly\r\na=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=mid:1\r\na=msid:08bf71f3-2056-4487-a6ae-f8e02448ac39 e1bb5bb8-b9ae-407e-8eaf-1af7ef051d05\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=rtcp-mux\r\na=ssrc-group:FID 2728868107 4080167128\r\na=ssrc:2728868107 cname:5b335376-6089-4951-9193-35f7d9b1ffe5\r\na=ssrc:4080167128 cname:5b335376-6089-4951-9193-35f7d9b1ffe5\r\na=rtpmap:97 VP8/90000\r\na=rtcp-fb:97 nack\r\na=rtcp-fb:97 nack pli\r\na=rtcp-fb:97 goog-remb\r\na=rtpmap:98 rtx/90000\r\na=fmtp:98 apt=97\r\na=rtpmap:99 H264/90000\r\na=rtcp-fb:99 nack\r\na=rtcp-fb:99 nack pli\r\na=rtcp-fb:99 goog-remb\r\na=fmtp:99 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:100 rtx/90000\r\na=fmtp:100 apt=99\r\na=rtpmap:101 H264/90000\r\na=rtcp-fb:101 nack\r\na=rtcp-fb:101 nack pli\r\na=rtcp-fb:101 goog-remb\r\na=fmtp:101 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:102 rtx/90000\r\na=fmtp:102 apt=101\r\na=candidate:580b5f32035da7f14a30ea7a8d826c67 1 udp 2130706431 172.17.0.1 50963 typ host\r\na=candidate:6e97dfe71117b08efa859b3be391006f 1 udp 2130706431 192.168.12.119 47784 typ host\r\na=candidate:348906676dcb58d1f77c4056aef9d9ab 1 udp 2130706431 10.144.103.9 33408 typ host\r\na=end-of-candidates\r\na=ice-ufrag:kCSs\r\na=ice-pwd:H1wfCmRWxPj5tRXU8hcaZn\r\na=fingerprint:sha-256 4B:5D:A2:C3:59:D3:E0:85:0D:6F:72:35:B8:30:5D:58:32:38:90:79:26:68:47:D4:F7:CB:2F:59:2A:06:FF:A5\r\na=fingerprint:sha-384 7A:D5:84:D7:61:17:AA:5B:44:D6:9C:7D:DC:04:36:43:76:41:19:66:12:71:36:F7:77:A8:65:1D:E6:EC:9A:2C:C3:FF:EE:E1:38:04:34:54:0E:C0:7A:72:1D:E7:91:07\r\na=fingerprint:sha-512 E7:A2:AD:70:02:05:D9:3A:9F:3D:CE:84:19:85:D1:E3:26:B3:04:A4:EC:DF:02:3A:59:CF:C0:B6:13:C2:52:B0:0F:61:61:00:0B:65:E3:84:99:D3:75:87:47:9E:40:49:40:30:C8:FE:8C:F0:E5:E4:14:91:B9:1B:1B:9C:20:5E\r\na=setup:actpass\r\nm=application 54593 DTLS/SCTP 5000\r\nc=IN IP4 172.17.0.1\r\na=mid:2\r\na=sctpmap:5000 webrtc-datachannel 65535\r\na=max-message-size:65536\r\na=candidate:580b5f32035da7f14a30ea7a8d826c67 1 udp 2130706431 172.17.0.1 54593 typ host\r\na=candidate:6e97dfe71117b08efa859b3be391006f 1 udp 2130706431 192.168.12.119 49646 typ host\r\na=candidate:348906676dcb58d1f77c4056aef9d9ab 1 udp 2130706431 10.144.103.9 56202 typ host\r\na=end-of-candidates\r\na=ice-ufrag:kCSs\r\na=ice-pwd:H1wfCmRWxPj5tRXU8hcaZn\r\na=fingerprint:sha-256 4B:5D:A2:C3:59:D3:E0:85:0D:6F:72:35:B8:30:5D:58:32:38:90:79:26:68:47:D4:F7:CB:2F:59:2A:06:FF:A5\r\na=fingerprint:sha-384 7A:D5:84:D7:61:17:AA:5B:44:D6:9C:7D:DC:04:36:43:76:41:19:66:12:71:36:F7:77:A8:65:1D:E6:EC:9A:2C:C3:FF:EE:E1:38:04:34:54:0E:C0:7A:72:1D:E7:91:07\r\na=fingerprint:sha-512 E7:A2:AD:70:02:05:D9:3A:9F:3D:CE:84:19:85:D1:E3:26:B3:04:A4:EC:DF:02:3A:59:CF:C0:B6:13:C2:52:B0:0F:61:61:00:0B:65:E3:84:99:D3:75:87:47:9E:40:49:40:30:C8:FE:8C:F0:E5:E4:14:91:B9:1B:1B:9C:20:5E\r\na=setup:actpass\r\n",
    //     "type": "offer",
    //     "token": "",
    // }

    // copying format here
    const sdpData = {
        //id: "STA_localNetwork",
        id: "",
        sdp: sdp.sdp,
        type: "offer",
        token: "",
    }

    console.log("sdp is", sdpData)
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
        // TODO :re-verify AES
        "data1": crypto.aesEncrypt(aesKey, JSON.stringify(sdpData)),
        // TODO :re-verify RSA
        "data2": await crypto.rsaEncrypt(rsaPubKey, aesKey),
    }

    const pathEnding = calc_local_path_ending(data1)

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
    // @ts-ignore
): Promise<unknown> {
    const pc = new RTCPeerConnection()
    const dataChannel = pc.createDataChannel("data", { id: 2 })

    // Set up data channel handlers
    dataChannel.onopen = () => {
        console.log("Data channel opened")
    }

    // Create offer with proper configuration
    pc.addTransceiver("video", { direction: "recvonly" })
    pc.addTransceiver("audio", { direction: "recvonly" })
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    console.log("Creating offer...")

    return send_sdp_to_local_peer_new_method(
        ip,
        pc.localDescription as RTCSessionDescription,
    )

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
