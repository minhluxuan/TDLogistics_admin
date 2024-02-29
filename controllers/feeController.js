const feeCalculate = require("../lib/feeCalculate");
const validation = require("../lib/validation");

const feeValidate = new validation.fee();

const calculateFee = (req , res) => {
  try {
		const { error } = feeValidate.validateFeeCalculate(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

   const distance = req.body.distance;
   const serviceCode = req.body.distance;
   const source = req.body.source;
   const destination = req.body.destination;
   const mass = req.body.mass;
   const increasingRateWhenBelongToRemoteArea = req.body.increasingRateWhenBelongToRemoteArea;
   const optionService = req.body.optionService;
   const isBelongToRemoteArea = req.body.isBelongToRemoteArea;

		const result = feeCalculate.calculteFee(serviceCode,source,destination,distance,mass,increasingRateWhenBelongToRemoteArea,optionService,isBelongToRemoteArea);
		
		return res.status(200).json({
			error: false,
			fee: result,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

module.exports = {
  calculateFee
}