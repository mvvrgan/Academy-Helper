import * as utils from '../utils/utils';
import * as discord from "discord.js";

export function mod() {
    utils.apps.discord.Client.on('interactionCreate', async (interaction) => {
        if (interaction['customId'] == "acceptapp" || interaction['customId'] == "denyapp") {
            let applicationsdata = (await utils.apps.mysql.query(`SELECT * FROM applications WHERE userid=?`, [interaction.user.id]))

            await applicationsdata.forEach(async applicationdata => {
                if (applicationdata.messageid == interaction['message'].id) {
                    let Role: discord.Role = await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).roles.cache.get(applicationdata.targetroleid)
                    
                    if (interaction['customId'] == "acceptapp") {
                        // Accepting application

                        let user = await utils.apps.discord.Client.users.fetch(applicationdata.userid)

                        let DMEmbed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Your application was accepted!`)
                            .setDescription(`Your application for ${Role.name} was accepted!`)
                            .addField('Accepted by', interaction.user.tag)
                            .setTimestamp()
                            .setColor('#73de82')
                            .setFooter(`Academy Marketplace`)

                        // Enter the userid and roleid into the roles table
                        await utils.apps.mysql.query(`INSERT INTO roles (userid, roleid) VALUES (?, ?)`, [applicationdata.userid, applicationdata.targetroleid])
                            .then(async () => {
                                user.send({ embeds: [DMEmbed] })
                                    .catch(console.log)

                                utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).members.cache.get(user.id).roles.add(Role)
                                .catch(console.log)
                            })
                    }
                    else if (interaction['customId'] == "denyapp") {
                        //
                        let user = await utils.apps.discord.Client.users.fetch(applicationdata.userid)

                        let DMEmbed = new discord.MessageEmbed()
                            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                            .setTitle(`Your application was declined`)
                            .setDescription(`Your application for ${Role.name} was declined`)
                            .addField('Declined by', interaction.user.tag)
                            .setTimestamp()
                            .setColor('#eb4334')
                            .setFooter(`Academy Marketplace`)

                        user.send({ embeds: [DMEmbed] })
                    };

                    utils.apps.mysql.query(`DELETE FROM applications WHERE messageid=?`, [interaction['message'].id])
                }
            });

            interaction['message'].delete();
        };
    });
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
    let Channel: discord.TextChannel = await client.channels.fetch('985327180978479124') as discord.TextChannel

    let Embed = new discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTitle(`${user.tag} has applied to ${info.role.name}`)
        .addField('Portfolio', info.Portfolio)
        .addField('Applicant', `<@${user.id}>`)
        .setImage(info.ImageUrl)
        .setTimestamp()
        .setColor('#4287f5')
        .setFooter(`Academy Marketplace`)

    const row = new discord.MessageActionRow()
        .addComponents(
            new discord.MessageButton()
                .setCustomId('acceptapp')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new discord.MessageButton()
                .setCustomId('denyapp')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );

    Channel.send({ embeds: [Embed], components: [row] })
        .then((msg) => {
            // Database Entry
            utils.apps.mysql.query(`INSERT INTO applications (messageid, userid, targetroleid) VALUES (?, ?, ?)`, [msg.id, user.id, info.role.id])

            let DMEmbed = new discord.MessageEmbed()
                .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                .setTitle(`Your application is pending!`)
                .setDescription(`Skill Evaluators will review your application, and verify wether you meet the requirements to become a '${info.role.name}' skill role!`)
                .setTimestamp()
                .setColor('#ffcd29')
                .setFooter(`Academy Marketplace`)

            user.send({ embeds: [DMEmbed] })
        })
}

export async function run(interaction, client, roleid) {
    let user = interaction.user;
    let role: discord.Role = await client.guilds.cache.get(process.env.DISCORD_GUILD).roles.fetch(roleid)

    await interaction.reply("Starting Prompt...")

    //Who are you hiring?
    input(client, user, { title: `Send a link to your portfolio`, description: `This should be a valid link` }, 60)
        .then(async (response: string) => {
            let Portfolio = response
            console.log(Portfolio)

            if (!Portfolio.includes('https://') && !Portfolio.includes('http://')) {
                let Embed = new discord.MessageEmbed()
                    .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                    .setTitle(`Prompt Cancelled`)
                    .setDescription(`Please send a valid link`)
                    .setTimestamp()
                    .setColor('#eb4334')
                    .setFooter('Academy Helper')

                return await user.send({ embeds: [Embed] })
                    .catch()
            }

            //Image
            inputAttachmentOptional(client, user, { title: `Would you like to upload an image to your application?`, description: `If you would like to upload an image to your application, send the attachment; if not, please click 'Done!'` }, 30)
                .then((response) => {
                    let ImageUrl = response
                    console.log(ImageUrl)

                    // Finalization
                    finalize(client, user, { Portfolio, ImageUrl, role })
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

export function startCheck() {
    let Client:discord.Client = utils.apps.discord.Client

    Client.on(`guildMemberAdd`, async (member) => {
        let roles = await utils.apps.mysql.query(`SELECT * FROM roles WHERE userid = ?`, [member.id])

        for (let role of roles) {
            let Role: discord.Role = await Client.guilds.cache.get(process.env.DISCORD_GUILD).roles.fetch(role.roleid)
            member.roles.add(Role)
            .catch(console.log)
        }
    })
};