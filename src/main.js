import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

import Main from './pages/Main.vue';
import Voting from './pages/Voting.vue';
import Changelog from './pages/Changelog.vue';

Vue.use(VueRouter);

const routes = [
	{ path: '/', component: Main },
	{ path: '/changelog', component: Changelog },
	{ path: '/voting', component: Voting },
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
