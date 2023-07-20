import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.esm.browser.js'
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => {
  return new Promise((resolve, reject) => {
    // ...cargar componente desde el servidor
    resolve(Vue.component('name',{
      props:['name'],
      template:`
        <div class="container">
          <p>
            Hi! You've already spent
            on this site today. We strongly believe you should go back to whatever important task you need to get done 😊
          </p>
        </div>
      `
    }))
  })
})
