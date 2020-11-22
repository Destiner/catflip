import { ApolloClients } from '@vue/apollo-composable';
import { createApp, provide, h } from 'vue';

import clients from './apollo';
import { router, routerHistory } from './router';
import App from './App.vue';

const app = createApp({
	setup () {
		provide(ApolloClients, clients);
	},
	render: () => h(App),
});

app.use(router);

app.mount('#app');

export {
	routerHistory,
	router,
};
