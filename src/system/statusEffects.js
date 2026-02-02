/**
 * Registers Status Effect Icons.
 * @see https://foundryvtt.wiki/en/development/guides/active-effects
 */
export function registerStatusEffects() {
  const path = 'systems/t2k4e/assets/icons/';
  CONFIG.statusEffects = {
    fullCover: {
      name: 'EFFECT.Status.FullCover',
      img: `${path}token_full_cover.webp`,
    },
    partialCover: {
      name: 'EFFECT.StatusPartialCover',
      img: `${path}token_partial_cover.webp`,
    },
    overwatch: {
      name: 'EFFECT.StatusOverwatch',
      img: `${path}token_overwatch.webp`,
    },
    suppressed: {
      name: 'EFFECT.StatusSuppressed',
      img: `${path}token_suppressed.webp`,
    },
    stop: {
      name: 'EFFECT.StatusStop',
      img: `${path}token_stop.webp`,
    },
    smoke: {
      name: 'EFFECT.StatusSmoke',
      img: `${path}token_smoke.webp`,
    },
    fire: {
      name: 'EFFECT.StatusFire',
      img: `${path}token_fire.webp`,
    },
    dead: {
      name: 'EFFECT.StatusDead',
      img: 'icons/svg/skull.svg',
    },
    sleep: {
      name: 'EFFECT.StatusAsleep',
      img: 'icons/svg/sleep.svg',
    },
    stun: {
      name: 'EFFECT.StatusStunned',
      img: 'icons/svg/daze.svg',
    },
    prone: {
      name: 'EFFECT.StatusProne',
      img: 'icons/svg/falling.svg',
    },
    restrain: {
      name: 'EFFECT.StatusRestrained',
      img: 'icons/svg/net.svg',
    },
    blind: {
      name: 'EFFECT.StatusBlind',
      img: 'icons/svg/blind.svg',
    },
  };
}
