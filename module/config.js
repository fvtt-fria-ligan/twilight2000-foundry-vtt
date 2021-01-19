/**
 * The T2K4E Configuration file.
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

T2K4E.vehicle = {
	movementTypes: {
		'W': 'T2K4E.VehicleSheet.Wheels',
		'T': 'T2K4E.VehicleSheet.Tracks',
	},
	fuelTypes: {
		'G': 'T2K4E.VehicleSheet.Gasoline',
		'D': 'T2K4E.VehicleSheet.Diesel',
	}
};

T2K4E.armorLocationIcons = {
	head: '<i class="fas fa-hard-hat"></i>',
	arms: '<i class="fas fa-hand-paper"></i>',
	torso: '<i class="fas fa-tshirt"></i>',
	legs: '<i class="fas fa-socks"></i>',
};

T2K4E.diceIcons = {
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
};

T2K4E.ranges = [
	'T2K4E.Ranges.close',
	'T2K4E.Ranges.short',
	'T2K4E.Ranges.medium',
	'T2K4E.Ranges.long',
	'T2K4E.Ranges.extreme',
];