import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import * as ms from "ms";

const data = {
    name: 'unmute',
    description: 'Unmutes a user in the server',
    options: [
        {
            name: "user",
            description: "The user to unmute",
            type: 6,
            required: true
        },
    ]
}

async function run(interaction: any, client: discord.Client) {
    //interaction.deferReply();

    let user: discord.User = interaction.options.getUser('user');
    let Guild = await client.guilds.fetch(process.env.DISCORD_GUILD);

    utils.permissions.check(interaction.member, data.name)
        .then(() => {
            utils.mutes.get(user.id)
                .then(async response => {
                    utils.mutes.remove(response["infractiondata"]["infractionid"]);

                    await client.guilds.cache.get(process.env.DISCORD_GUILD).members.cache.get(user.id).roles.remove('955861799234850846')
                        .finally(() => {
                            let Embed = new discord.MessageEmbed()
                                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                                .setTitle(`Unmuted ${user.tag}`)
                                .setTimestamp()
                                .setColor('#4287f5')
                                .setFooter('Academy Helper')
                            return interaction.reply({ embeds: [Embed] })
                        })
                })
                .catch(() => {
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`There was no mute for ${user.tag}`)
                        .setTimestamp()
                        .setColor('#4287f5')
                        .setFooter('Academy Helper')
                    return interaction.reply({ embeds: [Embed] })
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