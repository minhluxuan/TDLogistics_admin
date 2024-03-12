const fs = require("fs");

const area = JSON.parse(fs.readFileSync("./lib/area.json", "utf-8")); 
const data = JSON.parse(fs.readFileSync("./lib/fee.json", "utf-8"));

const calculteFee = (serviceCode, source, destination, distance, mass, increasingRateWhenBelongToRemoteArea, optionService = null, isBelongToRemoteArea = false) => {
    const transferService = data.CPN;
    let resultFee = 0;
    let areaService = area.CPN;
    if (serviceCode === "CPN") {
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
        else {
            for (const location of transferService.outer_province.special_case) {
                if (source === location.from_province && destination === location.to_province) {
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

            for (const rangeDistance of transferService.outer_province.ordinary_case) {
                if (rangeDistance.to_distance === "INFINITY") {
                    for (const rangeMass of rangeDistance.detail_mass) {
                        if (rangeMass.to_mass === "INFINITY") {
                            resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre) * rangeMass.increment_per_kilogram;
                        }
        
                        if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
                            resultFee = rangeMass.fee;
                            break;
                        }
                    }
                }

                if (distance >= rangeDistance.from_distance && distance < rangeDistance.to_distance) {
                    for (const rangeMass of rangeDistance.detail_mass) {
                        if (rangeMass.to_mass === "INFINITY") {
                            resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre) * rangeMass.increment_per_kilogram;
                        }
        
                        if (mass > rangeMass.from_mass && mass <= rangeMass.to_mass) {
                            resultFee = rangeMass.fee;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        //console.log(transferService[optionService]);
        if (optionService === "T60")
        {
            if (areaService[optionService].includes(destination) && areaService[optionService].includes(source) && mass >= transferService[optionService].condition_mass) 
            {
                resultFee = resultFee * (1 - transferService[optionService].feeRate/100) ;
            }
        }
    }

    else if (serviceCode === "TTK") {
        let sourceArea;
        let desArea;
        const areaService = area.TTK
        for (const range in areaService ) 
        {
            if (areaService[range].includes(source))
            {
                sourceArea = range;
            }
            if (areaService[range].includes(destination))
            {
                desArea = range;
            }
        }
        const transferService = data.TTK;
        
        if (sourceArea === desArea) {
            for (const rangeMass of transferService["INNER_AREA"]) {
                if (rangeMass.hasOwnProperty("increme_per_kilogram")) {
                    let increamentfee;
                    // let incremass = Math.ceil((mass - 2000)/1000);
                    for (const rangeMassIncre of rangeMass.increme_per_kilogram.increme_fee)
                    {
                        let incremass = mass - rangeMassIncre.from_mass;
                        if (incremass >= rangeMassIncre.from_mass && incremass < rangeMassIncre.to_mass) {
                            increamentfee =Math.ceil(incremass/transferService.block_step_incre)  * rangeMassIncre.fee;
                            break;
                        }

                        if (rangeMassIncre.to_mass === "INFINITY") {
                            increamentfee = incremass * rangeMassIncre.fee;
                        }
                        
                    }
                    resultFee = rangeMass.increme_per_kilogram.base_fee + increamentfee ;
                }

                if (mass >= rangeMass.from_mass && mass < rangeMass.to_mass) {
                    resultFee = rangeMass.fee;
                    break;
                }
            }
        }

        else if (sourceArea === "NORTH_AREA" && desArea === "MIDDLE_AREA" || desArea === "NORTH_AREA" && sourceArea === "MIDDLE_AREA" 
        || sourceArea === "SOUTH_AREA" && desArea === "MIDDLE_AREA" || desArea === "SOUTH_AREA"  && sourceArea === "MIDDLE_AREA"){
            for (const rangeMass of transferService["OUTER_AREA"]) {

                if (rangeMass.hasOwnProperty("increme_per_kilogram")) {
                    let increamentfee;
                    for (const rangeMassIncre of rangeMass.increme_per_kilogram.increme_fee)
                    {
                        let incremass =  mass - rangeMassIncre.from_mass;
                        if (incremass >= rangeMassIncre.from_mass && incremass < rangeMassIncre.to_mass) {
                            increamentfee =Math.ceil(incremass/transferService.block_step_incre)  * rangeMassIncre.fee;
                            break;
                        }

                        if (rangeMassIncre.to_mass === "INFINITY") {
                            increamentfee = incremass * rangeMassIncre.fee;
                        }
                    }
                    resultFee = rangeMass.increme_per_kilogram.base_fee + increamentfee ;
                }

                if (mass >= rangeMass.from_mass && mass < rangeMass.to_mass) {
                    resultFee = rangeMass.fee;
                    break;
                }
            }
        }
        else {
            for (const rangeMass of transferService["SEPERATE_AREA"]) {
                if (rangeMass.hasOwnProperty("increme_per_kilogram")) {
                    let increamentfee;
                    for (const rangeMassIncre of rangeMass.increme_per_kilogram.increme_fee)
                    {
                        let incremass = mass - rangeMassIncre.from_mass;
                        if (incremass >= rangeMassIncre.from_mass && incremass < rangeMassIncre.to_mass) {
                            increamentfee =Math.ceil(incremass/transferService.block_step_incre)  * rangeMassIncre.fee;
                            break;
                        }

                        if (rangeMassIncre.to_mass === "INFINITY") {
                            increamentfee = incremass * rangeMassIncre.fee;
                        }
                    }
                    resultFee = rangeMass.increme_per_kilogram.base_fee + increamentfee ;
                }

                if (mass >= rangeMass.from_mass && mass < rangeMass.to_mass) {
                    resultFee = rangeMass.fee;
                    break;
                }
            }
        }
    }

    if (serviceCode === "HTT") {
        let sourceArea ;
        let desArea ;
        const areService = area.HTT;
        for (const range in areService) 
        {   
            if (areService[range].includes(destination) )
            {
                desArea = range;
                break;
            }
        }

        for (const range in areService)
        {
            if (areService[range].includes(source) )
            {
                sourceArea = range;
                break;
            }
        }
        
        if (sourceArea === undefined)
        {
            sourceArea = "FLIGHTSTRAIGHT";
        }

        if (desArea === undefined)
        {
            desArea = "FLIGHTSTRAIGHT";
        }

        const transferService = data.HTT;
        for (const rangeMass of transferService[sourceArea][desArea]) 
        {
            if (desArea === "FLIGHTSTRAIGHT" && sourceArea === "FLIGHTSTRAIGHT")
            {
                if (rangeMass.to_distance === "INFINITY")
                {
                    for (const rangeMassHT of rangeMass.detail_mass)
                    {
                        if (rangeMassHT.to_mass === "INFINITY") {
                            resultFee = rangeMassHT.base_fee + Math.ceil((mass - rangeMassHT.from_mass)/transferService.block_step_incre) * rangeMassHT.increment_per_kilogram;
                        }
            
                        if (mass >= rangeMassHT.from_mass && mass < rangeMassHT.to_mass) {
                            resultFee = rangeMassHT.fee;
                            break;
                        }
                    }
                }
                else if (distance >= rangeMass.from_distance && distance < rangeMass.to_distance)
                {
                    for (const rangeMassHT of rangeMass.detail_mass)
                    {
                        console.log(rangeMassHT);
                        if (rangeMassHT.to_mass === "INFINITY") {
                            resultFee = rangeMassHT.base_fee + Math.ceil((mass - rangeMassHT.from_mass)/transferService.block_step_incre) * rangeMass.increment_per_kilogram;
                        }
            
                        if (mass >= rangeMassHT.from_mass && mass < rangeMassHT.to_mass) {
                            resultFee = rangeMassHT.fee;
                            break;
                        }
                    }
                    break;
                }
            }
            else 
            {
                if (rangeMass.to_mass === "INFINITY") {
                    resultFee = rangeMass.base_fee + Math.ceil((mass - rangeMass.from_mass)/transferService.block_step_incre) * rangeMass.increment_per_kilogram;
                }
    
                if (mass >= rangeMass.from_mass && mass < rangeMass.to_mass) {
                    resultFee = rangeMass.fee;
                    break;
                }
            }

        }
    }
    return isBelongToRemoteArea ? resultFee * (1 + increasingRateWhenBelongToRemoteArea) : resultFee;
}

module.exports = {
    calculteFee
}

//console.log (calculteFee("CPN","Hà Nội", "Quảng Ninh", 150, 2006, 0, "T60" ,0));