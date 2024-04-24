
import type {resolver,cdn, preset} from './cdn'
export interface Options { 
  cdn: cdn| {name:string,resolver:resolver} 
  /**
   * @ 模块收集休眠时间 ms  默认值 100
   * @ 文件越多值越大 建议以 1000 为阶梯
   * @ 如果设为0 则引用全部模块 
   * @ cdn为esm时无效 
   */
  sleep: number,
  /** 
   * @true Vue.ref  默认值 
   * @false Vue["ref"]
   */
  dot:boolean
  /** 
   * @false  Vue.ref 默认值
   * @true window.Vue.ref  
   */
  window: boolean 
  modules: (preset | customModule)[]

  include:RegExp[],
  exclude:RegExp[],
  /**
   * @ package.json 路径
   */
  packageJsonPath:string 

}
  /**
   * @name 模块名称
   * @var  全局变量
   * @file 文件路径
   */
type customModule = { name: string, var: string,files:string[] } 