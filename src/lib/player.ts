import { FREE_PACK_INTERVAL_HOURS } from "./engine/cards";

export const LOCAL_PROFILE_ID = "local-player";

export function computeStaminaRegen(wallet: {
  stamina: number;
  maxStamina: number;
  staminaUpdatedAt: Date;
}): { stamina: number; staminaUpdatedAt: Date } {
  if (wallet.stamina >= wallet.maxStamina) {
    return { stamina: wallet.stamina, staminaUpdatedAt: wallet.staminaUpdatedAt };
  }

  const intervalMs = FREE_PACK_INTERVAL_HOURS * 60 * 60 * 1000;
  const elapsedMs = Date.now() - wallet.staminaUpdatedAt.getTime();
  const ticks = Math.floor(elapsedMs / intervalMs);

  if (ticks <= 0) {
    return { stamina: wallet.stamina, staminaUpdatedAt: wallet.staminaUpdatedAt };
  }

  const stamina = Math.min(wallet.maxStamina, wallet.stamina + ticks);
  const consumedTicks = stamina - wallet.stamina;
  const staminaUpdatedAt = new Date(wallet.staminaUpdatedAt.getTime() + consumedTicks * intervalMs);

  return { stamina, staminaUpdatedAt };
}
