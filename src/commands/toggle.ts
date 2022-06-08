import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";

const roles = [
    {
        name: "red",
        value: '955861197457088552'
    },
    {
        name: "purple",
        value: '955861197922660443'
    },
    {
        name: "green",
        value: '955861198325289060'
    },
    {
        name: "pink",
        value: '955861198673444894'
    },
    {
        name: "orange",
        value: '955861199197720606'
    },
    {
        name: "yellow",
        value: '955861199881383996'
    },
    {
        name: "blue",
        value: '955861200611213332'
    },
    {
        name: "orange2",
        value: '955861226653614100'
    },
    {
        name: "green2",
        value: '955861227286970469'
    },
    {
        name: "blue2",
        value: '955861227660279889'
    },
    {
        name: "red2",
        value: '955861228482363483'
    },
    {
        name: "yellow2",
        value: '955861229333778432'
    },
]

const data = {
    name: 'toggle',
    description: 'Choose a color to toggle',
    options: [
        {
            name: "colour",
            description: "The color to toggle",
            type: 3,
            choices: roles,
            required: true
        }
    ]
}

async function run(interaction: any, client: discord.Client) {
    let user: discord.User = interaction.user;
    let member: discord.GuildMember = await client.guilds.cache.get(process.env.DISCORD_GUILD).members.fetch(user.id)
    let role = interaction.options.getString("colour")

    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            roles.forEach(role => {
                if (member.roles.cache.has(role.value)) {
                    member.roles.remove(role.value)
                    .catch()
                };
            });
            member.roles.add(role)
                .then(async () => {
                    let Embed = new discord.MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(`Succesfully toggled!`)
                        .setTimestamp()
                        .setColor('#4287f5')
                        .setFooter('Academy Helper')
                    return interaction.reply({ embeds: [Embed] });
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