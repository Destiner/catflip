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

<script>
import etherscanLogo from '../../public/etherscan.svg';

export default {
	props: {
		link: {
			type: String,
			required: true,
		},
	},
	computed: {
		etherscanLogo() {
			return etherscanLogo;
		},
	},
};
</script>

<style scoped>
.logo {
	height: 16px;
}
</style>
