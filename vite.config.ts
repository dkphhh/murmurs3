import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

console.log("Vite config - Runtime check:");
console.log("Bun available:", typeof Bun !== "undefined");
console.log("Process version:", process.version);

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],


});

