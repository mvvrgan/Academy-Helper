import 'dotenv/config';

import * as utils from './tools/utils/utils';
import * as server from './tools/server'
import * as bot from './tools/bot'

/* Discord */
utils.apps.discord.login(process.env.DISCORD_TOKEN)
    .then(res => {
        console.log(res);
        bot.start();
    })
    .catch(err => {
        console.log(err);
    });

/* Roblox */
utils.apps.roblox.login(process.env.RBLX_COOKIE)
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.log(err);
    });

/* Server */
server.start(80)