import { type DBItem } from "./types/item";
import type { Equipment } from "./types/equipment";

export interface Action {
    max: number;
    value: number;
    name: string;
};

export interface IActionInput {
    id: string;
    amount: number;
}

export class IAction {
    public name: string;
    public id: number;
    public inputs?: IActionInput[];
    public outputs: IActionInput[];
    public time: number; // time in seconds
    public amount: number;
    public start: Date;
    public flags?: string[];
    public active: boolean = $state(true);

    public elapsed: number = $state(0);

    constructor({ name, id, inputs, outputs, time, amount, start, flags }: { name: string; id: number; inputs?: IActionInput[]; outputs: IActionInput[]; time: number; amount: number; start?: Date; flags?: string[] }) {
        this.name = name;
        this.id = id;
        this.inputs = inputs;
        this.outputs = outputs;
        this.time = time;
        this.amount = amount;
        this.start = start ?? new Date(Date.now());
        this.flags = flags;
    }

    public getTimeElapsed(): number {
        return this.elapsed;
    }

    public getTimeLeft(): number {
        return this.time - this.elapsed;
    }
};

export interface ChatMessage {
    timestamp: Date;
    author: string;
    content: string;
};

export type InventoryRow = {
    inventory_data: DBItem[];
    equipment_data: Equipment;
};
