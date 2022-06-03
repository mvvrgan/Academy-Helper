import 'dotenv/config';

import * as utils from './utils/utils';
import * as bot from './bot'

/* Discord */
utils.apps.discord.login(process.env.DISCORD_TOKEN)
    .then(res => {
        console.log(res);
        bot.start();
    })
    .catch(err => {
        console.log(err);
    });