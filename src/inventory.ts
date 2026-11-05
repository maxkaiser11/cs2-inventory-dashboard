import { Hono } from "hono";

const inventory = new Hono();

inventory.get("/", (c) => 
  c.text("Display Inventory here"));

export default inventory;
