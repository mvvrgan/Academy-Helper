import * as utils from '../utils/utils';
import * as discord from "discord.js";
import * as ms from "ms";

function input(client: discord.Client, user: discord.User, question, time) {
    return new Promise(async (resolve, reject) => {
        let Embed = new discord.MessageEmbed()
            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
            .setTitle(question.title)
            .setDescription(question.description)
            .setTimestamp()
            .setColor('#4287f5')
            .setFooter(`${time} seconds to reply`)

        await user.send({ embeds: [Embed] })
            .catch(err => reject({ dm: false, error: err }))

        user.dmChannel.awaitMessages({
            max: 1,
            time: time * 1000,
            errors: ["time"]
        })
            .then((msgs) => {
                let message = msgs.first()
                return resolve(message.content)
            })
            .catch(() => {
                return reject({ dm: true, error: `${time} second interval passed!` })
            })
    })
}

function inputAttachmentOptional(client: discord.Client, user: discord.User, question, time) {
    return new Promise(async (resolve, reject) => {
        let Embed = new discord.MessageEmbed()
            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
            .setTitle(question.title)
            .setDescription(question.description)
            .setTimestamp()
            .setColor('#4287f5')
            .setFooter(`${time} seconds to reply`)

        const row = new discord.MessageActionRow()
            .addComponents(
                new discord.MessageButton()
                    .setCustomId('done')
                    .setLabel('Done!')
                    .setStyle('SUCCESS'),
            );

        await user.send({ embeds: [Embed], components: [row] })
            .then((msg) => {
                const collector = msg.createMessageComponentCollector();
                collector.on('collect', async i => {
                    if ((i.customId === 'done') && i.user.id === user.id) {
                        row.components[0].setDisabled(true)
                    }
                    else {
                        return
                    }
                    let Message: discord.Message = i.message as discord.Message
                    Message.edit({ components: [row] })
                    i.reply('You chose to not upload an image!');
                    return resolve('')
                });

            })
            .catch(err => reject({ dm: false, error: err }))

        user.dmChannel.awaitMessages({
            max: 1,
            time: time * 1000,
            errors: ["time"]
        })
            .then((msgs) => {
                let message = msgs.first()
                if (message.attachments.size == 0) {
                    return reject({ dm: true, error: `Please either click 'Done!' or send an image` })
                }

                let Attachment = message.attachments.first()
                return resolve(Attachment.url)
            })
            .catch(() => {
                return reject({ dm: true, error: `${time} second interval passed!` })
            })
    })
}

async function finalize(client: discord.Client, user: discord.User, info) {
    let Channel: discord.TextChannel = await client.channels.fetch('985327180978479124') as discord.TextChannel

    let Embed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(`🎁 Giveaway Prize: ${info.Prize} 🎁`)
        .addField('Amount of Winners', info.Winners)
        .addField('Requirement', info.Requirements)
        .setImage(info.ImageUrl)
        .setTimestamp()
        .setColor('#4287f5')
        .setFooter(`Academy Marketplace`)

    const row = new discord.MessageActionRow()
        .addComponents(
            new discord.MessageButton()
                .setCustomId('acceptgiveaway')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new discord.MessageButton()
                .setCustomId('denygiveaway')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );

    user.send({ embeds: [Embed], components: [row] })
        .then((message) => {
            // Collector
            const collector = message.createMessageComponentCollector();
            collector.on('collect', async i => {
                if ((i.customId === 'acceptgiveaway' || i.customId === 'denygiveaway') && i.user.id === user.id) {
                    row.components[0].setDisabled(true)
                    row.components[1].setDisabled(true)
                    if (i.customId === 'denygiveaway') { return i.reply(`Cancelled prompt!`) }
                }
                else {
                    return
                }
                message.edit({ components: [row] })

                // Ending info
                info.Ends = new Date(Date.now() + ms(info.Ends))
                let Ends = new Date(info.Ends)
                let EndsString = `${Ends.getFullYear()}-${Ends.getMonth() + 1}-${Ends.getDate()} ${Ends.getHours()}:${Ends.getMinutes()}:${Ends.getSeconds()}`
                Embed.addField('Ends', Ends.toLocaleString())

                // Posting to chanel
                let Channel: discord.TextChannel = await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).channels.fetch('979748078171070564') as discord.TextChannel
                Channel.send({ embeds: [Embed], content: `<@&987546413867077672>` })
                    .then((msg) => {
                        // Reaction Set
                        msg.react('🎁')

                        // Database Entry
                        utils.apps.mysql.query(`INSERT INTO giveaways (messageid, userid, prize, ends, winners) VALUES (?, ?, ?, ?, ${parseInt(info.Winners)})`, [msg.id, user.id, info.Prize, EndsString])

                        // Send Message to user
                        let DMEmbed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Your giveaway was posted!`)
                            .setDescription(`You can view your giveaway [here](https://discord.com/channels/${process.env.DISCORD_GUILD}/${Channel.id}/${msg.id})!`)
                            .setTimestamp()
                            .setColor('#73de82')
                            .setFooter(`Academy Marketplace`)

                        return i.reply({ embeds: [DMEmbed] })
                    })
            });
        })
}

