/**
 * Registers Status Effect Icons.
 * @see https://foundryvtt.wiki/en/development/guides/active-effects
 */
export function registerStatusEffects() {
  const path = 'systems/t2k4e/assets/icons/';
  CONFIG.statusEffects = [
    {
      id: 'fullCover',
      name: 'EFFECT.Status.FullCover',
      img: `${path}token_full_cover.webp`,
    },
    {
      id: 'partialCover',
      name: 'EFFECT.StatusPartialCover',
      img: `${path}token_partial_cover.webp`,
    },
    {
      id: 'overwatch',
      name: 'EFFECT.StatusOverwatch',
      img: `${path}token_overwatch.webp`,
    },
    {
      id: 'suppressed',
      name: 'EFFECT.StatusSuppressed',
      img: `${path}token_suppressed.webp`,
    },
    {
      id: 'stop',
      name: 'EFFECT.StatusStop',
      img: `${path}token_stop.webp`,
    },
    {
      id: 'smoke',
      name: 'EFFECT.StatusSmoke',
      img: `${path}token_smoke.webp`,
    },
    {
      id: 'fire',
      name: 'EFFECT.StatusFire',
      img: `${path}token_fire.webp`,
    },
    {
      id: 'dead',
      name: 'EFFECT.StatusDead',
      img: 'icons/svg/skull.svg',
    },
    {
      id: 'sleep',
      name: 'EFFECT.StatusAsleep',
      img: 'icons/svg/sleep.svg',
    },
    {
      id: 'stun',
      name: 'EFFECT.StatusStunned',
      img: 'icons/svg/daze.svg',
    },
    {
      id: 'prone',
      name: 'EFFECT.StatusProne',
      img: 'icons/svg/falling.svg',
    },
    {
      id: 'restrain',
      name: 'EFFECT.StatusRestrained',
      img: 'icons/svg/net.svg',
    },
    {
      id: 'blind',
      name: 'EFFECT.StatusBlind',
      img: 'icons/svg/blind.svg',
    },
  ];
}
