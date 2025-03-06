import * as wm from "./wm.ts"
import * as controls from "./controls.ts"

const root = new wm.Window()
document.getElementById("window-container")?.appendChild(root.element)

const testWin = root.addWindow(new wm.Window("robot auth v1"))
testWin.element.style.height = "100vh"
// @ts-ignore
globalThis.testWin = testWin

const ctrl = new controls.Controls(testWin)
ctrl.addButton("connectRobot", "connect robot", connectRobot)

// deno-lint-ignore no-explicit-any
function log(...values: any[]) {
    const el = document.createElement("div")
    el.className = "logLine"
    // @ts-ignore
    el.textContent = values.map(JSON.stringify).join(" ")
    testWin.element.prepend(el)
}

function connectRobot() {
    fetch("/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            clientId: crypto.randomUUID(),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            log(data)
            console.log("Connection successful:", data)
        })
        .catch((error) => {
            console.error("Error connecting to robot:", error)
        })
}
