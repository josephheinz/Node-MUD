import { type DBItem } from "./types/item";
import type { DBEquipment, Equipment } from "./types/equipment";

export interface ChatMessage {
    timestamp: Date;
    author: string;
    content: string;
};

export type InventoryRow = {
    inventory_data: DBItem[];
    equipment_data: DBEquipment;
};
