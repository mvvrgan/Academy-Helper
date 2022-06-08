/* App Imports */
import * as discord from './discord'
import * as mysql from './mysql'
const apps = { discord, mysql }

/* Other Imports */
import * as bans from './bans'
import * as infractions from './infractions'
import * as permissions from './permissions'
import * as warnings from './warnings'
import * as mutes from './mutes'
export{bans, infractions, permissions, warnings, mutes}

/* Randoms */
type Base64UUID = string;

export function uuidToBase64(uuid: string): Base64UUID {
  return Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('base64url');
}

export function base64toUUID(base64: Base64UUID): string {
  const hex = Buffer.from(base64, 'base64url').toString('hex');

  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
    12,
    16,
  )}-${hex.substring(16, 20)}-${hex.substring(20)}`;
}


/* Exports */
export { apps }