const fs = require("fs");

const area = JSON.parse(fs.readFileSync("./lib/areav2.json", "utf-8")); 
const data = JSON.parse(fs.readFileSync("./lib/feev2.json", "utf-8"));
const calculateFee = (serviceCode, source, destination, mass, increasingRateWhenBelongToRemoteArea, isBelongToRemoteArea = false) => {
    let resultFee = 0;
    let sourceArea;
    let desArea;
	let transferService
	if (serviceCode === "CPN")
	{
		transferService = data.CPN;
	}
	else if (serviceCode === "HTT")
	{
		transferService = data.HTT;
	}

    for (const range in area ) 
    {	
        if (area[range].includes(source))
        {
            sourceArea = range;
        }
        if (area[range].includes(destination))
        {
          	desArea = range;
        }

    }

	if (source === destination) {
		for (const rangeMass of transferService.inner_province) {
			if (rangeMass.to_mass === "INFINITY") {
				resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
			}

			if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
				resultFee = rangeMass.fee;
				break;
			}
		}
	}

	else if (sourceArea === desArea) {
		for (const rangeMass of transferService.inner_area) {
			if (rangeMass.to_mass === "INFINITY") {
				resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
			}

			if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
				resultFee = rangeMass.fee;
				break;
			}
		}
	}

	else {
		let isSpecialCase = false;
		for (const location of transferService.special_case) {
			if (source === location.from_province && destination === location.to_province) {
				isSpecialCase = true;
				for (const rangeMass of location.detail_mass) {
					if (rangeMass.to_mass === "INFINITY") {
						resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre) * rangeMass.increment_per_kilogram;
					}
	
					if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
						resultFee = rangeMass.fee;
						break;
					}
				}
			}
		}

		if (!isSpecialCase) {

			for (const rangeMass of transferService.ordinary_case) {
				if (rangeMass.to_mass === "INFINITY") {
					resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre) * rangeMass.increment_per_kilogram;
				}

				if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
					resultFee = rangeMass.fee;
					break;
				}
			}
				
		}
	}

    return isBelongToRemoteArea ? resultFee * (1 + increasingRateWhenBelongToRemoteArea) : resultFee;
}

module.exports = {
	calculateFee,
}