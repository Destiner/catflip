<template>
	<a
		:href="link"
		target="_blank"
	>
		<img
			:src="externalIcon"
			class="logo"
		>
	</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import externalIcon from '@/assets/externalLink.svg';

export default defineComponent({
	props: {
		link: {
			type: String,
			required: true,
		},
	},
	setup() {
		return {
			externalIcon,
		};
	},
});
</script>

<style scoped>
.logo {
	height: 16px;
}
</style>
