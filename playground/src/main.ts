import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import {createRouter,createWebHistory} from 'vue-router'

const router = createRouter({
  history:createWebHistory(),
  routes:[{
    name:'index',
    path:'/',
    component:()=>import('./pages/index.vue')
  }]
})

createApp(App).use(router).mount('#app')
