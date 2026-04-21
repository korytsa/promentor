import { randomBytes } from "crypto";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SPECIAL = "!@#$%&*";

export function generateInvitePassword(minLength = 12): string {
  const length = Math.max(minLength, 8);
  const pick = (pool: string) => pool[randomBytes(1)[0] % pool.length];

  const chars: string[] = [
    pick(UPPER),
    pick(LOWER),
    pick(DIGITS),
    pick(SPECIAL),
  ];

  const all = UPPER + LOWER + DIGITS + SPECIAL;
  for (let i = chars.length; i < length; i++) {
    chars.push(pick(all));
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }

  return chars.join("");
}
