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
    'DRIVER': 'T2K4E.VehicleSheet.crewPositions.driver',
    'GUNNER': 'T2K4E.VehicleSheet.crewPositions.gunner',
    'COMMANDER': 'T2K4E.VehicleSheet.crewPositions.commander',
    'PASSENGER': 'T2K4E.VehicleSheet.crewPositions.passenger',
  },
  movementTypes: {
    'W': 'T2K4E.VehicleSheet.Wheels',
    'T': 'T2K4E.VehicleSheet.Tracks',
  },
  fuelTypes: {
    'G': 'T2K4E.VehicleSheet.Gasoline',
    'D': 'T2K4E.VehicleSheet.Diesel',
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

T2K4E.ranges = [
  'T2K4E.Ranges.close',
  'T2K4E.Ranges.short',
  'T2K4E.Ranges.medium',
  'T2K4E.Ranges.long',
  'T2K4E.Ranges.extreme',
];

/* ------------------------------------------- */
/*  Icons                                      */
/* ------------------------------------------- */

T2K4E.Icons = {
  buttons: {
    edit: '<i class="fas fa-edit"></i>',
    delete: '<i class="fas fa-trash"></i>',
    remove: '<i class="fas fa-times"></i>',
    fullStar: '<i class="fas fa-star"></i>',
    emptyStar: '<i class="far fa-star"></i>',
    stash: '<i class="fas fa-shopping-bag"></i>',
    unmount: '<i class="fas fa-thumbtack"></i>',
    mount: '<i class="fas fa-wrench"></i>',
    primaryWeapon: '<i class="fas fa-angle-up"></i>',
    secondaryWeapon: '<i class="fas fa-angle-double-up"></i>',
  },
  armorLocationIcons: {
    head: '<i class="fas fa-hard-hat"></i>',
    arms: '<i class="fas fa-hand-paper"></i>',
    torso: '<i class="fas fa-tshirt"></i>',
    legs: '<i class="fas fa-socks"></i>',
  },
  diceIcons: {
    base: {
      d12: [
        null,
        't2k-a1.png',
        't2k-a0.png',
        't2k-a0.png',
        't2k-a0.png',
        't2k-a0.png',
        't2k-a6.png',
        't2k-a6.png',
        't2k-a6.png',
        't2k-a6.png',
        't2k-a10.png',
        't2k-a10.png',
        't2k-a10.png',
      ],
      d10: [
        null,
        't2k-b1.png',
        't2k-b0.png',
        't2k-b0.png',
        't2k-b0.png',
        't2k-b0.png',
        't2k-b6.png',
        't2k-b6.png',
        't2k-b6.png',
        't2k-b6.png',
        't2k-b10.png',
      ],
      d8: [
        null,
        't2k-c1.png',
        't2k-c0.png',
        't2k-c0.png',
        't2k-c0.png',
        't2k-c0.png',
        't2k-c6.png',
        't2k-c6.png',
        't2k-c6.png',
      ],
      d6: [
        null,
        't2k-d1.png',
        't2k-d0.png',
        't2k-d0.png',
        't2k-d0.png',
        't2k-d0.png',
        't2k-d6.png',
      ],
    },
    ammo: {
      d6: [
        null,
        't2k-g1.png',
        't2k-g0.png',
        't2k-g0.png',
        't2k-g0.png',
        't2k-g0.png',
        't2k-g6.png',
      ],
    },
  },
};