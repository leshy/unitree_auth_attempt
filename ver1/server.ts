import {
    Application,
    Context,
    Next,
} from "https://deno.land/x/oak@v17.1.4/mod.ts"

import { apiRouter } from "./api.ts"
import { staticRouter } from "./static.ts"

const settings = { oak: { port: 3000 } }
const env = { settings }

const app = new Application()

const logging = async (ctx: Context, next: Next) => {
    console.log(`HTTP ${ctx.request.method} on ${ctx.request.url}`)
    await next()
}

app.use(logging)
app.use(apiRouter.routes())
app.use(apiRouter.allowedMethods())
app.use(staticRouter.routes())
app.use(staticRouter.allowedMethods())

app.addEventListener("listen", () => {
    console.log(`Listening on *:${env.settings.oak.port}`)
})

app.listen(env.settings.oak)
