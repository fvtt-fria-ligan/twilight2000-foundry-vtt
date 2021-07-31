/**
 * The T2K4E Configuration.
 * @constant
 */
export const T2K4E = {};

T2K4E.ASCII = `_________________________________________
                                         
████████╗██████╗ ██╗  ██╗██╗  ██╗███████╗
╚══██╔══╝╚════██╗██║ ██╔╝██║  ██║██╔════╝
   ██║    █████╔╝█████╔╝ ███████║█████╗  
   ██║   ██╔═══╝ ██╔═██╗ ╚════██║██╔══╝  
   ██║   ███████╗██║  ██╗     ██║███████╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝     ╚═╝╚══════╝
_________________________________________`;

T2K4E.attributes = {
  str: 'T2K4E.AttributeNames.str',
  agl: 'T2K4E.AttributeNames.agl',
  int: 'T2K4E.AttributeNames.int',
  emp: 'T2K4E.AttributeNames.emp',
};

T2K4E.skills = {
  none: 'T2K4E.SkillNames.none',
  heavyWeapons: 'T2K4E.SkillNames.heavyWeapons',
  closeCombat: 'T2K4E.SkillNames.closeCombat',
  stamina: 'T2K4E.SkillNames.stamina',
  driving: 'T2K4E.SkillNames.driving',
  mobility: 'T2K4E.SkillNames.mobility',
  rangedCombat: 'T2K4E.SkillNames.rangedCombat',
  recon: 'T2K4E.SkillNames.recon',
  survival: 'T2K4E.SkillNames.survival',
  tech: 'T2K4E.SkillNames.tech',
  command: 'T2K4E.SkillNames.command',
  persuasion: 'T2K4E.SkillNames.persuasion',
  medicalAid: 'T2K4E.SkillNames.medicalAid',
};

T2K4E.skillsMap = {
  none: null,
  heavyWeapons: 'str',
  closeCombat: 'str',
  stamina: 'str',
  driving: 'agl',
  mobility: 'agl',
  rangedCombat: 'agl',
  recon: 'int',
  survival: 'int',
  tech: 'int',
  command: 'emp',
  persuasion: 'emp',
  medicalAid: 'emp',
};

T2K4E.dieSizes = [-1, 12, 10, 8, 6, 0];
T2K4E.dieScores = ['–', 'A', 'B', 'C', 'D', 'F'];
T2K4E.dieSizesMap = new Map(T2K4E.dieScores.map((x, i) => [x, T2K4E.dieSizes[i]]));

T2K4E.physicalItems = ['weapon', 'armor', 'grenade', 'ammunition', 'gear'];

T2K4E.vehicle = {
  extraPassengerEncumbrance: 50,
  emptySeatEncumbrance: 25,
  crewPositionFlags: ['DRIVER', 'GUNNER', 'COMMANDER', 'PASSENGER'],
  crewPositionFlagsLocalized: {
    'DRIVER': 'T2K4E.VehicleSheet.CrewPositions.Driver',
    'GUNNER': 'T2K4E.VehicleSheet.CrewPositions.Gunner',
    'COMMANDER': 'T2K4E.VehicleSheet.CrewPositions.Commander',
    'PASSENGER': 'T2K4E.VehicleSheet.CrewPositions.Passenger',
  },
  movementTypes: {
    'W': 'T2K4E.VehicleSheet.Wheels',
    'T': 'T2K4E.VehicleSheet.Tracks',
  },
  fuelTypes: {
    'G': 'T2K4E.VehicleSheet.Gasoline',
    'D': 'T2K4E.VehicleSheet.Diesel',
    'A': 'T2K4E.VehicleSheet.Alcohol',
  },
  components: [
    'FUEL',
    'ENGINE',
    'SUSPENSION',
    'AMMUNITION',
    'CARGO',
    'DRIVER',
    'PASSENGER',
    'GUNNER',
    'COMMANDER',
    'RADIO',
    'TRACK_WHEEL',
    'WEAPON',
    'FIRE_CONTROL_SYSTEM',
    'ANTENNA',
    'EXTERNAL_STORES',
    'EXPOSED_PASSENGER',
    'RICOCHET',
  ],
  componentDamage: {
    penetration: [
      'FUEL',
      'ENGINE',
      'SUSPENSION',
      'AMMUNITION',
      'CARGO',
      'DRIVER',
      'PASSENGER',
      'GUNNER',
      'COMMANDER',
      'RADIO',
    ],
    glancingBlow: [
      'TRACK_WHEEL',
      'WEAPON',
      'FIRE_CONTROL_SYSTEM',
      'ANTENNA',
      'EXTERNAL_STORES',
      'EXPOSED_PASSENGER',
      'EXPOSED_PASSENGER',
      'RICOCHET',
      'RICOCHET',
    ],
  },
};

