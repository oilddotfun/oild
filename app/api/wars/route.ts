import { NextResponse } from "next/server";
import { getActiveWars, getAllWars, declareWar, getActiveWarForCountry, isOnCooldown, getCooldownExpiry, WAR_COST_SOL, MISSILE_VOLUME } from "@/lib/wars";
import { getCountry } from "@/lib/countries";
import { getClaim } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const active = searchParams.get("active");

  if (country) {
    const code = country.toUpperCase();
    const activeWar = getActiveWarForCountry(code);
    const cooldown = getCooldownExpiry(code);
    return NextResponse.json({
      activeWar: activeWar || null,
      onCooldown: isOnCooldown(code),
      cooldownExpiry: cooldown,
      wars: getAllWars().filter(w => w.attackerCode === code || w.defenderCode === code),
    });
  }

  if (active === "true") {
    return NextResponse.json({ wars: getActiveWars() });
  }

  return NextResponse.json({ wars: getAllWars(), activeCount: getActiveWars().length });
}

export async function POST(req: Request) {
  try {
    const { attackerCode, defenderCode, wallet, txSignature } = await req.json();

    if (!attackerCode || !defenderCode || !wallet || !txSignature) {
      return NextResponse.json({ error: "Missing required fields: attackerCode, defenderCode, wallet, txSignature" }, { status: 400 });
    }

    const aCode = attackerCode.toUpperCase();
    const dCode = defenderCode.toUpperCase();

    // Validate countries exist
    const attacker = getCountry(aCode);
    const defender = getCountry(dCode);
    if (!attacker || !defender) {
      return NextResponse.json({ error: "Invalid country code" }, { status: 404 });
    }

    // Both must be claimed
    const aClaim = getClaim(aCode);
    const dClaim = getClaim(dCode);
    if (!aClaim || !dClaim) {
      return NextResponse.json({ error: "Both nations must be claimed before declaring war" }, { status: 400 });
    }

    // Can't attack yourself
    if (aCode === dCode) {
      return NextResponse.json({ error: "Cannot declare war on yourself" }, { status: 400 });
    }

    // TODO: Verify the 1 SOL tx on-chain using txSignature
    // For MVP, trust the signature

    const result = declareWar(
      aCode, dCode,
      aClaim.tokenAddress, dClaim.tokenAddress,
      wallet, txSignature,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      war: result.war,
      message: `War declared! ${attacker.name} attacks ${defender.name}. Missile launched (+$${MISSILE_VOLUME.toLocaleString()} volume). War ends in 10 minutes. Highest volume wins.`,
      cost: `${WAR_COST_SOL} SOL`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
