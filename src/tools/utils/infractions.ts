import * as utils from "./utils";

/* Functions */

export function getTarget (search: string | number) {
    return utils.apps.mysql.query(`SELECT * FROM infractions WHERE ${search} IN (infractionid, target, target)`)
};

export function getActor (search: string | number) {
    return utils.apps.mysql.query(`SELECT * FROM infractions WHERE ${search} IN (infractionid, actor, target)`)
};

export function get (infractionid: string) {
    return utils.apps.mysql.query(`SELECT * FROM infractions WHERE ? IN (infractionid)`, [infractionid])
};

export function create (infactionid:string, type:string, actor:string, target:string, reason:string) {
    return utils.apps.mysql.query(`INSERT INTO infractions (infractionid, action, actor, target, reason) VALUES (?, ?, ?, ?, ?)`, [infactionid, type, actor, target, reason])
};

export function remove (infactionid) {
    return utils.apps.mysql.query(`DELETE FROM infractions WHERE ? IN (infractionid)`, [infactionid])
};

export function clear (userid) {
    return utils.apps.mysql.query(`DELETE FROM infractions WHERE ? IN (target)`, [userid])
};