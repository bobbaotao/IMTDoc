import Vue from 'vue'
import Router from 'vue-router'
import OpportunityList from '@/components/OpportunityList'
import CMMConfig from '@/components/CMMConfig'
import SalesDocConfig from '@/components/SalesDocConfig'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'OpportunityList',
        component: OpportunityList
    }, {
        path: '/CMMConfig/:oppID',
        name: 'CMMConfig',
        component: CMMConfig
    }, {
        path: '/SalesDocConfig/:oppID/:docID',
        name: 'SalesDocConfig',
        component: SalesDocConfig
    }]
})