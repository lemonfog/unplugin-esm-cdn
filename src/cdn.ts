export const cdnSrc = {
  'esm': 'https://esm.sh',
  // 'skypack': 'https://cdn.skypack.dev',
  'fastly': 'https://fastly.jsdelivr.net/npm',
  'jsdelivr': 'https://cdn.jsdelivr.net/npm',
  'npmmirror': 'https://registry.npmmirror.com',
  'bootcdn': 'https://cdn.bootcdn.net/ajax/libs',
  'cloudflare': 'https://cdnjs.cloudflare.com/ajax/libs',
  'unpkg': 'https://unpkg.com',
}

export const presets = {
  'vue': {
    var: 'Vue',
    files: ['dist/vue.runtime.global.prod.js']
  },
  'vue-router': {
    var: 'VueRouter',
    files: ['dist/vue-router.global.prod.js']
  }
}

export type cdn = keyof typeof cdnSrc
export type preset = keyof typeof presets
export type resolver = (name: string, version: string, file?: string) => string

export const defineCdn = (name: string, resolver: resolver) => ({ name, resolver })

export const resolvers: Record<cdn, resolver> = {
  'esm': (name, version) => `${cdnSrc.esm}/${name}@${version}`,
  // vue 3.4.23 构建失败
  // 'skypack': (name, version) => `${cdnSrc.skypack}/${name}@${version}`,
  'fastly': (name, version, file) => `${cdnSrc.fastly}/${name}@${version}/${file}`,
  'jsdelivr': (name, version, file) => `${cdnSrc.jsdelivr}/${name}@${version}/${file}`,
  'npmmirror': (name, version, file) => `${cdnSrc.npmmirror}/${name}/${version}/files/${file}`,
  'unpkg': (name, version, file) => `${cdnSrc.unpkg}/${name}@${version}/${file}`,
  // 要去掉dist
  'bootcdn': (name, version, file) => `${cdnSrc.bootcdn}/${name}/${version}/${file?.replace('dist/','')}`,
  'cloudflare': (name, version, file) => `${cdnSrc.cloudflare}/${name}/${version}/${file?.replace('dist/','')}`
}

