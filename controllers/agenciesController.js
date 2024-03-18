const agenciesService = require("../services/agenciesService");
const staffsService = require("../services/staffsService");
const agencyCompanyService = require("../services/agenciesCompanyService");
const logger = require("../lib/logger");
const utils = require("../lib/utils");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require("path");
const { object } = require("joi");

const agencyValidation = new validation.AgencyValidation();

const agencyCannotBeAffected = ["TD_00000_077165007713"];

const checkExistAgency = async (req, res) => {
  try {
    const { error } = agencyValidation.validateCheckingExistAgency(req.query);

    if (error) {
      return res.status(400).json({
        error: true,
        message: "Thông tin không hợp lệ.",
      });
    }

    const existed = await agenciesService.checkExistAgency(req.query);
    return res.status(200).json({
      error: false,
      existed: existed,
      message: existed ? `Bưu cục có mã bưu cục ${req.query.agency_id} đã tồn tại.` : `Bưu cục có mã bưu cục ${req.query.agency_id} chưa tồn tại.`,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const getAgencies = async (req, res) => {
  try {
    if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_DRIVER", "AGENCY_SHIPPER",].includes(req.user.role)) {
      const { error } = agencyValidation.validateFindingAgencyByAgency(
        req.query
      );

      if (error) {
        return res.status(400).json({
          error: true,
          message: error.message,
        });
      }

      req.body.agency_id = req.user.agency_id;

      let result = await agenciesService.getOneAgency(req.body);

      if (!result) {
        throw new Error(
          "Đã xảy ra lỗi. Lấy thông tin bưu cục không thành công. Vui lòng thử lại."
        );
      }

      result[0].managed_wards = result[0].managed_wards ? JSON.parse(result[0].managed_wards) : new Array();

      if (!result[0].invidual_company)
      {
        const agencyCompanyInfo = await agencyCompanyService.getOneAgencyCompany(req.body);
        if (!agencyCompanyInfo) {
          throw new Error(
            "Đã xảy ra lỗi. Lấy thông tin doanh nghiệp không thành công. Vui lòng thử lại."
          );
        }

        agencyCompanyInfo[0].license = agencyCompanyInfo[0].license ? JSON.parse(agencyCompanyInfo[0].license) : new Array();

        result = {...result, ...agencyCompanyInfo};
      }

      return res.status(200).json({
        error: false,
        data: result,
        message: `Lấy thông tin bưu cục thành công.`,
      });
    }

    if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",].includes(req.user.role) || req.user.privileges.includes(2)) {
      const paginationConditions = { rows: 0, page: 0 };

      if (req.query.rows) {
        paginationConditions.rows = parseInt(req.query.rows);
      }

      if (req.query.page) {
        paginationConditions.page = parseInt(req.query.page);
      }

      const { error: paginationError } = agencyValidation.validatePaginationConditions(paginationConditions);
      if (paginationError) {
          return res.status(400).json({
          error: true,
          message: paginationError.message,
        });
      }

      const { error } = agencyValidation.validateFindingAgencyByAdmin(req.body);

      if (error) {
        return res.status(400).json({
          error: true,
          message: error.message,
        });
      }

      const agenciesInfo = await agenciesService.getAgencies(req.body, paginationConditions);

      if (!agenciesInfo) {
        throw new Error(
          "Đã xảy ra lỗi. Lấy thông tin đại lý không thành công. Vui lòng thử lại."
        );
      }

      const result = new Array();
      for (let agency of agenciesInfo) {
        if (agency.managed_wards) {
          agency.managed_wards = JSON.parse(agency.managed_wards);
        } 
        else {
          agency.managed_wards = new Array();
        }

        if (!agency.invidual_company)
        {
          const agencyCompanyInfo = await agencyCompanyService.getOneAgencyCompany(agency.agency_id);
          if (!agencyCompanyInfo) {
            throw new Error(
              "Đã xảy ra lỗi. Lấy thông tin doanh nghiệp không thành công. Vui lòng thử lại."
            );
          }

          if (agencyCompanyInfo[0].license) {
            agencyCompanyInfo[0].license = JSON.parse(agencyCompanyInfo[0].license);
          } 
          else {
            agencyCompanyInfo.license[0] = new Array();
          }

          agency = {...agency, ...agencyCompanyInfo[0]};
        }
      result.push(agency);
      }

      return res.status(200).json({
        error: false,
        data: result,
        message: "Lấy thông tin đại lý thành công.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const createNewAgency = async (req, res) => {
  try {
    const { error } = agencyValidation.validateCreatingAgency(req.body);

    if (error) {
      console.log(error);
      return res.status(400).json({
        error: true,
        message: error.message,
      });
    }

    const checkingPostalCode = await agenciesService.checkPostalCode(
      req.body.province,
      req.body.district,
      req.body.postal_code
    );

    if (!checkingPostalCode.success) {
      return res.status(400).json({
        error: true,
        message: checkingPostalCode.message,
      });
    }

    const checkingWardOccupation = await agenciesService.checkWardsOccupation(
      req.body.province,
      req.body.district,
      req.body.managed_wards
    );

    if (!checkingWardOccupation.success) {
      return res.status(409).json({
        error: true,
        message: checkingWardOccupation.message,
      });
    }

    const tempUser = new Object({
      username: req.body.username,
      cccd: req.body.user_cccd,
      phone_number: req.body.user_phone_number,
      email: req.body.user_phone_number,
    });

    const resultCheckingExistStaff = await staffsService.checkExistStaff(
      tempUser
    );

    if (resultCheckingExistStaff.existed) {
      return res.status(409).json({
        error: true,
        message: resultCheckingExistStaff.message,
      });
    }

    const agencyId =
      req.body.type + "_" + req.body.postal_code + "_" + req.body.user_cccd;

    req.body.user_password = utils.hash(req.body.user_password);

    const newStaff = new Object({
      agency_id: agencyId,
      staff_id: agencyId,
      username: req.body.username,
      password: req.body.user_password,
      fullname: req.body.user_fullname || null,
      phone_number: req.body.user_phone_number || null,
      email: req.body.user_email || null,
      date_of_birth: req.body.user_date_of_birth || null,
      cccd: req.body.user_cccd || null,
      province: req.body.user_province || null,
      district: req.body.user_district || null,
      town: req.body.town || null,
      detail_address: req.body.user_detail_address || null,
      role: "AGENCY_MANAGER",
      position: req.body.user_position || null,
      bin: req.body.user_bin || null,
      bank: req.body.user_bank || null,
      salary: req.body.salary || null,
      active: false,
    });

    const newAgency = new Object({
      level: req.body.level,
      agency_id: agencyId,
      postal_code: req.body.postal_code,
      agency_name: req.body.agency_name,
      province: req.body.province,
      district: req.body.district,
      town: req.body.town,
      detail_address: req.body.detail_address,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      managed_wards: req.body.managed_wards
        ? JSON.stringify(req.body.managed_wards)
        : JSON.stringify(new Array()),
      phone_number: req.body.phone_number,
      email: req.body.email,
      commission_rate: req.body.commission_rate,
      bin: req.body.bin || null,
      bank: req.body.bank || null,
      invidual_company : req.body.invidual_company 
    });

    const resultCreatingNewAgency = await agenciesService.createNewAgency(
      newAgency
    );

    let textResultCreatingNewAgency;
    if (!resultCreatingNewAgency || resultCreatingNewAgency.affectedRows <= 0) {
      textResultCreatingNewAgency = `Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thất bại.`;
    } else {
      textResultCreatingNewAgency = `Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thành công.`;
    }

    const resultCreatingNewStaff = await staffsService.createNewStaff(newStaff);

    let textResultCreatingNewStaff;
    if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
      textResultCreatingNewStaff = `
			Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thất bại.`;
    } else {
      textResultCreatingNewStaff = `Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thành công.`;
    }

    const resultCreatingTablesForAgency =
      await agenciesService.createTablesForAgency(req.body.postal_code);
    const textResultCreatingTablesForAgency =
      resultCreatingTablesForAgency.message;

    const resultLocatingAgencyInArea = await agenciesService.locateAgencyInArea(
      0,
      req.body.province,
      req.body.district,
      req.body.managed_wards,
      agencyId,
      req.body.postal_code
    );

    const textResultLocatingAgencyInArea = resultLocatingAgencyInArea.message;

    if (req.body.invidual_company !== 0) {

    const newAgencyComapany = new Object({
      agency_id: agencyId,
      company_name: req.body.company_name,
      tax_number: req.body.company_name,
      business_number: req.body.business_number,
    });

    let licenseses = new Object();
    if (req.files)
	  {	
      req.files.forEach((file, index) => {
        licenseses[`page_${index + 1}`] = file.originalname;
      });
      newAgencyComapany.licenses = licenseses;
	  }

      const resultCreatingNewAgencyCompany = await agencyCompanyService.createNewAgencyCompany(newAgencyComapany);

      console.log(resultCreatingNewAgencyCompany);


      let textResultCreatingNewAgencyCompany;
      if (
        !resultCreatingNewAgencyCompany ||
        resultCreatingNewAgencyCompany.affectedRows <= 0
      ) {
        textResultCreatingNewAgencyCompany = `Tạo bưu cục doanh nghiệp có mã bưu cục ${agencyId} trong cơ sở dữ liệu agency_company thất bại.`;
      } else {
        textResultCreatingNewAgencyCompany = `Tạo bưu cục doanh nghiệp có mã bưu cục ${agencyId} trong cơ sở dữ liệu agency_company thành công.`;
      }

	  if (req.files)
	  {	
		files.forEach((file) => {
			const tempLicenseFolder = path.join("storage", "agency_company", "license_temp");
			if (!fs.existsSync(tempFolderAvatarPath)) {
				fs.mkdirSync(tempFolderAvatarPath, { recursive: true });
			}	

			const officialFolderLicensePath = path.join("storage", "agency_company", "license", `${req.body.agency_id}`);
			if (!fs.existsSync(officialFolderAvatarPath)) {
				fs.mkdirSync(officialFolderAvatarPath, { recursive: true });
			}

			const tempLicenseFilePath = path.join(tempLicenseFolder, file.originalname);
			const officialLicenseFilePath = path.join(officialFolderLicensePath, file.originalname);
			
			fs.renameSync(tempLicenseFilePath, officialLicenseFilePath);
		});
	  }

      return res.status(200).json({
        error: false,
        message: `
				Kết quả:\n
				${textResultCreatingNewStaff}\n
				${textResultCreatingNewAgency}\n
				${textResultCreatingTablesForAgency}\n
				${textResultLocatingAgencyInArea}\n
				${textResultCreatingNewAgencyCompany}`,
      });
    }

    return res.status(200).json({
      error: false,
      message: `
			Kết quả:\n
			${textResultCreatingNewStaff}\n
			${textResultCreatingNewAgency}\n
			${textResultCreatingTablesForAgency}\n
			${textResultLocatingAgencyInArea}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const updateAgency = async (req, res) => {
  try {
    const { error } =
      agencyValidation.validateFindingAgencyByAgency(req.query) ||
      agencyValidation.validateUpdatingAgency(req.body);

    if (error) {
      return res.status(400).json({
        error: true,
        message: error.message,
      });
    }

    if (agencyCannotBeAffected.includes(req.query.agency_id)) {
      return res.status(400).json({
        error: true,
        message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
      });
    }

    const result = await agenciesService.updateAgency(req.body, req.query);

    if (result.affectedRows <= 0) {
      return res.status(404).json({
        error: true,
        message: `Bưu cục có mã bưu cục ${req.query.agency_id} không tồn tại.`,
      });
    }

    return res.status(200).json({
      error: false,
      message: `Cập nhật thông tin bưu cục có mã bưu cục ${req.query.agency_id} thành công.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const deleteAgency = async (req, res) => {
  try {
    const { error } = agencyValidation.validateDeletingAgency(req.query);

    if (error) {
      return res.status(400).json({
        error: true,
        message: error.message,
      });
    }

    if (agencyCannotBeAffected.includes(req.query.agency_id)) {
      return res.status(400).json({
        error: true,
        message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
      });
    }

    const resultFindingOneAgency = await agenciesService.getOneAgency(
      req.query
    );
    if (!resultFindingOneAgency || resultFindingOneAgency.length <= 0) {
      return res.status(404).json({
        error: true,
        message: "Bưu cục/đại lý không tồn tại.",
      });
    }

    const agency = resultFindingOneAgency[0];
    const agencyId = agency.agency_id;
    const province = agency.province;
    const district = agency.district;
    const wards = agency.managed_wards ? JSON.parse(agency.managed_wards) : new Array();

    const resultDeletingAgency = await agenciesService.deleteAgency(req.query);

    let textResultDeletingAgency;
    if (!resultDeletingAgency || resultDeletingAgency.affectedRows <= 0) {
      textResultDeletingAgency = `Xóa bưu cục có mã bưu cục ${req.query.agency_id} thất bại.`;
    } else {
      textResultDeletingAgency = `Xóa bưu cục có mã bưu cục ${req.query.agency_id} thành công.`;
    }

	const folderPath = path.join("storage", "agency_company", "license", `${req.query.agency_id}`)

	if (fs.existsSync(folderPath))
	{
		fs.rmdirSync(folderPath);
	}

    const agencyIdSubParts = agencyId.split("_");
    const postalCode = agencyIdSubParts[1];

    const resultDroppingTableForAgency =
      await agenciesService.dropTableForAgency(postalCode);
    const textResultDroppingTablesForAgency =
      resultDroppingTableForAgency.message;

    const resultLocatingAgencyInArea = await agenciesService.locateAgencyInArea(
	  1,
      province,
      district,
      wards,
      agencyId,
      postalCode
    );
    const textResultLocatingAgencyInArea = resultLocatingAgencyInArea.message;

    return res.status(201).json({
      error: false,
      message: `
			Kết quả:\n
			${textResultDeletingAgency}
			${textResultDroppingTablesForAgency}
			${textResultLocatingAgencyInArea}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const updateAgencyCompany = async (req, res) => {
	try {
	  const { error } = agencyValidation.validateFindingAgencyByAgency(req.query) || agencyValidation.validateUpdateAgencyCompany(req.body);
  
	  if (error) {
		return res.status(400).json({
		  error: true,
		  message: error.message,
		});
	  }
  
	  if (agencyCannotBeAffected.includes(req.query.agency_id)) {
		return res.status(400).json({
		  error: true,
		  message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
		});
	  }
  
	  const result = await agencyCompanyService.updateAgencyCompany(req.body, req.query);
  
	  if (result.affectedRows <= 0) {
		return res.status(404).json({
		  error: true,
		  message: `Bưu cục công ty có mã bưu cục ${req.query.agency_id} không tồn tại.`,
		});
	  }
  
	  return res.status(200).json({
		error: false,
		message: `Cập nhật thông tin bưu cục doanh nghiệp có mã bưu cục ${req.query.agency_id} thành công.`,
	  });
	} catch (error) {
	  console.log(error);
	  return res.status(500).json({
		error: true,
		message: error.message,
	  });
	}
};

const updateLicenseAgencyCompany = async (req, res) => {
	try {
	  const { error } = agencyValidation.validateFindingAgencyByAgency(req.query)  
	  if (error) {
		return res.status(400).json({
		  error: true,
		  message: error.message,
		});
	  }
	  
	  if (agencyCannotBeAffected.includes(req.query.agency_id)) {
		return res.status(400).json({
		  error: true,
		  message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
		});
	  }
		
	  let licenses = new Object();		
	  if (req.files)
		{	
		  req.files.forEach((file, index) => {
			  licenses[`page_${index + 1}`] = file.originalname;
			  pages += 1;
		  });
		}
  
		const newLicense = new Object({
		  license: licenses || null,
		});
		
		const result = await agencyCompanyService.updateAgencyCompany(newLicense, req.query);
		
		const folderPath = path.join("storage", "agency_company", "license", `${req.body.agency_id}`)
		if (!fs.existsSync(folderPath))
		{
			fs.rmdirSync(folderPath);
		}

		if (req.files)
		{	
		  files.forEach((file) => {
			  const tempLicenseFolder = path.join("storage", "agency_company", "license_temp");
			  if (!fs.existsSync(tempFolderAvatarPath)) {
				  fs.mkdirSync(tempFolderAvatarPath, { recursive: true });
			  	}	
  
			  const officialFolderLicensePath = path.join("storage", "agency_company", "license", `${req.body.agency_id}`);
			  if (!fs.existsSync(officialFolderAvatarPath)) {
				  fs.mkdirSync(officialFolderAvatarPath, { recursive: true });
			  	}
  
			  const tempLicenseFilePath = path.join(tempLicenseFolder, file.originalname);
			  const officialLicenseFilePath = path.join(officialFolderLicensePath, file.originalname);
			  
			  fs.renameSync(tempLicenseFilePath, officialLicenseFilePath);
		  	});
		}
    
	  if (result.affectedRows <= 0) {
		return res.status(404).json({
		  error: true,
		  message: `Bưu cục doanh nghiệp có mã bưu cục ${req.query.agency_id} không tồn tại.`,
		});
	  }
  
	  return res.status(200).json({
		error: false,
		message: `Cập nhật giấy phép kinh doanh bưu cục doanh nghiệp có mã bưu cục ${req.query.agency_id} thành công.`,
	  });
	} catch (error) {
	  console.log(error);
	  return res.status(500).json({
		error: true,
		message: error.message,
	  });
	}
};

const getLicenseAgencyCompany = async (req, res) => {
	try {
		const { error } = agencyValidation.validateFindingAgencyByAgency(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
		const resultGettingOneAgencyCompany = await agencyCompanyService.getOneAgency(req.body.agency_id); 
		const agencyCompany = resultGettingOneAgencyCompany[0];
		const page = "page_" + req.body.page_number.to_string();
		const fileName = agencyCompany.license[page]|| null;
		
		if (fileName) {
			const filePath = path.join(__dirname, "..", "storage", "agency_company", "license", `${req.body.agency_id}`, fileName);
			if (fs.existsSync(filePath))
			{
				return res.status(200).sendFile(filePath);
			}
		}

		return res.status(404).json({
			error: true,
			message: "Không tìm thấy dữ liệu",
		});
		
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};
  

module.exports = {
  checkExistAgency,
  getAgencies,
  createNewAgency,
  updateAgency,
  deleteAgency,
  updateLicenseAgencyCompany,
  updateAgencyCompany,
  getLicenseAgencyCompany
};
