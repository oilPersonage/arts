import {defineConfig} from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
	base: "/",
	build: {
		sourcemap: true,
		// Reduce bloat from legacy polyfills.
		target: "esnext",
		// Leave minification up to applications.
		minify: false,
	},
	plugins: [
		glsl(),
	]
})