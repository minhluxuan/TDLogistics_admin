const controllerUtils = require("../lib/validation");
const fs = require("fs");
const path = require("path");

const mediaValidation = new controllerUtils.MediaValidation();

const createMedia = async (req, res) => {
  const { error } = mediaValidation.validateCreatingMedia(req.body);
  if (error) {
    return res.status(400).json({
      error: true,
      message: "Thông tin không hợp lệ.",
    });
  }
  try {
    const filePath = path.join("storage", "media", "media.json");
    fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
        // Nếu file không tồn tại, tạo file mới và thêm đối tượng vào
        const data = {};

        data[req.body.url] = {
          [req.body.lang]: {},
        };

        for (let content in req.body.content) {
			if (req.body.content[content]["type"] === "file") {

				if (req.body.content[content]["title"] !== " " && req.body.content[content]["title"] !== undefined && req.body.content[content]["title"] !== null) {
				
				const tempFilePath = path.join("storage", "media_temp", req.body.content[content]["title"]);

					if (fs.existsSync(tempFilePath)) {
						const officialFolderPath = path.join("storage", "media", req.body.url);
						if (!fs.existsSync(officialFolderPath)) {
						fs.mkdirSync(officialFolderPath, { recursive: true });
						}

						const officialFilePath = path.join(officialFolderPath, req.body.content[content]["title"]);
		
						fs.renameSync(tempFilePath, officialFilePath);      
						
						data[req.body.url][req.body.lang][content] = req.body.content[content];
					}
				}
			} 
			else {
				data[req.body.url][req.body.lang][content] = req.body.content[content];
			}
        }
		fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
	} 
    else {
        // Nếu file đã tồn tại, đọc nội dung file và thêm đối tượng vào
        fs.readFile(filePath, "utf8", (err, data) => {
          // Chuyển đổi dữ liệu từ chuỗi JSON sang mảng hoặc đối tượng JavaScript
			const jsonData = JSON.parse(data);
			// Thêm đối tượng vào đối tượng JSON đã đọc
			if (jsonData[req.body.url]) {
				// kiểm tra có url từ body gửi về chưa
				if (jsonData[req.body.url][req.body.lang]) {
				// đã tồn tại langague khi gửi về
				for (let content in req.body.content) {
					if (req.body.content[content]["type"] === "file") {
					if (req.body.content[content]["title"] !== " " && req.body.content[content]["title"] !== undefined && req.body.content[content]["title"] !== null) {
						const tempFilePath = path.join("storage", "media_temp", req.body.content[content]["title"]);

						if (fs.existsSync(tempFilePath)) {

						const officialFolderPath = path.join("storage", "media", req.body.url);

						if (!fs.existsSync(officialFolderPath)) {
							fs.mkdirSync(officialFolderPath, { recursive: true });
						}

						const officialFilePath = path.join(officialFolderPath, req.body.content[content]["title"]);
	
						fs.renameSync(tempFilePath, officialFilePath);
						
						console.log(jsonData[req.body.url][req.body.lang].hasOwnProperty("post_1"));
						if (jsonData[req.body.url][req.body.lang].hasOwnProperty(content)) {

							if (jsonData[req.body.url][req.body.lang][content]["type"] === "file")
							{
								const oldFilePath = path.join("storage","media",req.body["url"],jsonData[req.body.url][req.body.lang][content]["title"]);
								if (fs.existsSync(oldFilePath))
								{
									fs.unlinkSync(oldFilePath);
								}
							}  
						}
						jsonData[req.body.url][req.body.lang][content] = req.body.content[content];
						} 
					}
					}                 
					else  {
					jsonData[req.body.url][req.body.lang][content] = req.body.content[content];
					}
				} // Đối tượng bạn muốn thêm vào file JSON
				} 
				else {
				jsonData[req.body.url][req.body.lang] = {}; // tạo lang mới với url

				for (let content in req.body.content) {
					if (req.body.content[content]["type"] === "file") {
					if (req.body.content[content]["title"] !== " " && req.body.content[content]["title"] !== undefined && req.body.content[content]["title"] !== null) {
						const tempFilePath = path.join("storage", "media_temp", req.body.content[content]["title"]);

						if (fs.existsSync(tempFilePath)) {

						const officialFolderPath = path.join("storage", "media", req.body.url);

						if (!fs.existsSync(officialFolderPath)) {
							fs.mkdirSync(officialFolderPath, { recursive: true });
						}

						const officialFilePath = path.join(officialFolderPath, req.body.content[content]["title"]);
	
						fs.renameSync(tempFilePath, officialFilePath);
						
						jsonData[req.body.url][req.body.lang][content] = req.body.content[content];
						} 
					}
					}      
					else{
					jsonData[req.body.url][req.body.lang][content] = req.body.content[content];
					}
				} // Đối tượng bạn muốn thêm vào file JSON
				}
			} 
			
			else {
				jsonData[req.body.url] = { // tạo url mới
					[req.body.lang]: {},
				};
				
				for (let content in req.body.content) {
					if (req.body.content[content]["type"] === "file") {
						if (req.body.content[content]["title"] !== " " && req.body.content[content]["title"] !== undefined && req.body.content[content]["title"] !== null) {
							const tempFilePath = path.join("storage", "media_temp", req.body.content[content]["title"]);

							if (fs.existsSync(tempFilePath)) {

								const officialFolderPath = path.join("storage", "media", req.body.url);

								if (!fs.existsSync(officialFolderPath)) {
									fs.mkdirSync(officialFolderPath, { recursive: true });
								}

								const officialFilePath = path.join(officialFolderPath, req.body.content[content]["title"]);

								fs.renameSync(tempFilePath, officialFilePath);

								jsonData[req.body.url][req.body.lang][content] = req.body.content[content];
							} 
						}
					}
					else {
						jsonData[req.body.url][req.body.lang][content] = req.body.content[content];
					}
				}
			}
			// Ghi đè dữ liệu mới vào file JSON
			fs.writeFileSync(filePath,JSON.stringify(jsonData, null, 4));
        });
    }
});

    return res.status(200).json({
      error: false,
      message: "Cập nhật dữ liệu thành công!",
    });
  } 
  
  catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};



const findMedia = async (req, res) => {
  try {
		const { error } = mediaValidation.validateFindingMedia(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}
		const mediaFile = path.join("storage", "media", "media.json");

		fs.readFile(mediaFile, "utf8", (err, data) => {
		// Chuyển đổi dữ liệu từ chuỗi JSON sang mảng hoặc đối tượng JavaScript
			const jsonData = JSON.parse(data);

			if (!jsonData[req.body.url]) {
				return res.status(404).json({
					error: true,
					message: "Bưu cục không tồn tại.",
				});
			} 
			
			else if (!jsonData[req.body.url][req.body.lang]) {
				return res.status(404).json({
					error: true,
					message: "Ngôn ngữ không tồn tại.",
				});
			}	
			
			res.send(jsonData[req.body.url][req.body.lang]);
		});
  	} 
  
  catch (error) {
		return res.status(500).json({
			error: true,
			message: error.message,
		});
  	}
};

const findFile = (req , res) => {
	try {
		const { error } = mediaValidation.validateFindingFileMedia(req.body);
	
		if (error) {
		  return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		  });
		}
	
		const filePath = path.join(__dirname, ".." ,"storage", "media", req.body["url"], req.body["filename"]);
		
		res.sendFile(filePath);
	} 

	catch (error) {
		console.log(error)
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

// 

module.exports = {
  createMedia,
  findMedia,
  findFile
};
