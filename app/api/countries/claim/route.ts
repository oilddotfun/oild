import { NextResponse } from "next/server";
import { getCountry } from "@/lib/countries";
import { isClaimed, setClaim, isTokenUsed } from "@/lib/store";
import { verifyTokenExists } from "@/lib/verify-token";

export async function POST(req: Request) {
  try {
    const { code, wallet, tokenAddress, xCommunity } = await req.json();

    if (!code || !wallet) {
      return NextResponse.json({ error: "Country code and wallet required" }, { status: 400 });
    }

    const upper = code.toUpperCase();
    const country = getCountry(upper);
    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    if (await isClaimed(upper)) {
      return NextResponse.json({ error: `${country.name} is already claimed` }, { status: 409 });
    }

    if (!tokenAddress) {
      return NextResponse.json({ error: "Token address required. Deploy on pump.fun first." }, { status: 400 });
    }

    // Check if this token is already used by another country
    if (await isTokenUsed(tokenAddress)) {
      return NextResponse.json({ error: "This token is already attached to another country." }, { status: 409 });
    }

    // Validate token address format (Solana base58, 32-88 chars)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,88}$/.test(tokenAddress)) {
      return NextResponse.json({ error: "Invalid token address format" }, { status: 400 });
    }

    // Verify token exists on-chain
    const verification = await verifyTokenExists(tokenAddress);
    if (!verification.valid) {
      return NextResponse.json({
        error: "Token not found on-chain. Make sure you've deployed it on pump.fun first and the token address is correct.",
      }, { status: 400 });
    }

    await setClaim(upper, {
      claimedBy: wallet,
      tokenAddress,
      xCommunity: xCommunity || "",
      claimedAt: Date.now(),
      population: 0,
      gdp: verification.marketCap || 0,
      oilStolen: 0,
      verified: verification.source === "dexscreener",
    });

    return NextResponse.json({
      success: true,
      message: `${country.name} claimed. You are now President.`,
      country: upper,
      president: wallet,
      verified: verification.source,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
