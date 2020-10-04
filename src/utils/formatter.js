class Formatter {
	static formatFee(fee) {
		const apy = fee ** (60*60*24*365) - 1;
		const apyPercentage = apy * 100;
		return `${apyPercentage.toFixed(2)}%`;
	}

	static formatRatio(ratio) {
		const percentage = 100 * ratio;
		return `${percentage.toFixed(0)}%`;
	}

	static formatRate(rate) {
		const percentage = rate == 0
			? 100 * rate
			: 100 * (rate - 1);
		return `${percentage.toFixed(2)}%`;
	}

	static formatDuration(duration) {
		const mins = duration / 60;
		if (duration % (60 * 60) != 0) {
			return `${mins} mins`;
		}
		const hours = mins / 60;
		if (duration % (24 * 60 * 60) != 0) {
			return `${hours} hrs`;
		}
		const days = hours / 24;
		return `${days} days`;
	}

	static formatAmount(amount, decimals=0) {
		const amountNumber = new Number(amount.toString());
		const options = {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		};
		return amountNumber.toLocaleString(undefined, options);
	}

	static formatAddress(address, length=8) {
		if (!address) {
			return '';
		}
		const ellipsizedAddress = `${address.substr(0, 2 + length / 2)}…${address.substr(42 - length / 2)}`;
		return ellipsizedAddress;
	}

	static formatMultiplier(amount, decimals=2) {
		if (amount >= 1e6) {
			const shortAmount = amount/1e6;
			return `${shortAmount.toFixed(decimals)}M`;
		}
		if (amount >= 1e3) {
			const shortAmount = amount/1e3;
			return `${shortAmount.toFixed(decimals)}K`;
		}
		return amount.toFixed(decimals);
	}
}

export default Formatter;
