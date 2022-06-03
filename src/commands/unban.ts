import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import * as ms from "ms";

const data = {
    name: 'unban',
    description: 'Unbans a user from the server',
    options: [
        {
            name: "user",
            description: "The id user to unban from the server",
            type: 6,
            required: true
        },
    ]
}

async function run(interaction: any, client: discord.Client) {
    //interaction.deferReply();

    let user: discord.User = interaction.options.getUser('user');
    let Guild = await client.guilds.fetch(process.env.DISCORD_GUILD);
    let Ban: discord.GuildBan = Guild.bans.cache.get(user.id);

    utils.permissions.check(interaction.member, data.name)
        .then(() => {
            utils.bans.get(user.id)
                .then(async response => {
                    utils.bans.remove(response["infractiondata"]["infractionid"]);

                    await client.guilds.cache.get(process.env.DISCORD_GUILD).members.unban(user.id)
                        .then(() => {
                            let Embed = new discord.MessageEmbed()
                                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                                .setTitle(`Unbanned ${user.tag}`)
                                .setTimestamp()
                                .setColor('#4287f5')
                                .setFooter('Academy Helper')
                            return interaction.reply({ embeds: [Embed] })
                        })
                        .catch(error => {
                            console.log(error);
                            let Embed = new discord.MessageEmbed()
                                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                                .setTitle(`Error unbanning ${user.tag}`)
                                .setTimestamp()
                                .setColor('#4287f5')
                                .setFooter('Academy Helper')
                            return interaction.reply({ embeds: [Embed] })
                        })
                })
                .catch(() => {
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`There was no ban for ${user.tag}`)
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