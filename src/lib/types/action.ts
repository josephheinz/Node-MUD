import { parse } from "yaml";
import { getDisplayDescription } from "./item";

export type ActionInput = {
    ids: string[];
    amounts: Number[];
};

export type ChanceItem = {
    id: string;
    min: Number;
    max: Number;
    chance?: Number; // Denominator of a fraction, e.g. 1/1000 to be rolled
};

export type ActionOutput = {
    items: ChanceItem[];
};

export type Action = {
    name: string;
    inputs: ActionInput;
    outputs: ActionOutput;
    time: Number;
};

export type DBQueueAction = {
    action: Action;
    amount: Number;
}

export function parseYAMLToAction(yamlString: string): Action {
    let action = parse(yamlString)[0];
    return {
        name: action.name,
        inputs: action.inputs,
        outputs: action.outputs,
        time: action.time
    };
}

export function getAction(id: string): Action | null {
    if (actionRegistry[id]) return actionRegistry[id];
    return null;
}

export const actionRegistry: Record<string, Action> = {};

const actions = import.meta.glob("$lib/actions/*", { eager: true, as: "raw" });

for (const action in actions) {
    const id = action.split("/").pop()!.replace(/\.[^/.]+$/, '');
    let _action = (actions[action] as any).default ?? actions[action];
    actionRegistry[id] = parseYAMLToAction(_action);
    console.log(actionRegistry[id]);
}