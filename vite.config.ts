import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from "node:url"
import { resolve, extname } from "node:path"
import fg from 'fast-glob'

const root = fileURLToPath(new URL('.', import.meta.url))

const htmlFiles = fg.sync('pages/**/*.html', { cwd: root })

const input = Object.fromEntries(
  htmlFiles.map((file) => {
    const name = file.slice(0, -extname(file).length)
    return [name, resolve(root, file)]
  })
)

// optionally include main index
input.main = resolve(root, 'index.html')

export default defineConfig({
  build: {
    rollupOptions: {
      input
    }
  },
  plugins: [tailwindcss()],
})