import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";

const data = {
    name: 'ban',
    description: 'Ban a user from the server for a specified amount of time.',
    options: [
        {
            name: "user",
            description: "The user to ban from the server",
            type: 6,
            required: true
        },
        {
            name: "length",
            description: "The length of the ban",
            type: 3,
            required: true
        },
        {
            name: "reason",
            description: "The reason to ban from the server",
            type: 3,
            required: true
        },
    ]
}

async function run(interaction: any, client: discord.Client) {
    let user: discord.User = interaction.options.getUser('user');
    let reason: string = interaction.options.getString('reason');
    let time = new Date(Date.now() + ms(interaction.options.getString('length')))

    utils.permissions.check(interaction.member, data.name)
        .then(() => {
            utils.bans.get(user.id)
                .then(async () => {
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`There was an error`)
                        .setDescription(`${user.tag} is already banned`)
                        .setColor('#eb4334')
                        .setFooter('Academy Helper')
                        .setTimestamp()
                    return interaction.reply({ embeds: [Embed] });
                })
                .catch(async () => {
                    // Infaction Stuff
                    let formattedtime = (new Date(time.getTime() - time.getTimezoneOffset() * 60000).toISOString()).slice(0, 19).replace('T', ' ')
                    console.log(formattedtime)
                    utils.bans.create(interaction.user.id, user.id, reason, formattedtime)

                    let BanEmbed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`You were banned from ${client.guilds.cache.get(process.env.DISCORD_GUILD).name}`)
                        .addField(`Expires`, time.toLocaleString(), true)
                        .addField(`Reason`, reason, true)
                        .addField(`Actor`, interaction.user.tag, true)
                        .setColor('#eb4334')
                        .setFooter('Academy Helper')
                        .setTimestamp()
                    await user.send({ embeds: [BanEmbed] })

                    let member: discord.GuildMember = await client.guilds.cache.get(process.env.DISCORD_GUILD).members.fetch(user.id)

                    member.ban({ reason: reason })
                        .then(() => {
                            let Embed = new discord.MessageEmbed()
                                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                                .setTitle(`Banned ${user.tag}`)
                                .addField(`Expires`, time.toLocaleString(), true)
                                .addField(`Reason`, reason, true)
                                .addField(`Actor`, interaction.user.tag, true)
                                .setTimestamp()
                                .setColor('#4287f5')
                                .setFooter('Academy Helper')
                            return interaction.reply({ embeds: [Embed] });
                        })
                        .catch(async error => {
                            console.log(error)
                            let Embed = new discord.MessageEmbed()
                                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                                .setTitle(`There was an error!`)
                                .setColor('#eb4334')
                                .setFooter('Academy Helper')
                                .setTimestamp()
                            return interaction.reply({ embeds: [Embed] });
                        });
                })
        })
        .catch((error) => {
            console.log(error)
            let Embed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(error)
                .setColor('#eb4334')
                .setFooter('Academy Helper')
                .setTimestamp()
            return interaction.reply({ embeds: [Embed] });
        })
};

export { data, run }