<template>
	<div class="loading">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="50"
			height="50"
			viewBox="0 0 50 50"
		>
			<path
				d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z"
			/>
		</svg>
	</div>
</template>

<style scoped>
.loading {
	width: 100%;
	margin: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
}

svg {
	vertical-align: middle;
	width: 20px;
	height: 20px;
	animation: rotation 1s cubic-bezier(0.79, 0.14, 0.15, 0.86) infinite;
}

path {
	fill: black;
}

@keyframes rotation {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
