import { Context, Next, Router } from "https://deno.land/x/oak@v17.1.4/mod.ts"
import * as auth from "./unitree_auth.ts"

export const apiRouter = new Router()

apiRouter.get("/bla", (ctx: Context) => {
    ctx.response.body = "yo"
})

apiRouter.post("/init", async (ctx: Context, _: Next) => {
    console.log(await ctx.request.body.json())
    ctx.response.body = { status: "ok" }
})

apiRouter.post("/sdp", async (ctx: Context, _: Next) => {
    const { sdp, ip } = await ctx.request.body.json()
    const res = await auth.send_sdp_to_local_peer_new_method(ip, sdp)
    ctx.response.body = { status: res }
})
