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

let MessageEmbed = new discord.MessageEmbed()
                        .setColor('#474747')
                        .setFooter('Purchasing Hub');

/* Properties Exports */
export {DiscordClient as Client};
export {MessageEmbed as Embed};

/* Function Exports */
export {login};