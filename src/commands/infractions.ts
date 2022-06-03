import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";

const data = {
    name: 'infractions',
    description: 'Get yours/others infractions',
    options: [
        {
            name: 'user',
            description: 'If searching for another users infractions, enter here',
            type: 6,
            required: false
        }
    ]
}

function run(interaction: any, client: discord.Client) {
    let user: discord.User = interaction.options.getUser('user');

    utils.permissions.check(interaction.member, data.name)
        .then(() => {
            function next(user) {
                utils.infractions.getTarget(user.id)
                    .then(async infractions => {
                        let Embed = new discord.MessageEmbed()
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                            .setTitle(`${user.tag}'s infractions`)
                            .setTimestamp()
                            .setColor('#4287f5')
                            .setFooter('Academy Helper')

                        if (infractions.length == 0) Embed.setDescription('No infractions were found');
                        await infractions.forEach(async infraction => {
                            Embed.addField(infraction.infractionid, `Type: ${infraction.action}\nActor: ${await client.users.fetch(infraction.actor)}\nReason: ${infraction.reason}`)
                        });

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
            }

            if (user) { next(user) } else { next(interaction.user) }
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