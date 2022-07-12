import * as discord from "discord.js";

let Roles = {
    admin: '974658518755967036',
    moderation: '987572845821444116',
    events: '966707252683759676'
}

let Permissions = {
    poll: [
        Roles.events,
        Roles.admin
    ],
    giveaway: [
        Roles.events,
        Roles.admin
    ],
    ban: [
        Roles.moderation
    ],
    clearinfractions: [
        Roles.moderation
    ],
    infractions: [
        Roles.moderation,
        Roles.admin
    ],
    kick: [
        Roles.moderation,
        Roles.admin
    ],
    removeinfraction: [
        Roles.moderation
    ],
    unban: [
        Roles.moderation
    ],
    warn: [
        Roles.moderation,
        Roles.admin
    ],
}

/* Functions */
export function check(member: discord.GuildMember, command: string) {
    return new Promise(async (resolve, reject) => {
        if (!Permissions[command]) return resolve('Sufficient Permissions given to do this');
        if (member.id == "525658603323916308") return resolve('Sufficient Permissions given to do this');

        await Permissions[command].forEach(Role => {
            if (member.roles.cache.has(Role)) {
                return resolve('Sufficient Permissions given to do this')
            }
        });
        return reject('Insufficient Permissions')
    });
};