import * as utils from "../tools/utils/utils";
import { v4 as uuidv4 } from 'uuid';
import * as discord from "discord.js";

const data = {
    name: 'kick',
    description: 'Kick a user from the server',
    options: [
        {
            name: 'user',
            description: 'User to kick from the server',
            type: 6,
            required: true
        },
        {
            name: 'reason',
            description: 'Reason for kicking a user from the server',
            type: 3,
            required: true
        }
    ]
}

async function run(interaction: any, client: discord.Client) {
    let user: discord.User = interaction.options.getUser('user');
    let reason: string = interaction.options.getString('reason');
    let member: discord.GuildMember = await client.guilds.cache.get(process.env.DISCORD_GUILD).members.fetch(user.id);

    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            let KickEmbed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`You were kicked from ${client.guilds.cache.get(process.env.DISCORD_GUILD).name}`)
                .addField(`Reason`, reason, true)
                .addField(`Actor`, interaction.user.tag, true)
                .setColor('#eb4334')
                .setFooter('Academy Helper')
                .setTimestamp()
            await user.send({ embeds: [KickEmbed] })

            member.kick(reason)
                .then(() => {
                    let infractionid = uuidv4()
                    utils.infractions.create(infractionid, 'KICK', interaction.user.id, user.id, reason)

                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`Kicked ${user.tag}`)
                        .addField(`Reason`, reason, true)
                        .addField(`Actor`, interaction.user.tag, true)
                        .setTimestamp()
                        .setColor('#4287f5')
                        .setFooter('Academy Helper')
                    return interaction.reply({ embeds: [Embed] });
                })
                .catch(error => {
                    console.log(error)
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`There was an error!`)
                        .setColor('#eb4334')
                        .setFooter('Academy Helper')
                        .setTimestamp()
                    return interaction.reply({ embeds: [Embed] });
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
}

export { data, run }