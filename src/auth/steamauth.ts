import { Hono } from "hono";
import { sign } from "hono/jwt";
import { db } from "../db/";
import { users } from "../db/schema";
import { setCookie } from "hono/cookie";

const steamAuth = new Hono();

const STEAM_API_KEY = Bun.env.STEAM_API_KEY;
const JWT_SECRET = Bun.env.JWT_SECRET;
const RETURN_TO = "http://localhost:3000/auth/steam/callback";

if (!STEAM_API_KEY) {
  throw new Error("STEAM_API_KEY is not set");
}
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

steamAuth.get("/", (c) => {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": RETURN_TO,
    "openid.realm": "http://localhost:3000",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return c.redirect(`https://steamcommunity.com/openid/login?${params}`);
});

steamAuth.get("/callback", async (c) => {
  const url = new URL(c.req.url);
  const params = url.searchParams;

  const claimedID = params.get("openid.claimed_id");
  const steamID = claimedID?.split("/id/")[1];

  if (!steamID) return c.text("Authentication failed", 400);

  const profileUrl = new URL(
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
  );
  profileUrl.searchParams.set("key", STEAM_API_KEY);
  profileUrl.searchParams.set("steamids", steamID);

  const profileRes = await fetch(profileUrl);

  if (!profileRes.ok) return c.text("Failed to fetch Steam profile", 502);

  const profileData: any = await profileRes.json();
  const player = profileData.response.players[0];

  await db
    .insert(users)
    .values({
      steamId: steamID,
      name: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileUrl,
    })
    .onConflictDoUpdate({
      target: users.steamId,
      set: {
        name: player.personaname,
        avatarUrl: player.avatarfull,
        profileUrl: player.profileUrl,
        lastLoginAt: new Date(),
      },
    });
  // 4. Your JWT and cookie code
  const maxAge = 60 * 60 * 24 * 7;

  const token = await sign(
    { steamID, exp: Math.floor(Date.now() / 1000) + maxAge },
    JWT_SECRET,
  );

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: Bun.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge,
  });

  return c.redirect("/");
});

export default steamAuth;
