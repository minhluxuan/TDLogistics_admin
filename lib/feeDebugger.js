const feeJson = require("./testfee.json");
const CPN = feeJson.CPN;

const moduleSubtitle = {
    "CPN": "Chuyển phát nhanh",
    "block_step_incre": "Khối gia tăng",
    "inner_province": "Tỉnh nội vùng",
    "outer_province": "Tỉnh ngoại vùng",
    "T60": "Hỏa tốc 24h",
    "from_mass": "Khối lượng khởi điểm",
    "to_mass": "Khối lượng kết thúc",
    "from_distance": "Khoảng cách khởi điểm",
    "to_distance": "Khoảng cách kết thúc",
    "fee": "Phí",
    "base_fee": "Phí cơ bản",
    "increment_per_kilogram": "Mức tăng theo kí lô gram",
    "ordinary_case": "Trường hợp thông thường",
    "special_case": "Trường hợp đặc biệt",
    "detail_mass": "Chi tiết khối lượng",
    "from_province": "Tỉnh đi",
    "to_province": "Tỉnh đến",
    "condition_mass": "Giới hạn khối lượng",
    "feeRate": "Mức phí"
}

const missingAttributesError = (errorArray, moduleArray) => {
    const translatedErrorArray = errorArray.map(errors => moduleSubtitle[errors]);
    const translatedModulesArray = moduleArray.map(modules => moduleSubtitle[modules]);
    return new Object({
        errorVariable: errorArray,
        errorType: "Missing Module",
        errorMessage: `Không tìm thấy ${translatedErrorArray.join(", ")} trong module ${translatedModulesArray.join(" / ")}`
    });
}

const positiveViolationError = (errorArray, moduleArray) => {
    const translatedErrorArray = errorArray.map(errors => moduleSubtitle[errors]);
    const translatedModulesArray = moduleArray.map(modules => moduleSubtitle[modules]);
    return new Object({
        errorVariable: errorArray,
        errorType: "Positive Violation",
        errorMessage: `Giá trị của ${translatedErrorArray.join(", ")} không đượch âm trong module ${translatedModulesArray.join(" / ")}`
    });
}
 
const boundedViolatationError = (errorArray, moduleArray) => {
    const translatedErrorArray = errorArray.map(errors => moduleSubtitle[errors]);
    const translatedModulesArray = moduleArray.map(modules => moduleSubtitle[modules]);
    return new Object({
        errorVariable: errorArray,
        errorType: "Bouded Violation",
        errorMessage: `Giá trị của ${translatedErrorArray.join(", ")} vi phạm giới hạn biên trong module ${translatedModulesArray.join(" / ")}`
    });
}

const massBaseDebugging = (info, moduleArray) => {
    let pointerMass = -1;
    for (let i = 0; i < info.length; i++) {
        if(!("from_mass" in info[i])) return missingAttributesError(["from_mass"], moduleArray);
        if(!("to_mass" in info[i])) return missingAttributesError(["to_mass"], moduleArray);
        if(i === info.length - 1) {
            if(!("base_fee" in info[i])) return missingAttributesError(["base_fee"], moduleArray);
            if(!("increment_per_kilogram" in info[i])) return missingAttributesError(["baincrement_per_kilogramse_fee"], moduleArray);
            
            if(info[i].base_fee < 0) return positiveViolationError(["base_fee"], moduleArray);
            if(info[i].increment_per_kilogram < 0) return positiveViolationError(["increment_per_kilogram"], moduleArray);
            
            if(pointerMass !== info[i].from_mass) return boundedViolatationError(["from_mass", "to_mass"], moduleArray);
            if(pointerMass <= 0) return positiveViolationError(["from_mass", "to_mass"], moduleArray);
            
            if(info[i].to_mass !== "INFINITY") return boundedViolatationError(["to_mass"], moduleArray);
        }
        else {
            if(!("fee" in info[i]))  return missingAttributesError(["fee"], moduleArray);
            if(info[i].fee < 0) return positiveViolationError(["fee"], moduleArray);
            if(info[i].to_mass <= info[i].from_mass) return boundedViolatationError(["from_mass", "to_mass"], moduleArray);
            if(pointerMass === -1) {
                if(info[i].from_mass !== 0) return boundedViolatationError(["from_mass"], moduleArray);            
            }
            else {
                if(pointerMass !== info[i].from_mass) return boundedViolatationError(["from_mass", "to_mass"], moduleArray);                      
            }
            pointerMass = info[i].to_mass;

        }
    }
    return new Object({
        errorVariable: null,
        errorType: null,
        errorMessage: "Không tìm thấy lỗi"
    });
}

