export interface ITooltipData {
    title: string;
    body: string;
};

export function tooltip(element: HTMLElement, data: ITooltipData) {
    let div: HTMLDivElement | null = null;
    let title: string = data.title ?? new String;

    function mouseOver(event: MouseEvent) {
        if (div) return;

        div = document.createElement('div');
        div.dataset.svelteTooltip = "true";
        div.innerHTML = `<b>${title}</b><br/><hr style="color:oklch(55.2% 0.016 285.938);"/><span style="max-width:300px;">${data.body}</span>`;
        Object.assign(div.style, {
            border: "1px solid oklch(44.2% 0.017 285.786)",
            boxShadow: "1px 1px 1px oklch(44.2% 0.017 285.786)",
            background: "oklch(37% 0.013 285.805)",
            borderRadius: "4px",
            padding: "2px 4px",
            color: "white",
            position: "absolute",
            left: `${event.pageX + 5}px`,
            top: `${event.pageY + 5}px`,
            pointerEvents: "none",
            zIndex: "9999"
        });
        document.body.appendChild(div);
    }

    function mouseMove(event: MouseEvent) {
        if (div) {
            div.style.left = `${event.pageX + 15}px`;
            div.style.top = `${event.pageY}px`;
        }
    }

    function mouseLeave() {
        if (div) {
            div.remove();
            div = null;
        }
        //element.setAttribute('title', title);

        document.querySelectorAll("[data-svelte-tooltip]").forEach(el => el.remove());
    }

    element.addEventListener("mouseover", mouseOver);
    element.addEventListener("mousemove", mouseMove);
    element.addEventListener("mouseleave", mouseLeave);

    return {
        destroy() {
            element.removeEventListener("mouseover", mouseOver);
            element.removeEventListener("mousemove", mouseMove);
            element.removeEventListener("mouseleave", mouseLeave);
            if (div) {
                div.remove();
                div = null;
            }
        }
    };
}