export async function run(interaction, client) {
    let user = interaction.user;

    await interaction.reply("Starting Prompt...")

    //Who are you hiring?
    input(client, user, { title: `What are you giving away?`, description: `Don't need much detail; just say what the prize is!` }, 60)
        .then(async (response: string) => {
            let Prize = response
            console.log(Prize)

            input(client, user, { title: `How many winners will there be?`, description: `A number is needed` }, 30)
                .then(async (response: string) => {
                    let Winners = response
                    console.log(Winners)

                    if (!parseInt(Winners)) {
                        let Embed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Prompt Cancelled`)
                            .setDescription(`Please send a valid number of winners!`)
                            .setTimestamp()
                            .setColor('#eb4334')
                            .setFooter('Academy Helper')

                        return await user.send({ embeds: [Embed] })
                            .catch()
                    }
                    else if (parseInt(Winners) > 10) {
                        let Embed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Prompt Cancelled`)
                            .setDescription(`Please send a valid number of winners!`)
                            .setTimestamp()
                            .setColor('#eb4334')
                            .setFooter('Academy Helper')

                        return await user.send({ embeds: [Embed] })
                            .catch()
                    }

                    input(client, user, { title: `Is there any requirements? If so, list them, if not, type 'None.'`, description: `Can be certain level, message count, etc.` }, 60)
                        .then(async (response: string) => {
                            let Requirements = response
                            console.log(Requirements)

                            input(client, user, { title: `When will the giveaway end?`, description: `Enter how long the giveaway will last` }, 30)
                                .then(async (response: string) => {
                                    let Ends = response
                                    console.log(Ends)

                                    //Image
                                    inputAttachmentOptional(client, user, { title: `Would you like to upload an image to your application?`, description: `If you would like to upload an image to your application, send the attachment; if not, please click 'Done!'` }, 30)
                                        .then((response) => {
                                            let ImageUrl = response
                                            console.log(ImageUrl)

                                            // Finalization
                                            finalize(client, user, { Prize, Winners, Requirements, Ends, ImageUrl })
                                        })
                                        .catch(async (error) => {
                                            if (error.dm) {
                                                let Embed = new discord.MessageEmbed()
                                                    .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                                                    .setTitle(`There was an error`)
                                                    .setDescription(error.error)
                                                    .setTimestamp()
                                                    .setColor('#eb4334')
                                                    .setFooter('Academy Helper')

                                                await user.send({ embeds: [Embed] })
                                                    .catch()
                                            }
                                            return
                                        })
                                })
                                .catch(async (error) => {
                                    if (error.dm) {
                                        let Embed = new discord.MessageEmbed()
                                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                                            .setTitle(`There was an error`)
                                            .setDescription(error.error)
                                            .setTimestamp()
                                            .setColor('#eb4334')
                                            .setFooter('Academy Helper')

                                        await user.send({ embeds: [Embed] })
                                            .catch()
                                    }
                                    return
                                })
                        })
                        .catch(async (error) => {
                            if (error.dm) {
                                let Embed = new discord.MessageEmbed()
                                    .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                                    .setTitle(`There was an error`)
                                    .setDescription(error.error)
                                    .setTimestamp()
                                    .setColor('#eb4334')
                                    .setFooter('Academy Helper')

                                await user.send({ embeds: [Embed] })
                                    .catch()
                            }
                            return
                        })
                })
                .catch(async (error) => {
                    if (error.dm) {
                        let Embed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`There was an error`)
                            .setDescription(error.error)
                            .setTimestamp()
                            .setColor('#eb4334')
                            .setFooter('Academy Helper')

                        await user.send({ embeds: [Embed] })
                            .catch()
                    }
                    return
                })
        })
        .catch(async (error) => {
            if (error.dm) {
                let Embed = new discord.MessageEmbed()
                    .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                    .setTitle(`There was an error`)
                    .setDescription(error.error)
                    .setTimestamp()
                    .setColor('#eb4334')
                    .setFooter('Academy Helper')

                await user.send({ embeds: [Embed] })
                    .catch()
            }
            return
        })
};

