<template>
	<a
		:href="link"
		target="_blank"
	>
		<img
			:src="etherscanLogo"
			class="logo"
		>
	</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import etherscanLogo from '@/assets/etherscan.svg';

export default defineComponent({
	props: {
		link: {
			type: String,
			required: true,
		},
	},
	setup() {
		return {
			etherscanLogo,
		};
	},
});
</script>

<style scoped>
.logo {
	height: 16px;
}
</style>
