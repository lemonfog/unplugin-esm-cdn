import { defineConfig } from 'vite'
// import Inspect from 'vite-plugin-inspect'
import vue from '@vitejs/plugin-vue'
import Unplugin from '../dist/vite'
import auto from 'unplugin-auto-import/vite'
import comp from 'unplugin-vue-components/vite'
export default defineConfig({
  plugins: [
    // Inspect(),
    vue(),
    auto({
      dts:'./src/types/auto.d.ts',
      imports:[
        'vue',
        'vue-router' 
      ]
    }),
    comp({ 
      dts:'./src/types/comp.d.ts'
    }),
    Unplugin({
      cdn:'npmmirror',
      modules:['vue','vue-router'], 
    }),
  ],
})
