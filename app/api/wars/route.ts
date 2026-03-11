import { NextResponse } from "next/server";
import { getActiveWars, getAllWars, declareWar, getActiveWarForCountry, isOnCooldown, getCooldownExpiry, resolveWar, WAR_COST_SOL, MISSILE_VOLUME } from "@/lib/wars";
import { getCountry } from "@/lib/countries";
import { getClaim } from "@/lib/store";
import { verifyTreasuryPayment, TREASURY_WALLET } from "@/lib/solana";
import { getWarVolume } from "@/lib/dexscreener";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const active = searchParams.get("active");

  // Check if any active wars need resolving
  const activeWars = getActiveWars();
  for (const war of activeWars) {
    if (Date.now() >= war.endsAt && war.status === "active") {
      // War timer expired — resolve it
      const [attackerVol, defenderVol] = await Promise.all([
        getWarVolume(war.attackerToken),
        getWarVolume(war.defenderToken),
      ]);
      const defenderCountry = getCountry(war.defenderCode);
      resolveWar(war.id, attackerVol, defenderVol, defenderCountry?.oil || 0);
    }
  }

  if (country) {
    const code = country.toUpperCase();
    const activeWar = getActiveWarForCountry(code);
    const cooldown = getCooldownExpiry(code);
    return NextResponse.json({
      activeWar: activeWar || null,
      onCooldown: isOnCooldown(code),
      cooldownExpiry: cooldown,
      wars: getAllWars().filter(w => w.attackerCode === code || w.defenderCode === code),
      treasury: TREASURY_WALLET,
    });
  }

  if (active === "true") {
    return NextResponse.json({ wars: getActiveWars(), treasury: TREASURY_WALLET });
  }

  return NextResponse.json({
    wars: getAllWars(),
    activeCount: getActiveWars().length,
    treasury: TREASURY_WALLET,
  });
}

export async function POST(req: Request) {
  try {
    const { attackerCode, defenderCode, wallet, txSignature } = await req.json();

    if (!attackerCode || !defenderCode || !wallet || !txSignature) {
      return NextResponse.json({
        error: "Missing required fields: attackerCode, defenderCode, wallet, txSignature",
      }, { status: 400 });
    }

    const aCode = attackerCode.toUpperCase();
    const dCode = defenderCode.toUpperCase();

    // Validate countries
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

    if (aCode === dCode) {
      return NextResponse.json({ error: "Cannot declare war on yourself" }, { status: 400 });
    }

    // Verify 1 SOL payment to treasury on-chain
    const verification = await verifyTreasuryPayment(txSignature, WAR_COST_SOL, wallet);
    if (!verification.valid) {
      return NextResponse.json({
        error: verification.error || "Payment verification failed. Send 1 SOL to treasury first.",
        treasury: TREASURY_WALLET,
        required: `${WAR_COST_SOL} SOL`,
      }, { status: 402 });
    }

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
      treasury: TREASURY_WALLET,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
