<script lang="ts">
	import { formatNumber } from '$lib/utils/general';
	import { Sparkle } from '@lucide/svelte';

	let {
		value,
		duration = 1200, // total animation duration
		xOrigin = 0,
		yOrigin = 0,
		crit = false,
		lingerDuration = 200, // new: milliseconds to stay fully opaque
		onComplete
	}: {
		value: number;
		duration?: number;
		xOrigin?: number;
		yOrigin?: number;
		crit?: boolean;
		lingerDuration?: number;
		onComplete?: () => void;
	} = $props();

	let x = $state(xOrigin);
	let y = $state(yOrigin);
	let opacity = $state(1);
	let visible = $state(true);

	let start: number | undefined;

	const horizontalDrift = (Math.random() - 0.5) * 60;
	const initialVelocity = -(80 + Math.random() * 40);
	const gravity = 220 + Math.random() * 60;

	function frame(time: number) {
		if (!start) start = time;
		const elapsed = time - start;
		const t = elapsed / 1000;

		// Parabolic movement
		y = yOrigin + initialVelocity * t + 0.5 * gravity * t * t;
		x = xOrigin + horizontalDrift * t;

		// Fade after lingerDuration
		if (elapsed < lingerDuration) {
			opacity = 1;
		} else {
			const fadeElapsed = elapsed - lingerDuration;
			opacity = 1 - fadeElapsed / (duration - lingerDuration);
		}

		if (opacity <= 0) {
			opacity = 0;
			visible = false;
			onComplete?.();
			return;
		}

		requestAnimationFrame(frame);
	}

	requestAnimationFrame(frame);
</script>

<div
	class="will-change-opacity pointer-events-none absolute top-0 left-0 will-change-transform"
	style="
		transform: translate({x}px, {y}px);
		opacity: {opacity};
		visibility: {visible ? 'visible' : 'hidden'};
	"
>
	<span
		class="text-xl font-bold drop-shadow-lg select-none {crit
			? 'text-gradient text-white'
			: 'text-red-500'} text-stroke-2 text-stroke-zinc-800"
		style="-webkit-user-select: none; user-select: none;"
	>
		{#if crit}
			<div class="flex items-center justify-center gap-1">
				<Sparkle size="14" />
				{formatNumber(value, 'long')}
				<Sparkle size="14" />
			</div>
		{:else}
			{formatNumber(value, 'long')}
		{/if}
	</span>
</div>

<style>
	.text-gradient {
		color: white;
		background-image: linear-gradient(45deg, #f22c2c 0%, #f79131 25%, #ecd74b 50%, #89c6f0 73%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		display: inline-block;
	}
</style>