export function rollwinners(giveaway) {
    return new Promise(async (resolve, reject) => {
        let Winners = giveaway.winners
        let Prize = giveaway.prize

        let Channel: discord.TextChannel = await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).channels.fetch('979748078171070564') as discord.TextChannel
        let GiveawayMessage: discord.Message = await Channel.messages.fetch(giveaway.messageid)

        utils.apps.mysql.query(`DELETE FROM giveaways WHERE messageid = ?`, [giveaway.messageid])
            .then(async () => {
                let GiveawayWinners = []

                let reactions = await GiveawayMessage.reactions.resolve('🎁')
                let usersreacted = await reactions.users.fetch()
                usersreacted.delete(utils.apps.discord.Client.user.id)

                if (usersreacted.size < Winners) {
                    return reject({ error: `Not enough people reacted to the giveaway!` })
                }

                for (let i = 0; i < Winners; i++) {
                    let Winner = usersreacted.random()
                    GiveawayWinners.push(Winner)
                    usersreacted.delete(Winner.id)
                }

                return resolve(GiveawayWinners)
            })
    })
};

export function check() {
    return new Promise(async (resolve, reject) => {
        utils.apps.mysql.query(`SELECT * FROM giveaways`)
            .then(giveaways => {
                if (giveaways.length > 0) {
                    giveaways.forEach(giveaway => {
                        let giveawayends = new Date(giveaway['ends'])
                        let timenow = new Date()

                        if (timenow > giveawayends) {
                            rollwinners(giveaway)
                                .then(async (Winners: any) => {
                                    let Channel: discord.TextChannel = await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).channels.fetch('979748078171070564') as discord.TextChannel
                                    let GiveawayMessage: discord.Message = await Channel.messages.fetch(giveaway['messageid'])

                                    // reply to giveaway message with the winners with just a string message
                                    let Embed = GiveawayMessage.embeds[0]
                                    Embed.setColor('#eb4334')
                                    Embed.fields[2].value = `Already ended`
                                    Embed.addField('Winners', `${Winners.map(winner => `<@${winner.id}>`).join(', ')}`)

                                    GiveawayMessage.edit({ embeds: [Embed] })
                                    GiveawayMessage.reply(`The giveaway has ended! The winners are: ${Winners.map(winner => `<@${winner.id}>`).join(', ')}`)
                                })
                        }
                    });
                }
            });
    });
};

export function startCheck() {
    setInterval(check, 1000)
}