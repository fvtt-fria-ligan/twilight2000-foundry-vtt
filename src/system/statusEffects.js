/**
 * Registers Status Effect Icons.
 * @see https://foundryvtt.wiki/en/development/guides/active-effects
 */
export function registerStatusEffects() {
  const path = 'systems/t2k4e/assets/icons/';
  CONFIG.statusEffects = [
    {
      id: 'fullCover',
      label: 'EFFECT.StatusFullCover',
      icon: `${path}token_full_cover.webp`,
    },
    {
      id: 'partialCover',
      label: 'EFFECT.StatusPartialCover',
      icon: `${path}token_partial_cover.webp`,
    },
    {
      id: 'overwatch',
      label: 'EFFECT.StatusOverwatch',
      icon: `${path}token_overwatch.webp`,
    },
    {
      id: 'suppressed',
      label: 'EFFECT.StatusSuppressed',
      icon: `${path}token_suppressed.webp`,
    },
    {
      id: 'stop',
      label: 'EFFECT.StatusStop',
      icon: `${path}token_stop.webp`,
    },
    {
      id: 'smoke',
      label: 'EFFECT.StatusSmoke',
      icon: `${path}token_smoke.webp`,
    },
    {
      id: 'fire',
      label: 'EFFECT.StatusFire',
      icon: `${path}token_fire.webp`,
    },
    {
      icon: 'icons/svg/skull.svg',
      id: 'dead',
      label: 'EFFECT.StatusDead',
    },
    {
      icon: 'icons/svg/sleep.svg',
      id: 'sleep',
      label: 'EFFECT.StatusAsleep',
    },
    {
      icon: 'icons/svg/daze.svg',
      id: 'stun',
      label: 'EFFECT.StatusStunned',
    },
    {
      icon: 'icons/svg/falling.svg',
      id: 'prone',
      label: 'EFFECT.StatusProne',
    },
    {
      icon: 'icons/svg/net.svg',
      id: 'restrain',
      label: 'EFFECT.StatusRestrained',
    },
    {
      icon: 'icons/svg/blind.svg',
      id: 'blind',
      label: 'EFFECT.StatusBlind',
    },
  ];
}
