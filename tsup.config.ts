import type { Options } from 'tsup'

export default <Options>{
  entryPoints: [
    'src/*.ts',
    // 'src/index.ts',
    // 'src/vite.ts'
  ],
  clean: true,
  format: ['cjs', 'esm'], 
  dts: true,
  // onSuccess: 'npm run build:fix',
}
