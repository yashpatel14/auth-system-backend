import { UAParser } from "ua-parser-js";
import { format } from "date-fns";
import { logger } from "../configs/logger.js";

export const transformSessions = async (sessions) => {
  const transformed = [];

  for (const session of sessions) {
    const parser = UAParser(session.userAgent);
    const browser = parser.browser.name || "Unknown";
    const deviceType = parser.device.type || "Desktop";
    const device = `${deviceType} - ${browser}`;
    const location = await getLocationFromIP(session.ipAddress);
    const lastActive = format(new Date(session.updatedAt), "d/M/yyyy, h:mm:ss a");
    const status = getSessionStatus(session.expiresAt);

    transformed.push({
      id: session.id,
      device,
      location,
      ip: session.ipAddress,
      lastActive,
      status,
      ...(session.current !== undefined && { current: session.current }),
    });
  }

  return transformed;
};

const getLocationFromIP = async (ip) => {
  if (ip === "::1" || ip === "127.0.0.1") return "Localhost";

  try {
    const token = process.env.IPINFO_TOKEN;
    const res = await fetch(`https://ipinfo.io/${ip}?token=${token}`);
    const data = await res.json();

    const location =
      data.city && data.country
        ? `${data.city}, ${data.country}`
        : data.country || "Unknown Location";

    return location;
  } catch (err) {
    logger.error("Error fetching IP info", err);
    return "Unknown Location";
  }
};

const getSessionStatus = (expiresAt) => {
  return new Date() < new Date(expiresAt) ? "active" : "expired";
};
