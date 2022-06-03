import * as roblox from 'noblox.js'

/* Functions */

function login(Cookie: string) {
    return new Promise((resolve, reject) => {
        roblox.setCookie(Cookie)
            .then((user) => {
                resolve(`[ROBLOX] Successfully logged in as ${user.UserName}!`)
            })
    })
}

/* Exports */
export {login}