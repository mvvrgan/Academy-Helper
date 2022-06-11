import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import * as posts from '../tools/posts/posts'
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";

const data = {
    name: 'post',
    description: 'Starts a prompt to post to a Marketplace Channel',
    options: [
        {
            name: "type",
            description: "The type of post you would like to send",
            type: 3,
            required: true,
            choices: [
                {
                    name: "hiring",
                    value: 'hiring'
                },
                {
                    name: "for-hire",
                    value: 'for-hire'
                },
                {
                    name: "sell",
                    value: 'sell'
                },
                {
                    name: "buy",
                    value: 'buy'
                },
            ]
        },
    ]
}

async function run(interaction: any, client: discord.Client) {
    let type = interaction.options.getString("type")

    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            let Embed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`:warning: Notice`)
                .setDescription(`Posts will first be verified by staff before your post will be sent to the channel of your choosing. Posts could take up to 48 hours. Do you still wish to proceed?`)
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
                        if (type === 'for-hire') type = 'forhire';
                        await posts[type].run(i, client)
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