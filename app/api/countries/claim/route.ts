import { NextRequest, NextResponse } from "next/server";
import { getCountry } from "@/lib/countries";
import { isClaimed, setClaim } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code, wallet, tokenAddress, xCommunity } = await req.json();

    if (!code || !wallet) {
      return NextResponse.json({ error: "Country code and wallet required" }, { status: 400 });
    }

    const country = getCountry(code);
    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    if (isClaimed(code)) {
      return NextResponse.json({ error: "This nation has already been claimed" }, { status: 409 });
    }

    setClaim(code, {
      claimedBy: wallet,
      tokenAddress: tokenAddress || "",
      xCommunity: xCommunity || "",
      claimedAt: Date.now(),
      oilStolen: 0,
    });

    return NextResponse.json({ success: true, country: country.name, code: country.code });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
