import * as discord from "discord.js";
const DiscordClient = new discord.Client({ intents: new discord.Intents(32767) })

/* Functions */

function login (Token: string) {
    return new Promise((resolve, reject) => {
        DiscordClient.login(Token)
            .then(() => {
                resolve(`[DISCORD] Successfully logged in as ${DiscordClient.user.tag}!`);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

/* Properties Exports */
export {DiscordClient as Client};

/* Function Exports */
export {login};