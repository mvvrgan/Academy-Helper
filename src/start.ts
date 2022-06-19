import 'dotenv/config';

import * as utils from './tools/utils/utils';
import * as posts from './tools/posts/posts';
import * as applications from './tools/utils/applications';
import * as giveaways from './tools/utils/giveaways';
import * as bot from './tools/bot'

/* Discord */
utils.apps.discord.login(process.env.DISCORD_TOKEN)
    .then(async res => {
        console.log(res);
        bot.start();
        //await (await (utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).members.fetch('525658603323916308'))).roles.add('982087242052960276')
    })
    .catch(err => {
        console.log(err);
    });

utils.bans.startCheck();
utils.mutes.startCheck();
giveaways.startCheck();

posts.mod();
applications.mod();
applications.startCheck(); 