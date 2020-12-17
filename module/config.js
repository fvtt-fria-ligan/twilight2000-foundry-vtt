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
	str: 'T2KLANG.attributes.str',
	agl: 'T2KLANG.attributes.agl',
	int: 'T2KLANG.attributes.int',
	emp: 'T2KLANG.attributes.emp',
}

T2K4E.skills = {
	none: 'T2KLANG.skills.none',
	heavyWeapons: 'T2KLANG.skills.heavyWeapons',
	closeCombat: 'T2KLANG.skills.closeCombat',
	stamina: 'T2KLANG.skills.stamina',
	driving: 'T2KLANG.skills.driving',
	mobility: 'T2KLANG.skills.mobility',
	rangedCombat: 'T2KLANG.skills.rangedCombat',
	recon: 'T2KLANG.skills.recon',
	survival: 'T2KLANG.skills.survival',
	tech: 'T2KLANG.skills.tech',
	command: 'T2KLANG.skills.command',
	persuasion: 'T2KLANG.skills.persuasion',
	medicalAid: 'T2KLANG.skills.medicalAid'
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

T2K4E.dieSizes = [-1, 12, 10, 8, 6, 0];
T2K4E.dieScores = ['–', 'A', 'B', 'C', 'D', 'F'];
T2K4E.dieSizesMap = new Map(T2K4E.dieScores.map((x, i) => [x, T2K4E.dieSizes[i]]));

T2K4E.ranges = [
	'T2KLANG.ranges.close',
	'T2KLANG.ranges.short',
	'T2KLANG.ranges.medium',
	'T2KLANG.ranges.long',
	'T2KLANG.ranges.extreme',
]

T2K4E.branches = {
	civilian: 'T2KLANG.branches.civilian',
	military: 'T2KLANG.branches.military',
}

T2K4E.speedTypes = {
	T: 'T2KLANG.speedTypes.tracks',
	W: 'T2KLANG.speedTypes.wheels',
}