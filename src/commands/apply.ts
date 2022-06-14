import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import { v4 as uuidv4 } from 'uuid';
import * as ms from "ms";
import * as applications from "../tools/utils/applications";

const skills = [
    {
        name: "Modeler",
        value: '983049161324785674'
    },
    {
        name: "Programmer",
        value: '983049154345435176'
    },
    {
        name: "Builder",
        value: '983049139816374304'
    },
    {
        name: "Interface",
        value: '983049165569392721'
    },
    {
        name: "Animation",
        value: '983049147160621077'
    },
    {
        name: "Designer",
        value: '986367034969440437'
    },
    {
        name: "Composer",
        value: '986367100727746621'
    },
    {
        name: "Clothing Designer",
        value: '986367136282841139'
    },
    {
        name: "Graphics",
        value: '983049178508820520'
    },
];

const data = {
    name: 'apply',
    description: 'Apply for a skill role for Developer Academy',
    options: [
        {
            name: "skill",
            description: "The skill that you are applying for",
            type: 3,
            required: true,
            choices: skills
        },
    ]
}

async function run(interaction: any, client: discord.Client) {
    let skill = interaction.options.getString("skill")
    console.log(skill)

    utils.permissions.check(interaction.member, data.name)
        .then(async () => {
            let Embed = new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`:warning: Notice`)
                .setDescription(`Skill roles allow you to create for-hire posts and show off your skillset within the community. Skill Evaluators will determine whether or not you will receive the role. Applications can take up to 24 hours for acceptance. Do you still wish to proceed?`)
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

                        applications.run(i, client, skill)
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