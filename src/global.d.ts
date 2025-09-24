declare module '*.svelte' {
    import { SvelteComponentTyped } from 'svelte';
    export default class Component<Props = any> extends SvelteComponentTyped<Props> { }
}