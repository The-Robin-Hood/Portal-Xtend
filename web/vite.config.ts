import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react"
import viteCompression from "vite-plugin-compression"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
		viteCompression({
			filter: /\.(html|js|css)$/, 
			deleteOriginFile: true,
		}),
	],
	server: {
		host: true,
	},
	build: {
		chunkSizeWarningLimit: 1000,
		outDir: "build",
		rollupOptions: {
			output: {
				assetFileNames: "css/[name].[ext]",
				chunkFileNames: "js/[name].js",
				entryFileNames: "js/[name].js",
			},
		},
	},
})
