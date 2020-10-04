import BigNumber from 'bignumber.js';

const TEN = new BigNumber(10);
const WAD = TEN.pow(18);
const RAY = TEN.pow(27);

class Converter {
	static fromWad(n) {
		const number = new BigNumber(n);
		const convertedNumber = number.div(WAD).toNumber();
		return convertedNumber;
	}

	static fromRay(n) {
		const number = new BigNumber(n);
		const convertedNumber = number.div(RAY).toNumber();
		return convertedNumber;
	}

	static fromBlockCount(n) {
		return n * 15;
	}
}

export default Converter;
