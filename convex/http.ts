import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { githubWebhook } from "./github/webhookHttp";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);
http.route({
  path: "/github/webhooks",
  method: "POST",
  handler: githubWebhook,
});

export default http;
