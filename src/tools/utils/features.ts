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
    //let Channel: discord.TextChannel = await client.channels.fetch('991748086563098624') as discord.TextChannel

    let Embed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(`Feature Showcase `)
        .addField('Featuring', info.FeaturingTag)
        .addField('Notes', info.Info)
        .setImage(info.ImageUrl)
        .setTimestamp()
        .setColor('#fcca03')
        .setFooter(`Academy Features`)

    const row = new discord.MessageActionRow()
        .addComponents(
            new discord.MessageButton()
                .setCustomId('acceptfeature')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new discord.MessageButton()
                .setCustomId('denyfeature')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );

    user.send({ embeds: [Embed], components: [row] })
        .then((message) => {
            // Collector
            const collector = message.createMessageComponentCollector();
            collector.on('collect', async i => {
                if ((i.customId === 'acceptfeature' || i.customId === 'denyfeature') && i.user.id === user.id) {
                    row.components[0].setDisabled(true)
                    row.components[1].setDisabled(true)
                    if (i.customId === 'denyfeature') { return i.reply(`Cancelled prompt!`) }
                }
                else {
                    return
                }
                message.edit({ components: [row] })

                // Posting to chanel
                let Channel: discord.TextChannel = await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).channels.fetch('979748021208252437') as discord.TextChannel
                Channel.send({ embeds: [Embed] })
                    .then((msg) => {
                        // Reaction Set
                        msg.react('⭐')

                        // Send Message to user
                        let DMEmbed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Posted feature showcase!`)
                            .setDescription(`You can view the post [here](https://discord.com/channels/${process.env.DISCORD_GUILD}/${Channel.id}/${msg.id})!`)
                            .setTimestamp()
                            .setColor('#73de82')
                            .setFooter(`Academy Features`)

                        return i.reply({ embeds: [DMEmbed] })
                    })
            });
        })
}

export async function run(interaction, client) {
    let user = interaction.user;

    await interaction.reply("Starting Prompt...")

    //Who are you featuring?
    input(client, user, { title: `Who are you featuring?`, description: `Please provide the user tag (<@ID>)!` }, 30)
        .then(async (response: string) => {
            let FeaturingTag = response
            console.log(FeaturingTag)

            //Who are you featuring?
            input(client, user, { title: `Please provide short info about the feature!`, description: `If no info, please state 'None'` }, 60)
                .then(async (response: string) => {
                    let Info = response
                    console.log(Info)

                    //Image
                    inputAttachmentOptional(client, user, { title: `Would you like to use an image to showcase this work?`, description: `If you would like to upload an image to the feature, send the attachment; if not, please click 'Done!'` }, 30)
                        .then((response) => {
                            let ImageUrl = response
                            console.log(ImageUrl)

                            // Finalization
                            finalize(client, user, { FeaturingTag, Info, ImageUrl })
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