import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

import CompoundMain from './pages/compound/Main.vue';
import CompoundProposals from './pages/compound/Proposals.vue';
import MakerMain from './pages/maker/Main.vue';
import MakerChangelog from './pages/maker/Changelog.vue';
import MakerVoting from './pages/maker/Voting.vue';

Vue.use(VueRouter);

const routes = [
	{ path: '/', redirect: '/maker/' },
	{ path: '/changelog', redirect: '/maker/changelog' },
	{ path: '/compound/', component: CompoundMain },
	{ path: '/compound/proposals', component: CompoundProposals },
	{ path: '/maker/', component: MakerMain },
	{ path: '/maker/changelog', component: MakerChangelog },
	{ path: '/maker/voting', component: MakerVoting },
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
