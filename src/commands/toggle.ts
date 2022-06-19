import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";

const pings = [
    {
        name: "Giveaways",
        value: '987546413867077672'
    },
    {
        name: "Events",
        value: '987565574357913661'
    },
    {
        name: "Polls",
        value: '987565809616425030'
    },
    {
        name: "Partnerships",
        value: '987566027686699068'
    },
    {
        name: "Announcements",
        value: '987565710995783711'
    },
    {
        name: "QOTD",
        value: '987565790486212608'
    },
    {
        name: "General",
        value: '987566264329306184'
    },
]

const learning = [
    {
        name: "Programming",
        value: '955866827546828810'
    },
    {
        name: "Modeling",
        value: '956017055352619100'
    },
    {
        name: "Building",
        value: '956017086180753418'
    },
    {
        name: "Interface",
        value: '956017141600116756'
    },
    {
        name: "Animation",
        value: '983046918466859008'
    },
    {
        name: "Graphics",
        value: '967036776856293406'
    },
    {
        name: "Clothing Design",
        value: '986857915166130237'
    },
]

const colors = [
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
    description: 'Choose a role to toggle',
    options: [
        {
            name: "color",
            description: "Toggle a color role!",
            type: 1,
            options: [
                {
                    name: "role",
                    description: "The role to toggle",
                    type: 3,
                    required: true,
                    choices: colors
                },
            ]
        },
        {
            name: "learning",
            description: "Toggle a learning role!",
            type: 1,
            options: [
                {
                    name: "role",
                    description: "The role to toggle",
                    type: 3,
                    required: true,
                    choices: learning
                },
            ]
        },
        {
            name: "pings",
            description: "The ping to toggle",
            type: 1,
            options: [
                {
                    name: "role",
                    description: "The role to toggle",
                    type: 3,
                    required: true,
                    choices: pings
                },
            ]
        }
    ]
}

async function run(interaction: any, client: discord.Client) {
    let user: discord.User = interaction.user;
    let member: discord.GuildMember = await client.guilds.cache.get(process.env.DISCORD_GUILD).members.fetch(user.id)
    let role = interaction.options.getString("role")

    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            if (member.roles.cache.has(role)) {
                member.roles.remove(role)
                    .then(async () => {
                        let Embed = new discord.MessageEmbed()
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                            .setTitle(`Succesfully toggled! (Removed ${member.guild.roles.cache.get(role).name})`)
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
            } else {
                // Delete all Color roles before applying new one IF color role is being applied
                if (colors.find(c => c.value == role)) {
                    colors.forEach(role => {
                        if (member.roles.cache.has(role.value)) {
                            member.roles.remove(role.value)
                                .catch()
                        };
                    });
                };

                member.roles.add(role)
                    .then(async () => {
                        let Embed = new discord.MessageEmbed()
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                            .setTitle(`Succesfully toggled! (Added ${member.guild.roles.cache.get(role).name})`)
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
            }
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