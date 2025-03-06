import { Context, Next, Router } from "https://deno.land/x/oak@v17.1.4/mod.ts"
export const staticRouter = new Router()

// Serve static files
staticRouter.get("/(.*)", async (ctx: Context, next: Next) => {
    try {
        await ctx.send({
            root: `${Deno.cwd()}/static`,
            index: "index.html",
        })
    } catch {
        await next()
    }
})
