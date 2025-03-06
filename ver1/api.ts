import { Context, Next, Router } from "https://deno.land/x/oak@v17.1.4/mod.ts"
export const apiRouter = new Router()

apiRouter.get("/bla", (ctx: Context) => {
    ctx.response.body = "yo"
})

apiRouter.post("/init", async (ctx: Context, next: Next) => {
    console.log(await ctx.request.body.json())
    await next()
})
