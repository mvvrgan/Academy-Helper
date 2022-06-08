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
    let Channel: discord.TextChannel = await client.channels.fetch('982407369285832775') as discord.TextChannel

    let Embed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(`Hiring Post`)
        .addField(`Hiring`, info.Hiring)
        .addField(`Information`, info.Information)
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
            utils.apps.mysql.query(`INSERT INTO posts (messageid, userid, targetchannelid) VALUES (?, ?, ?)`, [msg.id, user.id, '979759116316708964'])

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

    //Who are you hiring?
    input(client, user, { title: `Who are you trying to hire?`, description: `scripter, builder, modeler, interference, graphics, animator, composer, other` }, 60)
        .then((response: string) => {
            let Hiring = response
            console.log(Hiring)

            //Information
            input(client, user, { title: `Please provide some information`, description: `Describe what your hiring post is about. Describe the job needed, and other important details!` }, 120)
                .then((response) => {
                    let Information = response
                    console.log(Information)

                    //Compensation
                    input(client, user, { title: `How much are you compensating?`, description: `Include the price & the currency: R$, $, £` }, 30)
                        .then((response) => {
                            let Payment = response
                            console.log(Payment)

                            //Image
                            inputAttachmentOptional(client, user, { title: `Would you like to upload an image to your post?`, description: `If you would like to upload an image to your post, send the attachment; if not, please click 'Done!'` }, 30)
                                .then((response) => {
                                    let ImageUrl = response
                                    console.log(ImageUrl)

                                    // Finalization
                                    finalize(client, user, { Hiring, Information, Payment, ImageUrl })
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
}