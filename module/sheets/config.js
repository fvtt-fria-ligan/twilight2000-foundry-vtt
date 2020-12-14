export const t2k4e = {};

t2k4e.skills = {
	none: 't2k4e.skills.none',
	heavyWeapons: 't2k4e.skills.heavyWeapons',
	closeCombat: 't2k4e.skills.closeCombat',
	stamina: 't2k4e.skills.stamina',
	driving: 't2k4e.skills.driving',
	mobility: 't2k4e.skills.mobility',
	rangedCombat: 't2k4e.skills.rangedCombat',
	recon: 't2k4e.skills.recon',
	survival: 't2k4e.skills.survival',
	tech: 't2k4e.skills.tech',
	command: 't2k4e.skills.command',
	persuasion: 't2k4e.skills.persuasion',
	medicalAid: 't2k4e.skills.medicalAid'
}

t2k4e.skillsMap = {
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

t2k4e.diceRanges = [0, 6, 8, 10, 12];
t2k4e.diceRangesMap = ['F', 'F', 'F', 'F', 'F', 'F', 'D', 'D', 'C', 'C', 'B', 'B', 'A'];

t2k4e.ranges = [
	't2k4e.ranges.close',
	't2k4e.ranges.short',
	't2k4e.ranges.medium',
	't2k4e.ranges.long',
	't2k4e.ranges.extreme',
]

t2k4e.branches = {
	civilian: 't2k4e.branches.civilian',
	military: 't2k4e.branches.military',
}

t2k4e.speedTypes = {
	T: "t2k4e.speedTypes.tracks",
	W: "t2k4e.speedTypes.wheels",
}