const distanceBaseDebugging = (info, moduleArray) => {
    let pointerDistance = -1;
    for(let i = 0; i < info.length; i++) {
        if(!("from_distance" in info[i])) return missingAttributesError(["from_distance"], moduleArray);
        if(!("to_distance") in info[i]) return missingAttributesError(["to_distance"], moduleArray);
        if(!("detail_mass" in info[i])) return missingAttributesError(["detail_mass"], moduleArray);

        if(i === info.length - 1) {
            if(pointerDistance !== info[i].from_distance) return boundedViolatationError(["from_distance", "to_distance"], moduleArray);
            if(pointerDistance <= 0) return positiveViolationError(["from_distance", "to_distance"], moduleArray);
            if(info[i].to_distance !== "INFINITY") return boundedViolatationError(["to_distance"], moduleArray); 
        }
        else {
            if(info[i].to_distance <= info[i].from_distance) return boundedViolatationError(["from_distance", "to_distance"], moduleArray);
            if(pointerDistance === -1) {
                if(info[i].from_distance !== 0) return boundedViolatationError(["from_distance"], moduleArray);
            }
            else {
                if(pointerDistance !== info[i].from_distance) return boundedViolatationError(["from_distance", "to_distance"], moduleArray);
            }
            pointerDistance = info[i].to_distance;
        }
        //check detail_mass
        const checkDetailMass = massBaseDebugging(info[i].detail_mass, [...moduleArray, "detail_mass"]);
        if(checkDetailMass.errorVariable) return checkDetailMass;
    }
    return new Object({
        errorVariable: null,
        errorType: null,
        errorMessage: "Không tìm thấy lỗi"
    });
}

const CPNdebugger = () => {

    if(!CPN.block_step_incre || !CPN.inner_province || !CPN.outer_province || !CPN.T60) {
        let missingArray = new Array();
        if(!("block_step_incre" in CPN)) missingArray.push("block_step_incre");
        if(!("inner_province" in CPN)) missingArray.push("inner_province");
        if(!("outer_province" in CPN)) missingArray.push("outer_province");
        if(!("T60" in CPN)) missingArray.push("T60");
        return missingAttributesError(missingArray, ["CPN"]);
    }

    if(CPN.block_step_incre < 0)  return positiveViolationError(["block_step_incre"], ["CPN", "block_step_incre"]);
           
    //check CPN.inner_province
    const innerProvinceChecking = massBaseDebugging(CPN.inner_province, ["CPN", "inner_province"]);
    if(innerProvinceChecking.errorVariable) return innerProvinceChecking;

    // check CPN.outer_province
    if(!("ordinary_case" in CPN.outer_province)) return missingAttributesError("ordinary_case", ["CPN", "outer_province", "ordinary_case"]);
    const outerProvinceCheckingOrdinaryCase = distanceBaseDebugging(CPN.outer_province.ordinary_case, ["CPN", "outer_province", "ordinary_case"]);
    if(outerProvinceCheckingOrdinaryCase.errorVariable) return outerProvinceCheckingOrdinaryCase;

    if("special_case" in CPN.outer_province) {
        const specialCase = CPN.outer_province.special_case;
        const moduleArray = ["CPN", "outer_province", "special_case"];
        for(let i = 0; i < specialCase.length; i++) {
            if(!("from_province" in specialCase[i])) return missingAttributesError(["from_province"], moduleArray);
            if(!("to_province" in specialCase[i])) return missingAttributesError(["to_province"], moduleArray);
            if(!("detail_mass") in specialCase[i]) return missingAttributesError(["detail_mass"], moduleArray);
            const detailMassCheck = massBaseDebugging(specialCase[i].detail_mass, [...moduleArray, "detail_mass"]);
            if(detailMassCheck.errorVariable) return new Object({
                errorVariable: detailMassCheck.errorVariable,
                errorType: detailMassCheck.errorType,
                errorMessage: detailMassCheck.errorMessage,
                errorLocation: `Lỗi xuất hiện ở cài đặt ${moduleSubtitle["from_province"]}: ${specialCase[i].from_province} 
                                    và ${moduleSubtitle["to_province"]}: ${specialCase[i].to_province}`
            });
        }
    }


    //check for T60
    if(!("condition_mass" in CPN.T60)) return missingAttributesError(["condition_mass"], ["CPN", "T60", "condition_mass"]);
    if(!("feeRate" in CPN.T60)) return missingAttributesError(["feeRate"], ["CPN", "T60", "feeRate"]);

    if(CPN.T60.condition_mass < 0) return positiveViolationError(["condition_mass"], ["CPN", "T60", "condition_mass"]);
    if(CPN.T60.feeRate < 0) return positiveViolationError(["feeRate"], ["CPN", "T60", "feeRate"]);
    return new Object({
        errorVariable: null,
        errorType: null,
        errorMessage: "Không tìm thấy lỗi trong module CPN"
    });

}

module.exports = {
    CPNdebugger,
}