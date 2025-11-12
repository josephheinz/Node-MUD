import { parse } from "yaml";

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
};

export type Action = {
    name: string;
    inputs: ActionInput;
    outputs: ActionOutput;
    time: number;
};

export type DBQueueAction = {
    action: Action;
    amount: number;
}

export function parseYAMLToAction(yamlString: string): Action {
    let action = parse(yamlString)[0];
    return {
        name: action.name,
        inputs: action.inputs,
        outputs: { items: action.outputs },
        time: action.time
    };
}

export function getAction(id: string): Action | null {
    if (actionRegistry[id]) return actionRegistry[id];
    return null;
}

export function rollChance(item: ChanceItem): boolean {
  // No chance means always succeeds
  if (!item.chance || item.chance <= 1) return true;
  return Math.floor(Math.random() * item.chance) === 0;
}

export function rollValue(item: ChanceItem): number {
  return Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
}

export type ActionCategory = keyof typeof actionCategories;

export const actionCategories: Record<string, Array<string>> = {
    "test": ["test_action"]
};

export const actionRegistry: Record<string, Action> = {};

const actions = import.meta.glob("$lib/actions/*", { eager: true, as: "raw" });

for (const action in actions) {
    const id = action.split("/").pop()!.replace(/\.[^/.]+$/, '');
    let _action = (actions[action] as any).default ?? actions[action];
    actionRegistry[id] = parseYAMLToAction(_action);
    console.log(actionRegistry[id]);
}