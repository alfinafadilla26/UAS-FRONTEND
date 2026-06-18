import type { NextApiRequest, NextApiResponse } from "next";

// const BACKEND_BASE = "http://157.66.34.203/agriapp/api/web/v1";
const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://157.66.34.203/agriapp/api/web/v1";

function buildTargetUrl(pathSegments: string[] | string, query: any) {
  const path = Array.isArray(pathSegments)
    ? pathSegments.join("/")
    : String(pathSegments || "");

  const url = new URL(`${BACKEND_BASE}/${path}`);

  // Forward query params
  for (const key of Object.keys(query || {})) {
    if (key === "path") continue;

    const value = query[key];

    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, String(v)));
    } else if (value != null) {
      url.searchParams.append(key, String(value));
    }
  }

  return url.toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("====================================");
  console.log("🔥 PROXY HIT");
  console.log("METHOD :", req.method);
  console.log("URL    :", req.url);

  try {
    const path = req.query.path || [];

    const target = buildTargetUrl(path as string[] | string, req.query);

    console.log("TARGET :", target);

    // Forward headers
    const forwardHeaders: Record<string, string> = {};

    for (const [k, v] of Object.entries(req.headers)) {
      const key = k.toLowerCase();

      if (!v) continue;

      if (
        key === "host" ||
        key === "origin" ||
        key === "referer" ||
        key === "connection"
      ) {
        continue;
      }

      forwardHeaders[key] = Array.isArray(v)
        ? v.join(",")
        : String(v);
    }

    console.log("HEADERS :", forwardHeaders);

    // Prepare Body
    let body: any = undefined;

    if (
      req.method &&
      req.method !== "GET" &&
      req.method !== "HEAD"
    ) {
      const reqContentType = (
        req.headers["content-type"] || ""
      ).toString();

      if (reqContentType.includes("application/json")) {
        body = JSON.stringify(req.body ?? {});
      } else if (
        reqContentType.includes(
          "application/x-www-form-urlencoded"
        )
      ) {
        if (typeof req.body === "string") {
          body = req.body;
        } else {
          body = new URLSearchParams(
            req.body as Record<string, any>
          ).toString();
        }
      } else {
        try {
          body = JSON.stringify(req.body ?? {});
        } catch {
          body = undefined;
        }
      }
    }

    const resp = await fetch(target, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    console.log("STATUS :", resp.status);

    const responseText = await resp.text();

    console.log("RESPONSE =======================");
    console.log(responseText);
    console.log("================================");

    res.status(resp.status);

    const responseType = resp.headers.get("content-type");

    if (responseType) {
      res.setHeader("content-type", responseType);
    }

    res.send(responseText);
  } catch (err: any) {
    console.error("PROXY ERROR :", err);

    res.status(500).json({
      ok: false,
      message: err?.message || "Proxy Error",
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};