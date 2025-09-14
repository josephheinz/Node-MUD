import { Equip } from '$lib/types';
import type { Action } from 'svelte/action';

interface ContextMenuOptions {
    menuItems: { label: string; onClick: () => void }[];
}

export const contextmenu: Action<HTMLElement, ContextMenuOptions> = (node, options) => {
    const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();

        // Remove existing menu if any
        const existing = document.getElementById('svelte-context-menu');
        if (existing) existing.remove();

        // Create menu container
        const menu = document.createElement('div');
        menu.id = 'svelte-context-menu';
        menu.className = 'absolute z-50 rounded bg-zinc-800 text-white shadow-lg';
        menu.style.top = `${event.pageY}px`;
        menu.style.left = `${event.pageX}px`;

        // Add menu items
        options?.menuItems.forEach(item => {
            const el = document.createElement('div');
            el.className = 'px-4 py-2 hover:bg-zinc-700 cursor-pointer';
            el.textContent = item.label;
            el.onclick = () => {
                item.onClick();
                menu.remove();
            };
            menu.appendChild(el);
        });

        document.body.appendChild(menu);

        const handleClickOutside = () => {
            menu.remove();
            document.removeEventListener('click', handleClickOutside);
        };

        document.addEventListener('click', handleClickOutside);
    };

    node.addEventListener('contextmenu', handleContextMenu);

    return {
        destroy() {
            node.removeEventListener('contextmenu', handleContextMenu);
        }
    };
};
