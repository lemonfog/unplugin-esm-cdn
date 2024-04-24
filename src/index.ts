import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { Options } from './types'
import { readFile } from 'node:fs/promises'
import pc from 'picocolors'
import { createFilter } from '@rollup/pluginutils';
import { resolvers, presets } from './cdn'



const defaultOptions = {
  cdn: 'npmmirror',
  sleep: 100,
  dot: true,
  include: [/\.(vue|js|ts|jsx|tsx|mjs)$/],
  window: false,
  packageJsonPath: './package.json'
} as Options

const name = 'unplugin-esm-cdn'
const info = (input: string) => console.log(pc.green(`
${name}: ${input}`))


type cdnModule = {
  version: string
  files: string[]
  var: string
  exports: Set<string>
}

export const unpluginFactory: UnpluginFactory<Partial<Options> | undefined> = options => {
  const { cdn, sleep, dot, include, exclude, window } = options ? { ...defaultOptions, ...options } : defaultOptions
  const isCdnModule = cdn=='esm'  
  let regexp: Record<'esmFile' | 'matchImport' | 'matchName', RegExp>
  let moduleArr: string[] = []
  const fliter = createFilter(include, exclude)

  const map = {} as Record<string, cdnModule>
  return [{
    name: 'unplugin-esm-cdn-html',
    enforce: 'pre',
    apply: 'build',
    async transform(code, id) {
      if (isCdnModule) return
      if (!(/index.html/.test(id))) return
      const str = moduleArr.reduce((prev, curr) => {
        const { version, files } = map[curr]
        let resolver
        if (typeof cdn == 'string') {
          resolver = resolvers[cdn]
        } else resolver = cdn.resolver
        return prev + files.reduce((p, c) => `${p}  <script src="${resolver(curr, version, c)}"></script>\n`, '')
      }, '')
      code = code.replace(/<head>(.*)<\/head>/s, '<head>' + '$1' + str + '</head>')
      return code
    },
  },
  {
    name,
    enforce: 'post',
    apply: 'build',
    async transform(code, id) {
      if (moduleArr.length == 0) return

      // const m = id.match(/node_modules\/(vue|vue-router|)\/.*\.m?js$/)
      const m = id.match(regexp.esmFile)
      if (!m) {
        // if (/^src.*\.(vue|js|ts|jsx|tsx|mjs).*/.test(path)) {
        if (isCdnModule|| !fliter(id)) return
        // const m1 = code.match(/import\s+(.*)\s+from ('|")(vue|vue-router)('|")/gs)
        const m1 = code.match(regexp.matchImport)
        if (!m1) return
        const ims = m1[0].split('import ')
        for (const i of ims) {
          if (!i) continue
          // const m2 = i.match(/(.*)\s+from ('|")(vue|vue-router)('|")/s)
          const m2 = i.match(regexp.matchName)
          if (!m2) continue
          const module = m2[3]
          const a = m2[1].split('{')
          if (a[0]) map[module].exports.add('_default_')
          if (!a[1]) continue
          const vars = a[1].replace('}', '').split(',')
          for (const n of vars) {
            const a = n.split(' as ')[0].trim()
            map[module].exports.add(a)
          }
        }
        return
      }

      if (isCdnModule) {
        const s = `${resolvers[cdn](m[1],map[m[1]].version)}`
        console.log(s)
        return `export * from "${s}"` 
      }
      const Var = map[m[1]].var
      const str = `${window ? dot ? 'window.' : 'window["' : ''}${Var}${window ? dot ? '.' : '"]["' : dot ? '.' : '["'}$1${dot ? '' : '"]'}`
      let arr: string[]
      if (sleep > 0) {
        await new Promise(resolve => setTimeout(resolve, sleep))
        arr = Array.from(map[m[1]].exports)
      }
      else arr = Object.keys(await import(m[1]))

      const index = arr.indexOf('default')

      if (index != -1) {
        arr.splice(index, 1)
      }
      const c = arr.reduce((prev, curr) => `${prev}export const ${curr} = ${str.replace('$1', curr)};`, index == -1 ? '' : `export default ${Var};`)
      return c
    },
    async buildStart() {
      const { modules, packageJsonPath } = options ? { ...defaultOptions, ...options } : defaultOptions
      const str = await readFile(packageJsonPath, 'utf8')
      const packageJson = JSON.parse(str)
      const deps = packageJson.dependencies
      const toUpper = ($0: string, $1: string) => $1.toUpperCase()

      modules.forEach(i => {
        if (typeof i == 'string') {
          if (presets[i] == undefined) return info(`${i} 预设未找到`)
          if (deps[i] == undefined) return info(`${i} 不在 dependencies 中 无法获取 version`)
          map[i] = {
            version: deps[i].replace('^', ''),
            exports: new Set(),
            ...presets[i]
          }
          return
        }
        if (deps[i.name] == undefined) return info(`${i} 不在 dependencies 中 无法获取 version`)
        if (i.var == undefined) i.var = name.replace(/(\w)/, toUpper).replace(/-(\w)/, toUpper)
        map[i.name] = {
          version: deps[i.name].replace('^', ''),
          exports: new Set(),
          var: i.var,
          files: i.files
        }
      })
      moduleArr = Object.keys(map)
      const join = modules.join('|')
      if (moduleArr.length) {
        regexp = {
          'esmFile': new RegExp(`node_modules\/(${join})\/.*\.m?js$`),
          'matchImport': new RegExp(`import\\s+(.*)\\s+from\\s+('|")(${join})('|")`, 'gs'),
          'matchName': new RegExp(`(.*)\\s+from\\s+('|")(${join})('|")`, 's')
        }
      }
    },
  }]
}




export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
