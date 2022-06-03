import * as utils from "../tools/utils/utils";
import { v4 as uuidv4 } from 'uuid';
import * as discord from "discord.js";

const data = {
    name: 'removeinfraction',
    description: 'Remove an infraction from a user',
    options: [
        {
            name: 'infraction',
            description: 'The infraction you would like to remove',
            type: 3,
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
    let infraction: string = interaction.options.getString('infraction');
    let reason: string = interaction.options.getString('reason');

    utils.permissions.check(interaction.member, data.name)
        .then(() => {
            utils.infractions.remove(infraction)
                .then(() => {
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`Removed infraction`)
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