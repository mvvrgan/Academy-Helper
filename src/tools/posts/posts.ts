import * as hiring from './hiring';
import * as forhire from './for-hire';
import * as buy from './buy';
import * as sell from './sell';

export { hiring, forhire, buy, sell }

import * as utils from '../utils/utils';
import * as discord from "discord.js";
export function mod() {
    utils.apps.discord.Client.on('interactionCreate', async (interaction) => {
        if (interaction['customId'] == "accept" || interaction['customId'] == "deny") {
            let postsdata = (await utils.apps.mysql.query(`SELECT * FROM posts WHERE userid=?`, [interaction.user.id]))

            await postsdata.forEach(async postdata => {
                if (postdata.messageid == interaction['message'].id) {
                    if (interaction['customId'] == "accept") {
                        // Posting
                        let Channel: discord.TextChannel = await utils.apps.discord.Client.channels.fetch(postdata.targetchannelid) as discord.TextChannel

                        let FinalEmbed: discord.MessageEmbed = interaction['message'].embeds[0]
                        FinalEmbed.setFooter(`Accepted by ${interaction.user.tag}`)

                        Channel.send({ embeds: interaction['message'].embeds })
                            .then(async msg => {
                                //
                                let user = await utils.apps.discord.Client.users.fetch(postdata.userid)

                                let DMEmbed = new discord.MessageEmbed()
                                    .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                                    .setTitle(`Your post was accepted!`)
                                    .setDescription(`You can view your post [here](https://discord.com/channels/${process.env.DISCORD_GUILD}/${postdata.targetchannelid}/${msg.id})!`)
                                    .addField('Accepted by', interaction.user.tag)
                                    .setTimestamp()
                                    .setColor('#73de82')
                                    .setFooter(`Academy Marketplace`)

                                user.send({ embeds: [DMEmbed] })
                            })
                    }
                    else if (interaction['customId'] == "deny") {
                        //
                        let user = await utils.apps.discord.Client.users.fetch(postdata.userid)

                        let DMEmbed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Your post was declined`)
                            .setDescription(`You post was declined, you are free to create a new post!`)
                            .addField('Declined by', interaction.user.tag)
                            .setTimestamp()
                            .setColor('#eb4334')
                            .setFooter(`Academy Marketplace`)

                        user.send({ embeds: [DMEmbed] })
                    }
                }
            });

            interaction['message'].delete();
        }
    })
}