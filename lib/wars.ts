import { sql, ensureTables } from "./db";

export interface War {
  id: string;
  attackerCode: string;
  defenderCode: string;
  attackerToken: string;
  defenderToken: string;
  declaredBy: string;
  txSignature: string;
  startedAt: number;
  endsAt: number;
  status: "active" | "resolved";
  winner: string | null;
  oilStolen: number;
  attackerVolume: number;
  defenderVolume: number;
}

const WAR_DURATION_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const OIL_STEAL_PERCENT = 0.05;
export const WAR_COST_SOL = 1;
export const MISSILE_VOLUME = 100_000;

function rowToWar(r: Record<string, unknown>): War {
  return {
    id: r.id as string,
    attackerCode: r.attacker_code as string,
    defenderCode: r.defender_code as string,
    attackerToken: r.attacker_token as string,
    defenderToken: r.defender_token as string,
    declaredBy: r.declared_by as string,
    txSignature: r.tx_signature as string,
    startedAt: Number(r.started_at),
    endsAt: Number(r.ends_at),
    status: r.status as "active" | "resolved",
    winner: r.winner as string | null,
    oilStolen: Number(r.oil_stolen),
    attackerVolume: Number(r.attacker_volume),
    defenderVolume: Number(r.defender_volume),
  };
}

export async function getActiveWars(): Promise<War[]> {
  await ensureTables();
  const now = Date.now();
  const rows = await sql`SELECT * FROM wars WHERE status = 'active' AND ends_at > ${now}`;
  return rows.map(rowToWar);
}

export async function getAllWars(): Promise<War[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM wars ORDER BY started_at DESC LIMIT 100`;
  return rows.map(rowToWar);
}

export async function getWarsForCountry(code: string): Promise<War[]> {
  await ensureTables();
  const c = code.toUpperCase();
  const rows = await sql`SELECT * FROM wars WHERE attacker_code = ${c} OR defender_code = ${c} ORDER BY started_at DESC`;
  return rows.map(rowToWar);
}

export async function getActiveWarForCountry(code: string): Promise<War | null> {
  await ensureTables();
  const c = code.toUpperCase();
  const now = Date.now();
  const rows = await sql`SELECT * FROM wars WHERE status = 'active' AND ends_at > ${now} AND (attacker_code = ${c} OR defender_code = ${c}) LIMIT 1`;
  return rows.length > 0 ? rowToWar(rows[0]) : null;
}

export async function isOnCooldown(code: string): Promise<boolean> {
  await ensureTables();
  const c = code.toUpperCase();
  const now = Date.now();
  const rows = await sql`SELECT expires_at FROM cooldowns WHERE code = ${c} AND expires_at > ${now}`;
  return rows.length > 0;
}

export async function getCooldownExpiry(code: string): Promise<number | null> {
  await ensureTables();
  const c = code.toUpperCase();
  const now = Date.now();
  const rows = await sql`SELECT expires_at FROM cooldowns WHERE code = ${c} AND expires_at > ${now}`;
  if (rows.length === 0) return null;
  return Number(rows[0].expires_at);
}

export async function declareWar(
  attackerCode: string,
  defenderCode: string,
  attackerToken: string,
  defenderToken: string,
  wallet: string,
  txSignature: string,
): Promise<{ success: boolean; error?: string; war?: War }> {
  const aCode = attackerCode.toUpperCase();
  const dCode = defenderCode.toUpperCase();

  if (await isOnCooldown(dCode)) {
    const exp = await getCooldownExpiry(dCode);
    const mins = exp ? Math.ceil((exp - Date.now()) / 60000) : 0;
    return { success: false, error: `${dCode} is on cooldown. Cannot be attacked for ${mins} more minutes.` };
  }

  if (await getActiveWarForCountry(aCode)) {
    return { success: false, error: `${aCode} is already in an active war.` };
  }
  if (await getActiveWarForCountry(dCode)) {
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
    attackerVolume: MISSILE_VOLUME,
    defenderVolume: 0,
  };

  await ensureTables();
  await sql`
    INSERT INTO wars (id, attacker_code, defender_code, attacker_token, defender_token, declared_by, tx_signature, started_at, ends_at, status, winner, oil_stolen, attacker_volume, defender_volume)
    VALUES (${war.id}, ${war.attackerCode}, ${war.defenderCode}, ${war.attackerToken}, ${war.defenderToken}, ${war.declaredBy}, ${war.txSignature}, ${war.startedAt}, ${war.endsAt}, ${war.status}, ${war.winner}, ${war.oilStolen}, ${war.attackerVolume}, ${war.defenderVolume})
  `;

  return { success: true, war };
}

export async function resolveWar(warId: string, attackerVolume: number, defenderVolume: number, defenderOilReserves: number): Promise<War | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM wars WHERE id = ${warId} AND status = 'active'`;
  if (rows.length === 0) return null;

  const war = rowToWar(rows[0]);
  const attackerWins = attackerVolume >= defenderVolume;
  const winner = attackerWins ? war.attackerCode : war.defenderCode;
  const loser = attackerWins ? war.defenderCode : war.attackerCode;
  const oilStolen = Math.floor(defenderOilReserves * OIL_STEAL_PERCENT);

  await sql`
    UPDATE wars SET
      status = 'resolved',
      winner = ${winner},
      oil_stolen = ${oilStolen},
      attacker_volume = ${attackerVolume},
      defender_volume = ${defenderVolume}
    WHERE id = ${warId}
  `;

  // Set 24hr cooldown on loser
  const cooldownExpiry = Date.now() + COOLDOWN_MS;
  await sql`
    INSERT INTO cooldowns (code, expires_at) VALUES (${loser}, ${cooldownExpiry})
    ON CONFLICT (code) DO UPDATE SET expires_at = ${cooldownExpiry}
  `;

  return { ...war, status: "resolved", winner, oilStolen, attackerVolume, defenderVolume };
}

export { WAR_DURATION_MS, COOLDOWN_MS, OIL_STEAL_PERCENT };
