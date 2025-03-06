import { Context, Router } from "https://deno.land/x/oak/mod.ts"
export const staticRouter = new Router()

// Serve static files
staticRouter.get("/(.*)", async (ctx: Context) => {
    try {
        await ctx.send({
            root: `${Deno.cwd()}/static`,
            index: "index.html",
        })
    } catch {
        ctx.response.status = 404
        ctx.response.body = "404 Not Found"
    }
})
