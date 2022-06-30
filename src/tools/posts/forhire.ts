import * as utils from "../utils/utils";
import * as discord from "discord.js";

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
    let Channel: discord.TextChannel = await client.channels.fetch('990598535089123398') as discord.TextChannel

    let Embed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(`For hire Post`)
        .addField(`Skills`, info.Skill)
        .addField(`About Me / My Skills`, info.Information)
        .addField(`Portfolio`, info.Portfolio)
        .addField(`Payment`, info.Payment)
        .addField(`Contact`, `<@${user.id}>`)
        .setImage(info.ImageUrl)
        .setTimestamp()
        .setColor('#4287f5')
        .setFooter(`Academy Marketplace`)

    const row = new discord.MessageActionRow()
        .addComponents(
            new discord.MessageButton()
                .setCustomId('accept')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new discord.MessageButton()
                .setCustomId('deny')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );

    Channel.send({ embeds: [Embed], components: [row] })
        .then((msg) => {
            // Database Entry
            utils.apps.mysql.query(`INSERT INTO posts (messageid, userid, targetchannelid) VALUES (?, ?, ?)`, [msg.id, user.id, '979759161636184094'])

            let DMEmbed = new discord.MessageEmbed()
                .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                .setTitle(`Your post is pending!`)
                .setDescription(`Staff will review your post to make sure all the information is accurate and correct. This may take up to 48 hours!`)
                .setTimestamp()
                .setColor('#ffcd29')
                .setFooter(`Academy Marketplace`)

            user.send({ embeds: [DMEmbed] })
        })
}

export async function run(interaction, client) {
    let user = interaction.user;

    await interaction.reply("Starting Prompt...")

    const row = new discord.MessageActionRow()
        .addComponents(
            new discord.MessageButton()
                .setCustomId('proceed')
                .setLabel('Proceed')
                .setStyle('SUCCESS'),
            new discord.MessageButton()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle('DANGER'),
        );

    let DMEmbed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(`Before you start...`)
        .setDescription(`Your For-Hire post will not be accepted if you dont have the required skill role. You can apply for a skill rank using /apply
        If you wish to proceed, click 'Proceed'`)
        .setTimestamp()
        .setColor('#ffcd29')
        .setFooter(`Academy Marketplace`)

    await user.send({ embeds: [DMEmbed], components: [row] })
        .then(async (msg) => {
            const collector = msg.createMessageComponentCollector();
            await new Promise(async (resolve, reject) => {
                collector.on('collect', async i => {
                    if ((i.customId === 'proceed') && i.user.id === user.id) {
                        row.components[0].setDisabled(true)
                        row.components[1].setDisabled(true)
                        let Message: discord.Message = i.message as discord.Message
                        Message.edit({ components: [row] })
                        return resolve(i.reply('Continuing Prompt...'))
                    }
                    else if ((i.customId === 'cancel') && i.user.id === user.id) {
                        row.components[0].setDisabled(true)
                        row.components[1].setDisabled(true)
                        let Message: discord.Message = i.message as discord.Message
                        Message.edit({ components: [row] })
                        return reject(i.reply('Cancelled prompt successfully!'))
                    }
                    else {
                        return
                    }
                });
            })
                .then(() => {

                    //Who are you hiring?
                    input(client, user, { title: `What skill do you specialize in?`, description: `scripter, builder, modeler, interference, graphics, animator, composer, other` }, 60)
                        .then((response: string) => {
                            let Skill = response
                            console.log(Skill)

                            //Information
                            input(client, user, { title: `Give some detail about your skills`, description: `Tell us about you & your skills` }, 120)
                                .then((response) => {
                                    let Information = response
                                    console.log(Information)

                                    //Compensation
                                    input(client, user, { title: `How much do you charge for your work?`, description: `Include the price & the currency: R$, $, £` }, 30)
                                        .then((response) => {
                                            let Payment = response
                                            console.log(Payment)

                                            //Portfolio
                                            input(client, user, { title: `Send a link to your portfolio`, description: `Devforum, Bloxfolio, Google Docs, etc` }, 30)
                                                .then((response) => {
                                                    let Portfolio = response
                                                    console.log(Payment)

                                                    //Image
                                                    inputAttachmentOptional(client, user, { title: `Would you like to upload an image to your post?`, description: `If you would like to upload an image to your post, send the attachment; if not, please click 'Done!'` }, 30)
                                                        .then((response) => {
                                                            let ImageUrl = response
                                                            console.log(ImageUrl)

                                                            // Finalization
                                                            finalize(client, user, { Skill, Information, Payment, Portfolio, ImageUrl })
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
                })
                .catch(console.log)
        })
        .catch(console.log)
}