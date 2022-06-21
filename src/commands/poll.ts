import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";
import * as polls from "../tools/utils/polls";

const data = {
    name: 'poll',
    description: 'Starts a poll prompt in DMs',
}

async function run(interaction: any, client: discord.Client) {
    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            let Embed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`:warning: Notice`)
                .setDescription(`You are about to create a poll, would you like to continue?`)
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

                        polls.run(i, client)
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