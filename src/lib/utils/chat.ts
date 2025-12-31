import { faSquareWebAwesome } from '@fortawesome/free-brands-svg-icons';
import { faCode, faMedal, type IconDefinition } from '@fortawesome/free-solid-svg-icons';

export const BadgeReferences: Record<string, { icon: IconDefinition; color: string }> = {
	owner: {
		icon: faSquareWebAwesome,
		color: '#4287f5'
	},
	VIP: {
		color: '#00ff00',
		icon: faMedal
	},
	'Beta-Tester': {
		color: '#cf3708',
		icon: faCode
	}
};
