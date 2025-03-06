import * as auth from "./unitree_auth.ts"

console.log(await auth.connect_robot("192.168.12.1"))
