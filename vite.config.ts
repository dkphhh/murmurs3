import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

console.log("Vite config - Runtime check:");
console.log("Bun available:", typeof Bun !== "undefined");
console.log("Process version:", process.version);

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],


});

// TODO：2.0 目标：完全参照 bluesky 重置
// TODO：增加 blog 板块，和murmurs 合到一起
// TODO:增加 murmurs 独立页？