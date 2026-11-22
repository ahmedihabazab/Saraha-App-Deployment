import geoip from "geoip-lite";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { expireKey, incrKey } from "./cashe.service.js";

function reqLimiter(
  ttl,
  limit,
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
) {
  return rateLimit({
    windowMs: ttl * 1000,
    limit: (req) => {
      const geo = geoip.lookup(req.ip);
      return geo?.country === "EG" ? limit : 0;
    },
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    handler: (req, res) => {
      res.status(429).json({ msg: "Too many requests" });
    },
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip);
      return `${ip}::${req.path}`;
    },
    store: {
      incr: async (key  , cb) => {
        const count = await incrKey({ key });

        if (count == 1) {
          await expireKey({ key, ttl });
        }
        cb(null, count);
      },
    },
    skipSuccessfulRequests,
    skipFailedRequests,
  });
}

export default reqLimiter;
