import { NextResponse } from "next/server";
import { getCountry } from "@/lib/countries";
import { isClaimed, setClaim } from "@/lib/store";

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

    await setClaim(upper, {
      claimedBy: wallet,
      tokenAddress,
      xCommunity: xCommunity || "",
      claimedAt: Date.now(),
      population: 0,
      gdp: 0,
      oilStolen: 0,
      verified: false,
    });

    return NextResponse.json({
      success: true,
      message: `${country.name} claimed. You are now President.`,
      country: upper,
      president: wallet,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
