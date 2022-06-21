import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";
import * as suggestions from "../tools/utils/suggestions";

const data = {
    name: 'suggest',
    description: 'Suggest a feature for Academy',
    options:[ 
        {
            name: 'type',
            description: 'Type of suggestion',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'event',
                    description: '',
                    value: 'Event'
                },
                {
                    name: 'server',
                    description: '',
                    value: 'Server'
                }
            ]
        }
        
    ]
}

async function run(interaction: any, client: discord.Client) {
    let type = interaction.options.getString("type")
    console.log(type)

    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            let Embed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`:warning: Notice`)
                .setDescription(`All suggestions are verified by staff before being posted. Troll suggestions will be moderated. Your suggestion may or may not be accepted depending on the suggestion / information provided.`)
                .setTimestamp()
                .setColor('#4287f5')
                .setFooter('Academy Helper')
            
            const row = new discord.MessageActionRow()
                .addComponents(
                    new discord.MessageButton()
                        .setCustomId('yes')
                        .setLabel('Yes!')
                        .setStyle('SUCCESS'),
                    new discord.MessageButton()
                        .setCustomId('no')
                        .setLabel('No')
                        .setStyle('DANGER'),
                );
            
            interaction.user.send({ embeds: [Embed], components: [row] })
                .then((message) => {
                    // Collector
                    const collector = message.createMessageComponentCollector();
                    collector.on('collect', async i => {
                        if ((i.customId === 'yes' || i.customId === 'no') && i.user.id === interaction.user.id) {
                            row.components[0].setDisabled(true)
                            row.components[1].setDisabled(true)
                            if (i.customId === 'no') {return i.reply(`Cancelled prompt!`)}
                        }
                        else {
                            return
                        }
                        i.message.edit({ components: [row] })

                        suggestions.run(i, client, type)
                    });

                    interaction.reply(`<@${interaction.user.id}>, please check your DMs!`);
                })
                .catch(() => {
                    return interaction.reply(`<@${interaction.user.id}>, please enable your DMs!`);
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