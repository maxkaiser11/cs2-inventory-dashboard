import { Hono } from "hono";
import steamAuth from "./auth/steamauth";
import inventory from "./inventory";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors());
app.get("/", (c) => c.text("Welcome to your Steam Portfolio"));
app.route("/auth/steam", steamAuth);
app.route("/user/inventory", inventory);

export default app;
