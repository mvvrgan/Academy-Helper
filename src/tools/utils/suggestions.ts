import * as utils from '../utils/utils';
import * as discord from "discord.js";

export function mod() {
    utils.apps.discord.Client.on('interactionCreate', async (interaction) => {
        if (interaction['customId'] == "acceptsuggestion" || interaction['customId'] == "denysuggestion") {
            let postsdata = (await utils.apps.mysql.query(`SELECT * FROM suggestions WHERE userid=?`, [interaction.user.id]))

            await postsdata.forEach(async postdata => {
                if (postdata.messageid == interaction['message'].id) {
                    if (interaction['customId'] == "acceptsuggestion") {
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
                                    .setTitle(`Your suggestion was accepted!`)
                                    .setDescription(`You can view your suggestion [here](https://discord.com/channels/${process.env.DISCORD_GUILD}/${postdata.targetchannelid}/${msg.id})!`)
                                    .addField('Accepted by', interaction.user.tag)
                                    .setTimestamp()
                                    .setColor('#73de82')
                                    .setFooter(`Academy Marketplace`)

                                user.send({ embeds: [DMEmbed] })
                            })
                    }
                    else if (interaction['customId'] == "denysuggestion") {
                        //
                        let user = await utils.apps.discord.Client.users.fetch(postdata.userid)

                        let DMEmbed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Your suggestion was declined`)
                            .setDescription(`You suggestion was declined, you are free to create a new suggestion!`)
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
};

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
    let Channel: discord.TextChannel
    let TargetChannelId
    if (info.type == "Event") {
        Channel = await client.channels.fetch('987577086120177684') as discord.TextChannel
        TargetChannelId = '979748896253300826'
    }
    else if (info.type == "Server") {
        Channel = await client.channels.fetch('987577123424321576') as discord.TextChannel
        TargetChannelId = '979749059067801740'
    }

    let Embed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(info.Title)
        .setDescription(info.Summary)
        .setImage(info.ImageUrl)
        .setTimestamp()
        .setColor('#4287f5')
        .setFooter(`Academy Marketplace`)

    const row = new discord.MessageActionRow()
        .addComponents(
            new discord.MessageButton()
                .setCustomId('acceptsuggestion')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new discord.MessageButton()
                .setCustomId('denysuggestion')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );

    Channel.send({ embeds: [Embed], components: [row] })
        .then((msg) => {
            // Database Entry
            utils.apps.mysql.query(`INSERT INTO suggestions (messageid, userid, targetchannelid) VALUES (?, ?, ?)`, [msg.id, user.id, TargetChannelId])

            let DMEmbed = new discord.MessageEmbed()
                .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                .setTitle(`Your suggestion is pending!`)
                .setDescription(`Suggestions are reviewed to make sure that they are valid and that they are not spam!`)
                .setTimestamp()
                .setColor('#ffcd29')
                .setFooter(`Academy Marketplace`)

            user.send({ embeds: [DMEmbed] })
        })
}

export async function run(interaction, client, type) {
    let user = interaction.user;

    await interaction.reply("Starting Prompt...")

    //Who are you hiring?
    input(client, user, { title: `What is the suggestion title?`, description: `This should be short and snappy` }, 60)
        .then(async (response: string) => {
            let Title = response
            console.log(Title)

            //Summary
            input(client, user, { title: `Provide a summary of the suggestion`, description: `This sould be detailed` }, 120)
                .then(async (response: string) => {
                    let Summary = response
                    console.log(Summary)

                    //Image
                    inputAttachmentOptional(client, user, { title: `Would you like to upload an image to your application?`, description: `If you would like to upload an image to your application, send the attachment; if not, please click 'Done!'` }, 30)
                        .then((response) => {
                            let ImageUrl = response
                            console.log(ImageUrl)

                            // Finalization
                            finalize(client, user, { Title, Summary, ImageUrl, type })
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