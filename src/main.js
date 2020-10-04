import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

import CompoundOverview from './pages/compound/Overview.vue';
import CompoundProposals from './pages/compound/Proposals.vue';
import MakerOverview from './pages/maker/Overview.vue';
import MakerChangelog from './pages/maker/Changelog.vue';
import MakerVoting from './pages/maker/Voting.vue';

Vue.use(VueRouter);

const routes = [
	{ path: '/', redirect: '/maker/' },
	{ path: '/changelog', redirect: '/maker/changelog' },
	{ path: '/compound/', component: CompoundOverview },
	{ path: '/compound/proposals', component: CompoundProposals },
	{ path: '/maker/', component: MakerOverview },
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
