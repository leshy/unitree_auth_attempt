import { Context, Router } from "https://deno.land/x/oak/mod.ts"
export const apiRouter = new Router()

apiRouter.get("/bla", (ctx: Context) => {
    ctx.response.body = "yo"
})
