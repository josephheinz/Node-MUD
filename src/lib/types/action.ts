import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faGem, faTools } from '@fortawesome/free-solid-svg-icons';
import { parse } from 'yaml';

export type ActionInput = {
	id: string;
	amount: number;
};

export type ChanceItem = {
	id: string;
	min: number;
	max: number;
	chance?: number; // Denominator, e.g. 1/1000 <- 100 is chance
};

export type ActionOutput = {
	items: ChanceItem[] /* 
    xp: Record<SkillKey, number>; */;
};

export type Action = {
	id: string;
	name: string;
	inputs: Set<ActionInput>;
	outputs: ActionOutput;
	time: number;
	icon: string;
	// requirement: Skill;
};

export type DBQueueAction = {
	id: string; // different where from old system where actions were stored instead of ids
	amount: number;
};

export function parseYamlToAction(yamlString: string): Action {
	let action = parse(yamlString)[0];

	// xp and requirement going here in the future

	return {
		id: action.id,
		name: action.name,
		inputs: new Set<ActionInput>(action.inputs ?? []),
		outputs: {
			items: action.outputs
		},
		time: action.time,
		icon: action.icon.image // to chance just to action.icon
	};
}

export type ActionCategory = keyof typeof actionCategories;

export const actionCategories: Record<string, Array<string>> = {
	Mining: ['mine_iron_ore', 'mine_gold_ore', 'mine_titanium_ore'],
	Crafting: ['craft_iron_sword', 'craft_gold_sword', 'craft_titanium_sword', 'craft_iron_shield'],
	Smelting: ['smelt_iron_bar', 'smelt_gold_bar', 'smelt_titanium_bar', 'smelt_hardened_titanium_bar']
};

export function getAction(id: string): Action | null {
	if (actionRegistry[id]) return actionRegistry[id];
	return null;
}

export const actionRegistry: Record<string, Action> = {};

export function initializeActionRegistry() {
	if (Object.keys(actionRegistry).length > 0) return;

	const actions = import.meta.glob('$lib/actions/**/*', { eager: true, as: 'raw' });

	for (const action in actions) {
		const id = action
			.split('/')
			.pop()!
			.replace(/\.[^/.]+$/, '');
		let _action = (actions[action] as any).default ?? actions[action];
		actionRegistry[id] = parseYamlToAction(_action);
	}

	console.log(actionRegistry)
}
