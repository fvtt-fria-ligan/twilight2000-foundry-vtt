export const T2K4E = {};

T2K4E.attributes = {
	str: 'T2K4E.attributes.str',
	agl: 'T2K4E.attributes.agl',
	int: 'T2K4E.attributes.int',
	emp: 'T2K4E.attributes.emp',
}

T2K4E.skills = {
	none: 'T2K4E.skills.none',
	heavyWeapons: 'T2K4E.skills.heavyWeapons',
	closeCombat: 'T2K4E.skills.closeCombat',
	stamina: 'T2K4E.skills.stamina',
	driving: 'T2K4E.skills.driving',
	mobility: 'T2K4E.skills.mobility',
	rangedCombat: 'T2K4E.skills.rangedCombat',
	recon: 'T2K4E.skills.recon',
	survival: 'T2K4E.skills.survival',
	tech: 'T2K4E.skills.tech',
	command: 'T2K4E.skills.command',
	persuasion: 'T2K4E.skills.persuasion',
	medicalAid: 'T2K4E.skills.medicalAid'
}

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
	medicalAid: 'emp'
}

T2K4E.diceRanges = [0, 6, 8, 10, 12];
T2K4E.diceRangesMap = ['F', 'F', 'F', 'F', 'F', 'F', 'D', 'D', 'C', 'C', 'B', 'B', 'A'];

T2K4E.ranges = [
	'T2K4E.ranges.close',
	'T2K4E.ranges.short',
	'T2K4E.ranges.medium',
	'T2K4E.ranges.long',
	'T2K4E.ranges.extreme',
]

T2K4E.branches = {
	civilian: 'T2K4E.branches.civilian',
	military: 'T2K4E.branches.military',
}

T2K4E.speedTypes = {
	T: 'T2K4E.speedTypes.tracks',
	W: 'T2K4E.speedTypes.wheels',
}