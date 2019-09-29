import Vue from 'vue'
import Router from 'vue-router'
import Editor from '@/components/Editor'
import Paginator from '@/components/Paginator'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'Editor',
      component: Editor
    },
    {
      path: '/paginator',
      name: 'Paginator',
      component: Paginator
    }
  ]
})