T2K4E.unit = {
  unitAffiliations: {
    'friendly': 'T2K4E.UnitAffiliationNames.friendly',
    'hostile' : 'T2K4E.UnitAffiliationNames.hostile',
    'neutral': 'T2K4E.UnitAffiliationNames.neutral',
    'unknown': 'T2K4E.UnitAffiliationNames.unknown',
  },
  unitSizes: {
    'army': 'T2K4E.UnitSizeNames.army',
    'corps': 'T2K4E.UnitSizeNames.corps',
    'division': 'T2K4E.UnitSizeNames.division',
    'Brigade': 'T2K4E.UnitSizeNames.Brigade',
    'regiment': 'T2K4E.UnitSizeNames.regiment',
    'battalion': 'T2K4E.UnitSizeNames.battalion',
    'company': 'T2K4E.UnitSizeNames.company',
    'staffel': 'T2K4E.UnitSizeNames.staffel',
    'platoon': 'T2K4E.UnitSizeNames.platoon',
    'section': 'T2K4E.UnitSizeNames.section',
    'squad': 'T2K4E.UnitSizeNames.squad',
    'fireteam': 'T2K4E.UnitSizeNames.fireteam',
  },
  unitModifiers: {
    'airborne': 'T2K4E.UnitModifierNames.airborne',
    'parachute': 'T2K4E.UnitModifierNames.parachute',
    'airmobile': 'T2K4E.UnitModifierNames.airmobile',
    'airmobileOrganicLift': 'T2K4E.UnitModifierNames.airmobileOrganicLift',
    'amphibious': 'T2K4E.UnitModifierNames.amphibious',
    'motorized': 'T2K4E.UnitModifierNames.motorized',
    'moutain': 'T2K4E.UnitModifierNames.moutain',
    'cannon': 'T2K4E.UnitModifierNames.cannon',
    'wheeled': 'T2K4E.UnitModifierNameswheeled.',
  },
};

T2K4E.hitLocations = {
  none: '',
  head: 'T2K4E.ArmorLocationNames.head',
  arms: 'T2K4E.ArmorLocationNames.arms',
  torso: 'T2K4E.ArmorLocationNames.torso',
  legs: 'T2K4E.ArmorLocationNames.legs',
};

T2K4E.injuryCategories = {
  none: '',
  physical: 'T2K4E.InjuryCategoryNames.physical',
  mental: 'T2K4E.InjuryCategoryNames.mental',
};

T2K4E.radiationVirulence = 4;

T2K4E.ranges = [
  'T2K4E.Ranges.close',
  'T2K4E.Ranges.short',
  'T2K4E.Ranges.medium',
  'T2K4E.Ranges.long',
  'T2K4E.Ranges.extreme',
];

T2K4E.rollModes = {
  roll: 'CHAT.RollPublic',
  gmroll: 'CHAT.RollPrivate',
  blindroll: 'CHAT.RollBlind',
  selfroll: 'CHAT.RollSelf',
};

T2K4E.unarmedData = {
  attribute: 'str',
  skill: 'closeCombat',
  damage: 1,
  crit: 4,
  blast: '–',
  armorModifier: 3,
  range: 0,
  weight: 0,
  price: 0,
  modifiers: { attributes: {}, skills: {} },
  rof: 0,
  mag: {},
  props: {},
};

/* ------------------------------------------- */
/*  Icons                                      */
/* ------------------------------------------- */

T2K4E.Icons = {
  buttons: {
    edit: '<i class="fas fa-edit"></i>',
    delete: '<i class="fas fa-trash"></i>',
    remove: '<i class="fas fa-times"></i>',
    plus: '<i class="fas fa-plus"></i>',
    minus: '<i class="fas fa-minus"></i>',
    equip: '<i class="fas fa-star"></i>',
    unequip: '<i class="far fa-star"></i>',
    stash: '<i class="fas fa-shopping-bag"></i>',
    unmount: '<i class="fas fa-thumbtack"></i>',
    mount: '<i class="fas fa-wrench"></i>',
    primaryWeapon: '<i class="fas fa-angle-up"></i>',
    secondaryWeapon: '<i class="fas fa-angle-double-up"></i>',
    attack: '<i class="fas fa-crosshairs"></i>',
    reload: '<i class="fas fa-sync-alt"></i>',
    lethal: '<i class="fas fa-skull"></i>',
    mental: '<i class="fas fa-brain"></i>',
  },
  armorLocationIcons: {
    head: '<i class="fas fa-hard-hat"></i>',
    arms: '<i class="fas fa-hand-paper"></i>',
    torso: '<i class="fas fa-tshirt"></i>',
    legs: '<i class="fas fa-socks"></i>',
  },
  // diceIcons: {
  //   base: {
  //     d12: [
  //       null,
  //       't2k-a1.png',
  //       't2k-a0.png',
  //       't2k-a0.png',
  //       't2k-a0.png',
  //       't2k-a0.png',
  //       't2k-a6.png',
  //       't2k-a6.png',
  //       't2k-a6.png',
  //       't2k-a6.png',
  //       't2k-a10.png',
  //       't2k-a10.png',
  //       't2k-a10.png',
  //     ],
  //     d10: [
  //       null,
  //       't2k-b1.png',
  //       't2k-b0.png',
  //       't2k-b0.png',
  //       't2k-b0.png',
  //       't2k-b0.png',
  //       't2k-b6.png',
  //       't2k-b6.png',
  //       't2k-b6.png',
  //       't2k-b6.png',
  //       't2k-b10.png',
  //     ],
  //     d8: [
  //       null,
  //       't2k-c1.png',
  //       't2k-c0.png',
  //       't2k-c0.png',
  //       't2k-c0.png',
  //       't2k-c0.png',
  //       't2k-c6.png',
  //       't2k-c6.png',
  //       't2k-c6.png',
  //     ],
  //     d6: [
  //       null,
  //       't2k-d1.png',
  //       't2k-d0.png',
  //       't2k-d0.png',
  //       't2k-d0.png',
  //       't2k-d0.png',
  //       't2k-d6.png',
  //     ],
  //   },
  //   ammo: {
  //     d6: [
  //       null,
  //       't2k-g1.png',
  //       't2k-g0.png',
  //       't2k-g0.png',
  //       't2k-g0.png',
  //       't2k-g0.png',
  //       't2k-g6.png',
  //     ],
  //   },
  // },
};