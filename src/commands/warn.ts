import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";

const data = {
    name: 'warn',
    description: 'Warn a user in the server.',
    options: [
        {
            name: "user",
            description: "The user to warn",
            type: 6,
            required: true
        },
        {
            name: "reason",
            description: "The reason to warn the user",
            type: 3,
            required: true
        },
    ]
}

async function run(interaction: any, client: discord.Client) {
    let user: discord.User = interaction.options.getUser('user');
    let reason: string = interaction.options.getString('reason');

    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            // Infaction Stuff

            let WarnEmbed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`You were warned in ${client.guilds.cache.get(process.env.DISCORD_GUILD).name}`)
                .addField(`Reason`, reason, true)
                .addField(`Moderator`, interaction.user.tag, true)
                .setColor('#eb4334')
                .setFooter('Academy Helper')
                .setTimestamp()
            await user.send({ embeds: [WarnEmbed] })

            let member: discord.GuildMember = await client.guilds.cache.get(process.env.DISCORD_GUILD).members.fetch(user.id)

            utils.warnings.create(interaction.user.id, user.id, reason)
                .then(() => {
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`Warned ${user.tag}`)
                        .addField(`Reason`, reason, true)
                        .addField(`Moderator`, interaction.user.tag, true)
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
        .catch((error) => {
            console.log(error)
            let Embed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle('There was an error running the command')
                .setColor('#eb4334')
                .setFooter('Academy Helper')
                .setTimestamp()
            return interaction.reply({ embeds: [Embed] });
        })
};

export { data, run }