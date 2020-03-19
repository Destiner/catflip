import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

import Main from './pages/Main.vue';

Vue.use(VueRouter);

const routes = [
	{ path: '/', component: Main },
];

const router = new VueRouter({
	mode: 'history',
	routes,
});

new Vue({
	router,
	el: '#app',
	render: h => h(App),
});
