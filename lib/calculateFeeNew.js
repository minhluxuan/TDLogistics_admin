const fs = require("fs");

const area = JSON.parse(fs.readFileSync("./lib/newarea.json", "utf-8")); 
const data = JSON.parse(fs.readFileSync("./lib/newfee.json", "utf-8"));
const calculteFee = (serviceCode, source, destination, mass, increasingRateWhenBelongToRemoteArea, isBelongToRemoteArea = false) => {
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
	else if (serviceCode === "TTK")
	{
		transferService = data.TTK;
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

	if (serviceCode === "TTK") {
		if (sourceArea === desArea)
		{
			for (const rangeMass of transferService.inner_area) {
				if (rangeMass.to_mass === "INFINITY") {
					resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.base_gram)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
				}
				if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
					if (rangeMass.hasOwnProperty("increment_per_kilogram"))
					{
						resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
					}
					else
					{
						resultFee = rangeMass.fee;
					}
					break;
				}
			}
		}
		else if (sourceArea === "NORTH_AREA" && desArea === "MIDDLE_AREA" || desArea === "NORTH_AREA" && sourceArea === "MIDDLE_AREA" 
        || sourceArea === "SOUTH_AREA" && desArea === "MIDDLE_AREA" || desArea === "SOUTH_AREA"  && sourceArea === "MIDDLE_AREA") {
			for (const rangeMass of transferService.outer_area) {
				if (rangeMass.to_mass === "INFINITY") {
					resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.base_gram)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
				}
				if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
					if (rangeMass.hasOwnProperty("increment_per_kilogram"))
					{
						resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
					}
					else
					{
						resultFee = rangeMass.fee;
					}
					break;
				}
			}
		}
		else
		{
			for (const rangeMass of transferService.seperate_area) {
				if (rangeMass.to_mass === "INFINITY") {
					resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.base_gram)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
				}
				if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
					if (rangeMass.hasOwnProperty("increment_per_kilogram"))
					{
						resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre)* rangeMass.increment_per_kilogram;
					}
					else
					{
						resultFee = rangeMass.fee;
					}
					break;
				}
			}
		}
	}

	else 
	{
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
	}
	

  return isBelongToRemoteArea ? resultFee * (1 + increasingRateWhenBelongToRemoteArea) : resultFee;
}

module.exports = {
	calculteFee,
}