// contextMenu.ts
// Github @dukenmarga, July 2022
// Converted to Svelte 5 action syntax

export interface ContextMenuItem {
    name: string;
    onClick?: () => void;
    displayText?: string;
    icon?: string;
    isDivider?: boolean;
}

export interface ContextMenuOptions {
    menuItems: ContextMenuItem[];
    onOpen?: () => void;
    onClose?: () => void;
}

export function contextMenu(node: HTMLElement, options: ContextMenuOptions) {
    let menuElement: HTMLDivElement | null = null;
    let pos = { x: 0, y: 0 };
    let menuDimensions = { h: 0, w: 0 };

    function createMenu() {
        menuElement = document.createElement('div');
        menuElement.className = 'context-menu';
        menuElement.style.cssText = `
            position: fixed;
            display: inline-flex;
            border: 1px #999 solid;
            width: 170px;
            background-color: #fff;
            border-radius: 10px;
            overflow: hidden;
            flex-direction: column;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;

        const ul = document.createElement('ul');
        ul.style.cssText = `
            margin: 6px;
            padding: 0;
            list-style: none;
        `;

        options.menuItems.forEach(item => {
            if (item.isDivider || item.name === 'hr') {
                const hr = document.createElement('hr');
                hr.style.cssText = `
                    border: none;
                    border-bottom: 1px solid #ccc;
                    margin: 5px 0px;
                `;
                ul.appendChild(hr);
            } else {
                const li = document.createElement('li');
                li.style.cssText = `
                    display: block;
                    list-style-type: none;
                `;

                const button = document.createElement('button');
                button.style.cssText = `
                    font-size: 1rem;
                    color: #222;
                    width: 100%;
                    height: 30px;
                    text-align: left;
                    border: 0;
                    background-color: #fff;
                    cursor: pointer;
                    padding: 0 10px;
                    font-family: inherit;
                `;

                if (item.icon) {
                    const icon = document.createElement('i');
                    icon.className = item.icon;
                    icon.style.cssText = `
                        padding: 0px 15px 0px 0px;
                    `;
                    button.appendChild(icon);
                }

                if (item.displayText) {
                    button.appendChild(document.createTextNode(item.displayText));
                }

                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = '#eee';
                    button.style.borderRadius = '5px';
                    button.style.color = '#000';
                });

                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = '#fff';
                    button.style.color = '#222';
                });

                if (item.onClick) {
                    button.addEventListener('click', () => {
                        item.onClick?.();
                        hideMenu();
                    });
                }

                li.appendChild(button);
                ul.appendChild(li);
            }
        });

        menuElement.appendChild(ul);
        document.body.appendChild(menuElement);

        // Get menu dimensions after adding to DOM
        menuDimensions = {
            h: menuElement.offsetHeight,
            w: menuElement.offsetWidth
        };
    }

    function showMenu(x: number, y: number) {
        if (!menuElement) {
            createMenu();
        }

        if (!menuElement) return;

        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;

        // Adjust position if menu would go off screen
        if (browserHeight - y < menuDimensions.h) {
            y = y - menuDimensions.h;
        }
        if (browserWidth - x < menuDimensions.w) {
            x = x - menuDimensions.w;
        }

        pos = { x, y };
        menuElement.style.top = `${pos.y}px`;
        menuElement.style.left = `${pos.x}px`;
        menuElement.style.display = 'inline-flex';

        options.onOpen?.();
    }

    function hideMenu() {
        if (menuElement) {
            menuElement.style.display = 'none';
        }
        options.onClose?.();
    }

    function handleContextMenu(e: MouseEvent) {
        e.preventDefault();
        showMenu(e.clientX, e.clientY);
    }

    function handleClick(e: MouseEvent) {
        if (menuElement && !menuElement.contains(e.target as Node)) {
            hideMenu();
        }
    }

    // Attach event listeners
    node.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return {
        update(newOptions: ContextMenuOptions) {
            options = newOptions;
            // Recreate menu with new options
            if (menuElement) {
                menuElement.remove();
                menuElement = null;
            }
        },
        destroy() {
            node.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
            if (menuElement) {
                menuElement.remove();
            }
        }
    };
}