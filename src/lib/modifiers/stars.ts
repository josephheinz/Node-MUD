import { type HashableModifier, type IItemModifier } from '$lib/types/item';
import { intToBlackCircledNumber, intToCircledNumber } from '$lib/utils/general';

const STAR_COLORS = [
	'#ffffff', // tier 0 (1–5)
	'#60a5fa', // tier 1 (blue)
	'#4ade80', // tier 2 (green)
	'#facc15', // tier 3
	'#fb923c', // tier 4
	'#f87171' // tier 5+
];

export class StarsModifier implements IItemModifier, HashableModifier {
	type = 'Stars';

	constructor(public stars: number) {
		this.stars = Math.min(35, this.stars);
	}

	modifyName(baseName: string): string {
		const tier = Math.floor((this.stars - 1) / 5); // 0-based tier
		const inTier = ((this.stars - 1) % 5) + 1; // 1–5 progress

		const currentColor = STAR_COLORS[Math.min(tier + 1, STAR_COLORS.length - 1)];
		const previousColor = STAR_COLORS[Math.min(tier, STAR_COLORS.length - 1)];

		let result = '';

		// current tier stars
		for (let i = 0; i < inTier; i++) {
			result += `<span style="color:${currentColor}">✪</span>`;
		}

		// remaining stars (previous tier)
		for (let i = inTier; i < 5; i++) {
			result += `<span style="color:${previousColor}">✪</span>`;
		}

		if (tier > 4)
			result += `<span style="color:${currentColor}">${intToBlackCircledNumber(this.stars - 25)}</span>`;

		return `${baseName} ${result}`;
	}

	hash(): string {
		return `${this.type}:${this.stars}`;
	}

	static fromHash(hash: string): StarsModifier {
		const [, stars] = hash.split(':');
		return new StarsModifier(parseInt(stars));
	}
}
