export interface War {
  id: string;
  attackerCode: string;     // country code of attacker
  defenderCode: string;     // country code of defender
  attackerToken: string;    // attacker's pump.fun token
  defenderToken: string;    // defender's pump.fun token
  declaredBy: string;       // wallet that paid 1 SOL
  txSignature: string;      // SOL payment tx sig
  startedAt: number;        // timestamp
  endsAt: number;           // startedAt + 10 minutes
  status: "active" | "resolved";
  winner: string | null;    // country code of winner
  oilStolen: number;        // barrels transferred
  attackerVolume: number;   // volume during war period
  defenderVolume: number;   // volume during war period
}

const WAR_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const OIL_STEAL_PERCENT = 0.05; // 5% of loser's oil
export const WAR_COST_SOL = 1;
export const MISSILE_VOLUME = 100_000; // $100K volume added

// In-memory store (MVP)
const wars: War[] = [];
const cooldowns = new Map<string, number>(); // countryCode -> cooldown expires timestamp

export function getActiveWars(): War[] {
  return wars.filter(w => w.status === "active" && Date.now() < w.endsAt);
}

export function getAllWars(): War[] {
  return [...wars];
}

export function getWarsForCountry(code: string): War[] {
  return wars.filter(w => w.attackerCode === code || w.defenderCode === code);
}

export function getActiveWarForCountry(code: string): War | undefined {
  return wars.find(w =>
    w.status === "active" &&
    Date.now() < w.endsAt &&
    (w.attackerCode === code || w.defenderCode === code)
  );
}

export function isOnCooldown(code: string): boolean {
  const expires = cooldowns.get(code);
  if (!expires) return false;
  return Date.now() < expires;
}

export function getCooldownExpiry(code: string): number | null {
  const expires = cooldowns.get(code);
  if (!expires || Date.now() >= expires) return null;
  return expires;
}

export function declareWar(
  attackerCode: string,
  defenderCode: string,
  attackerToken: string,
  defenderToken: string,
  wallet: string,
  txSignature: string,
): { success: boolean; error?: string; war?: War } {
  const aCode = attackerCode.toUpperCase();
  const dCode = defenderCode.toUpperCase();

  // Check cooldowns
  if (isOnCooldown(dCode)) {
    return { success: false, error: `${dCode} is on cooldown. Cannot be attacked for ${Math.ceil((getCooldownExpiry(dCode)! - Date.now()) / 60000)} more minutes.` };
  }

  // Check if either country is already in an active war
  if (getActiveWarForCountry(aCode)) {
    return { success: false, error: `${aCode} is already in an active war.` };
  }
  if (getActiveWarForCountry(dCode)) {
    return { success: false, error: `${dCode} is already in an active war.` };
  }

  const now = Date.now();
  const war: War = {
    id: `war_${now}_${aCode}_${dCode}`,
    attackerCode: aCode,
    defenderCode: dCode,
    attackerToken,
    defenderToken,
    declaredBy: wallet,
    txSignature,
    startedAt: now,
    endsAt: now + WAR_DURATION_MS,
    status: "active",
    winner: null,
    oilStolen: 0,
    attackerVolume: MISSILE_VOLUME, // missile gives attacker initial 100K volume
    defenderVolume: 0,
  };

  wars.push(war);
  return { success: true, war };
}

export function resolveWar(warId: string, attackerVolume: number, defenderVolume: number, defenderOilReserves: number): War | null {
  const war = wars.find(w => w.id === warId);
  if (!war || war.status !== "active") return null;

  war.attackerVolume = attackerVolume;
  war.defenderVolume = defenderVolume;
  war.status = "resolved";

  // Winner is whoever had more volume during the 10 min period
  const attackerWins = attackerVolume >= defenderVolume;
  war.winner = attackerWins ? war.attackerCode : war.defenderCode;

  // Loser loses 5% of their oil
  const loserCode = attackerWins ? war.defenderCode : war.attackerCode;
  war.oilStolen = Math.floor(defenderOilReserves * OIL_STEAL_PERCENT);

  // Set 24hr cooldown on the loser
  cooldowns.set(loserCode, Date.now() + COOLDOWN_MS);

  return war;
}

export { WAR_DURATION_MS, COOLDOWN_MS, OIL_STEAL_PERCENT };
