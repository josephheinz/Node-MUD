import numeral from 'numeral';

export type Require<T, K extends keyof T> = T & Required<Pick<T, K>>;

export function toRoman(num: number): string {
	if (!Number.isInteger(num) || num <= 0 || num >= 4000) {
		throw new RangeError('Roman numerals support 1-3999');
	}

	const map: Array<[number, string]> = [
		[1000, 'M'],
		[900, 'CM'],
		[500, 'D'],
		[400, 'CD'],
		[100, 'C'],
		[90, 'XC'],
		[50, 'L'],
		[40, 'XL'],
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I']
	];

	let result = '';
	for (const [value, numeral] of map) {
		while (num >= value) {
			result += numeral;
			num -= value;
		}
	}
	return result;
}

export function intToCircledNumber(n: number): string {
	if (n === 0) return String.fromCodePoint(0x24ea); // ⓪
	if (n >= 1 && n <= 20) return String.fromCodePoint(0x2460 + n - 1); // ①–⑳
	if (n >= 21 && n <= 35) return String.fromCodePoint(0x3251 + n - 21); // ㉑–㉟
	if (n >= 36 && n <= 50) return String.fromCodePoint(0x32b1 + n - 36); // ㊱–㊿
	throw new Error('Number out of supported range (0-50)');
}

export function intToBlackCircledNumber(n: number): string {
	if (n < 1) throw new Error('Number must be >= 1');
	if (n > 10) n = 10; // cap at 10
	return String.fromCodePoint(0x2775 + n); // ❶–❿
}

export function formatNumber(num: number): string {
	return numeral(num).format('0,0[.][00]A');
}

export async function fetchUserData<T>(
	endpoint: string,
	userId: string,
	fetch: typeof globalThis.fetch
): Promise<T | null> {
	try {
		const response = await fetch(`/api/${endpoint}/${userId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching ${endpoint}:`, error);
		return null;
	}
}

export function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function capitalizeAfterSpaces(str: String): String {
	return str.replace(/(^|\s)[a-z]/gi, (l) => l.toUpperCase());
}

export function capitalizeFirstLetter(str: string): string {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}
