import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';

import App from './App.vue';

import CompoundOverview from './pages/compound/Overview.vue';
import CompoundProposals from './pages/compound/Proposals.vue';
import CompoundAccountList from './pages/compound/AccountList.vue';
import MakerOverview from './pages/maker/Overview.vue';
import MakerChangelog from './pages/maker/Changelog.vue';
import MakerVoting from './pages/maker/Voting.vue';

const routes = [
	{ path: '/', redirect: '/maker/' },
	{ path: '/changelog', redirect: '/maker/changelog' },
	{ path: '/compound/', component: CompoundOverview },
	{ path: '/compound/proposals', component: CompoundProposals },
	{ path: '/compound/accounts', component: CompoundAccountList },
	{ path: '/maker/', component: MakerOverview },
	{ path: '/maker/changelog', component: MakerChangelog },
	{ path: '/maker/voting', component: MakerVoting },
];

const routerHistory = createWebHistory();
const router = createRouter({
	history: routerHistory,
	routes,
});

const app = createApp(App);

app.use(router);

app.mount('#app');

export {
	routerHistory,
	router,
};
