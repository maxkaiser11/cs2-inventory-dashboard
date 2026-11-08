import { Hono } from "hono";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";

const inventory = new Hono();

inventory.get("/:steamId", async (c) => {
  c.text("Display Inventory here");
  const playerSteamId = c.req.param("steamId");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.steamId, playerSteamId));
  if (!user) return c.json({error: "User not found"}, 404);
  const url = `https://steamcommunity.com/inventory/${user.steamId}/730/2?l=english&count=75`;
  console.log("Fetching:", url);
  const res = await fetch(url);

  if (!res.ok) {
    console.log("Steam error: ", res.status);
    return c.json({ error: "Steam request failed" }, 502);
  }

  const data = await res.json();

  const descMap = new Map(
    data.descriptions.map((d: any) => [`${d.classid}_${d.instanceid}`, d])
  );

  const items = data.assets.map((a: any) => {
    const d: any = descMap.get(`${a.classid}_${a.instanceid}`);
    return {
      assetId: a.assetid,
      name: d?.market_hash_name,
      image: d ? `https://community.cloudflare.steamstatic.com/economy/image/${d.icon_url}` : null,
    tradable: d?.tradable === 1,
    };
  });

  // TODO: Make a db table for inventory 
  // and then link inventory to steamID of user


  return c.json(items);
});

export default inventory;
