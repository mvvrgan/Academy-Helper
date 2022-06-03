import * as utils from "../tools/utils/utils";
import { v4 as uuidv4 } from 'uuid';
import * as discord from "discord.js";

const data = {
    name: 'clearinfractions',
    description: 'Clear a users entire infractions list',
    options: [
        {
            name: 'user',
            description: 'The user to clear the infractions list',
            type: 6,
            required: true
        },
    ]
}

async function run(interaction: any, client: discord.Client) {
    let user: discord.User = interaction.options.getUser('user');

    utils.permissions.check(interaction.member, data.name)
        .then(() => {
            utils.infractions.clear(user.id)
                .then(() => {
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`Cleared infractions`)
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