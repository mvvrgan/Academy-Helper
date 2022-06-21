import * as discord from "discord.js";

let Roles = {
    mod: '928058996928172053',
    admin: '987572845821444116',
    staff: '967168245998182522'
}

let Permissions = {
    poll: [
        Roles.staff,
        Roles.admin
    ],
    giveaway: [
        Roles.staff,
        Roles.admin
    ],
    ban: [
        Roles.admin
    ],
    clearinfractions: [
        Roles.admin
    ],
    infractions: [
        Roles.admin,
        Roles.mod
    ],
    kick: [
        Roles.admin,
        Roles.mod
    ],
    removeinfraction: [
        Roles.admin
    ],
    unban: [
        Roles.admin
    ],
    warn: [
        Roles.admin,
        Roles.mod
    ],
}

/* Functions */
export function check(member: discord.GuildMember, command: string) {
    return new Promise(async (resolve, reject) => {
        if (!Permissions[command]) return resolve('Sufficient Permissions given to do this');

        await Permissions[command].forEach(Role => {
            if (member.roles.cache.has(Role)) {
                return resolve('Sufficient Permissions given to do this')
            }
        });
        return reject('Insufficient Permissions')
    });
};