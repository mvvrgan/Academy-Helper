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
    let Embed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(info.Title)
        .setDescription(info.Info)
        .setImage(info.ImageUrl)
        .setTimestamp()
        .setColor('#4287f5')
        .setFooter(`Academy Marketplace`)

    const row = new discord.MessageActionRow()
        .addComponents(
            new discord.MessageButton()
                .setCustomId('acceptpoll')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new discord.MessageButton()
                .setCustomId('denypoll')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );

    user.send({ embeds: [Embed], components: [row] })
        .then((message) => {
            // Collector
            const collector = message.createMessageComponentCollector();
            collector.on('collect', async i => {
                if ((i.customId === 'acceptpoll' || i.customId === 'denypoll') && i.user.id === user.id) {
                    row.components[0].setDisabled(true)
                    row.components[1].setDisabled(true)
                    if (i.customId === 'denypoll') { return i.reply(`Cancelled prompt!`) }
                }
                else {
                    return
                }
                message.edit({ components: [row] })

                // Posting to chanel
                let Channel: discord.TextChannel = await client.channels.fetch('979747895177773156') as discord.TextChannel
                Channel.send({ embeds: [Embed], content: `<@&987565809616425030>`})
                    .then((msg) => {
                        // Reaction Set
                        msg.react('👍')
                        msg.react('👎')

                        // Send Message to user
                        let DMEmbed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Your poll was posted!`)
                            .setDescription(`You can view your poll [here](https://discord.com/channels/${process.env.DISCORD_GUILD}/${Channel.id}/${msg.id})!`)
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
    input(client, user, { title: `What is the title of your poll?`, description: `This should be short and snappy` }, 30)
        .then(async (response: string) => {
            let Title = response
            console.log(Title)

            input(client, user, { title: `Now give information on the poll`, description: `This should be detailed` }, 120)
                .then(async (response: string) => {
                    let Info = response
                    console.log(Info)

                    //Image
                    inputAttachmentOptional(client, user, { title: `Would you like to upload an image to your poll?`, description: `If you would like to upload an image to your poll, send the attachment; if not, please click 'Done!'` }, 30)
                    .then((response) => {
                        let ImageUrl = response
                        console.log(ImageUrl)

                        // Finalization
                        finalize(client, user, { Title, Info, ImageUrl })
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