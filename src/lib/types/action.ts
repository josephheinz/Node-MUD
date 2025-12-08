import { parse } from 'yaml';
import { type SkillKey } from './skills';

export type ActionInput = {
	ids: string[];
	amounts: number[];
};

export type ChanceItem = {
	id: string;
	min: number;
	max: number;
	chance?: number; // Denominator of a fraction, e.g. 1/1000 to be rolled
};

export type ActionOutput = {
	items: ChanceItem[];
	xp?: Record<SkillKey, number>;
};

export type Action = {
	name: string;
	inputs: ActionInput;
	outputs: ActionOutput;
	time: number;
	icon: ActionIcon;
};

export type ActionIcon = {
	image: string;
	color: string;
};

export type DBQueueAction = {
	action: Action;
	amount: number;
};

/**
 * Create an Action object from a YAML string describing one or more actions by using the first document.
 *
 * @param yamlString - YAML content that defines an action or an array of actions; the first item is used
 * @returns An Action populated with name, inputs, outputs (as `{ items: [...] }`), time, and icon
 */
export function parseYAMLToAction(yamlString: string): Action {
	let action = parse(yamlString)[0];
	return {
		name: action.name,
		inputs: action.inputs,
		outputs: { items: action.outputs, xp: (action.xp as Record<SkillKey, number>) ?? undefined },
		time: action.time,
		icon: { image: action.icon.image, color: action.icon.color }
	};
}

/**
 * Retrieve an action by its registry identifier.
 *
 * @param id - The action identifier (registry key)
 * @returns The Action associated with `id`, or `null` if no matching action is found
 */
export function getAction(id: string): Action | null {
	if (actionRegistry[id]) return actionRegistry[id];
	return null;
}

/**
 * Determines whether a ChanceItem is granted based on its `chance` denominator.
 *
 * @param item - The ChanceItem whose `chance` property is used as a denominator; if `chance` is missing or less than or equal to 1 the item is always granted.
 * @returns `true` if the item is granted according to its chance, `false` otherwise.
 */
export function rollChance(item: ChanceItem): boolean {
	// No chance means always succeeds
	if (!item.chance || item.chance <= 1) return true;
	return Math.floor(Math.random() * item.chance) === 0;
}

/**
 * Selects a random integer within the chance item's defined range.
 *
 * @param item - The chance item whose `min` and `max` define the inclusive range
 * @returns A random integer between `item.min` and `item.max`, inclusive
 */
export function rollValue(item: ChanceItem): number {
	return Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
}

export type ActionCategory = keyof typeof actionCategories;

export const actionCategories: Record<string, Array<string>> = {
	Mining: ['mine_iron_ore', 'mine_gold_ore', 'mine_titanium_ore'],
	Crafting: ['craft_iron_sword', 'craft_gold_sword', 'craft_titanium_sword', "craft_iron_shield"],
	Smelt: ['smelt_iron_bar', 'smelt_gold_bar', 'smelt_titanium_bar', 'smelt_hardened_titanium_bar']
};

export const actionRegistry: Record<string, Action> = {};

const actions = import.meta.glob('$lib/actions/**/*', { eager: true, as: 'raw' });

for (const action in actions) {
	const id = action
		.split('/')
		.pop()!
		.replace(/\.[^/.]+$/, '');
	let _action = (actions[action] as any).default ?? actions[action];
	actionRegistry[id] = parseYAMLToAction(_action);
}