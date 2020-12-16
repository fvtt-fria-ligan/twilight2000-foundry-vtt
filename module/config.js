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

T2K4E.dieRanges = [12, 10, 8, 6, 0];
T2K4E.dieRatings = ['A', 'B', 'C', 'D', 'F'];
T2K4E.dieRangesMap = new Map(T2K4E.dieRatings.map((x, i) => [x, T2K4E.dieRanges[i]]));

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