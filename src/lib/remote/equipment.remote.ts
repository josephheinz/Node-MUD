import { command, form, getRequestEvent, query } from '$app/server';
import {
	EmptyEquipment,
	Equipment,
	Rarity,
	type DBEquipment,
	type DBInventory,
	type DBItem,
	type EquipmentSlot,
	type IItemModifier,
	type Item
} from '$lib/types/item';
import { canonicalizeDbItem, determineSlot, loadDbItem } from '$lib/utils/item';
import { error, redirect } from '@sveltejs/kit';
import { isEqual } from 'radashi';
import * as z from 'zod';

const RaritySchema = z.enum([
	'Common',
	'Uncommon',
	'Rare',
	'Epic',
	'Legendary',
	'Mythic',
	'Divine',
	'Special'
]);

const StatListSchema = z.record(z.string(), z.object({
	amount: z.number(),
	operation: z.enum(["additive", "multiplicative"])
}));

const RawModifierSpecSchema = z
	.object({
		type: z.string()
	})
	.catchall(z.any());

const ItemModifierSchema: z.ZodType<IItemModifier> = z.object({
	type: z.string(),
	displayName: z.string().optional(),
	priority: z.number(),
	statChanges: StatListSchema.optional(),

	modifyName: z
		.function({
			input: [z.string()],
			output: z.string()
		})
		.optional(),

	modifyDescription: z
		.function({
			input: [z.string()],
			output: z.string()
		})
		.optional(),

	toJSON: z.function({
		input: [],
		output: RawModifierSpecSchema
	}),

	hash: z.function({
		input: [],
		output: z.string()
	})
});

const ItemSchema = z.object({
	uid: z.string(),
	id: z.string(),
	name: z.string(),
	rarity: RaritySchema,
	desc: z.string().optional(),
	icon: z.string(),
	baseStats: StatListSchema.optional(),
	modifiers: z.array(ItemModifierSchema)
});

const DBItemSchema = z.object({
	id: z.string(),
	modifiers: z.array(z.string()).optional()
});

const DBInventorySchema = z.array(DBItemSchema);

export const getEquipment = query(async () => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		redirect(307, "/");
	}

	const { data, error } = await locals.supabase
		.from('inventories')
		.select('equipment_data')
		.eq('player_id', locals.user.id)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	if (data) {
		const equipment: Equipment = Equipment.load(data.equipment_data as DBEquipment);
		return equipment;
	}

	throw new Error("Equipment not found in database");
})

export const getEquipmentById = query(z.uuidv4(), async (id) => {
	const { locals } = getRequestEvent();

	const { data, error } = await locals.supabase
		.from('inventories')
		.select('equipment_data')
		.eq('player_id', id)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	if (data) {
		const equipment: Equipment = Equipment.load(data.equipment_data as DBEquipment);
		return equipment;
	}

	throw new Error("Equipment not found in database");
})

const DBEquipmentSchema = z.object({
	Head: DBItemSchema.nullable(),
	Body: DBItemSchema.nullable(),
	Legs: DBItemSchema.nullable(),
	Offhand: DBItemSchema.nullable(),
	Mainhand: DBItemSchema.nullable(),
	Necklace: DBItemSchema.nullable(),
	Ring: DBItemSchema.nullable(),
	Hands: DBItemSchema.nullable()
});

const equipRequestSchema = z.object({
	id: z.uuidv4(),
	dbItem: DBItemSchema
});

const EquipmentSlotKeySchema = DBEquipmentSchema.keyof();
type EquipmentSlotKey = z.infer<typeof EquipmentSlotKeySchema>;

const unequipRequestSchema = z.object({
	id: z.uuidv4(),
	slot: EquipmentSlotKeySchema
});

export const equip = command(equipRequestSchema, async ({ id, dbItem }) => {
	const { locals } = getRequestEvent();
	const user = locals.user;

	if (!user || (user && user.id !== id)) return error(401);

	const supabase = locals.supabase;

	const { data, error: fetchError } = await supabase
		.from('inventories')
		.select('inventory_data, equipment_data')
		.eq('player_id', id)
		.single();

	if (fetchError || !data) {
		return error(404);
	}

	const { inventory_data, equipment_data } = data as {
		inventory_data: DBInventory;
		equipment_data: DBEquipment;
	};

	const dbItemIndex = inventory_data.findIndex((i) => {
		const sortedI: DBItem = {
			...i,
			modifiers: [...(i.modifiers ?? [])].sort()
		};

		const sortedDbItem: DBItem = {
			...dbItem,
			modifiers: [...(dbItem.modifiers ?? [])].sort()
		};

		return isEqual(sortedI, sortedDbItem);
	});
	if (dbItemIndex === -1) return error(404);

	inventory_data.splice(dbItemIndex, 1);

	const item: Item = loadDbItem(dbItem);

	const slot: EquipmentSlot | undefined = determineSlot(item);
	if (!slot) return error(404, "Item not equippable");

	// Update equipment slot with proper item
	if (equipment_data[slot]) {
		let equippedItem: DBItem = equipment_data[slot];

		equippedItem = canonicalizeDbItem(equippedItem);
		inventory_data.push(equippedItem);
	}

	equipment_data[slot] = dbItem;

	const { error: updateError } = await supabase
		.from('inventories')
		.update({ inventory_data, equipment_data })
		.eq('player_id', id);

	if (updateError) return error(500, updateError.message);

	return { inventory_data, equipment_data };
});

export const unequip = command(unequipRequestSchema, async ({ id, slot }) => {
	const { locals } = getRequestEvent();
	const user = locals.user;

	if (!user || (user && user.id !== id)) return error(401);

	const supabase = locals.supabase;

	const { data, error: fetchError } = await supabase
		.from('inventories')
		.select('inventory_data, equipment_data')
		.eq('player_id', id)
		.single();

	const { inventory_data, equipment_data } = data as {
		inventory_data: DBInventory;
		equipment_data: DBEquipment;
	};

	slot = slot.toLowerCase() as EquipmentSlot

	console.log(equipment_data[slot], fetchError)

	const item: DBItem | null = equipment_data[slot];
	if (!item) return error(400);

	equipment_data[slot] = null;
	inventory_data.push(item);

	const { error: updateError } = await supabase
		.from('inventories')
		.update({
			inventory_data,
			equipment_data
		})
		.eq('player_id', id);

	if (updateError) {
		console.log(updateError)
		return error(500);
	}

	return { inventory_data, equipment_data };
});
