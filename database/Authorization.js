const mysql = require("mysql2");
const utils = require("./utils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const pool = mysql.createPool(dbOptions).promise();

const getAuthorization = async (personnel_id) => {
    const { table, conditionField } = utils.getInfo(personnel_id);

    try {
        const result = await utils.findOne(pool, table, [conditionField], [personnel_id]);

        if (!result || result.length <= 0) {
            throw new Error("Nhân sự không tồn tại.");
        }

        return result[0].permission;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

const updateAuthorization = async (personnel_id, givenPermissions) => {
    const { table, conditionField } = utils.getInfo(personnel_id);

    try {
        const personnel = await utils.findOne(pool, table, [conditionField], [personnel_id]);

        if (!personnel || personnel.length <= 0) {
            console.log("Personnel does not exist.");
            throw new Error("Nhân sự không tồn tại.")
        }

        let jsonPermissions;
        let acceptedNumber = 0;
        const acceptedArray = new Array();

        if (personnel[0].permission) {
            const permissions = JSON.parse(personnel[0].permission);
            for (let i = 0; i < givenPermissions.length; i++) {
                if (!permissions.primary.includes(givenPermissions[i]) && !permissions.privilege.includes(givenPermissions[i])) {
                    permissions.privilege.push(givenPermissions[i]);
                    ++acceptedNumber;
                    acceptedArray.push(givenPermissions[i]);
                }
            }

            jsonPermissions = JSON.stringify(permissions);
        }
        else {
            jsonPermissions = JSON.stringify(new Object({
                primary: [],
                privilege: givenPermissions,
            }));
        }

        const result = await utils.updateOne(pool, table, ["permission"], [jsonPermissions], [conditionField], [personnel_id]);

        return new Object({
            affectedRows: result ? result[0].affectedRows : 0,
            acceptedNumber: acceptedNumber,
            acceptedArray: acceptedArray,
        });
    } catch (error) {
        console.log(error);
        throw new Error(error.message);   
    }
}

const deleteAuthorization = async (personnel_id, revokedPermissions) => {
    const { table, conditionField } = utils.getInfo(personnel_id);

    try {
        const personnel = await utils.findOne(pool, table, [conditionField], [personnel_id]);

        if (!personnel || personnel.length <= 0) {
            console.log("Personnel does not exist.");
            throw new Error("Nhân sự không tồn tại.");
        }

        let jsonPermissions;
        let acceptedNumber = 0;
        const acceptedArray = new Array();

        if (personnel[0].permission) {
            const permissions = JSON.parse(personnel[0].permission);

            for (let i = 0; i < permissions.privilege.length; i++) {
                if (revokedPermissions.includes(permissions.privilege[i])) {
                    acceptedArray.push(permissions.privilege[i]);
                    ++acceptedNumber;
                    permissions.privilege.splice(i, 1);
                    --i;
                }
            }

            jsonPermissions = JSON.stringify(permissions);
        }
        else {
            jsonPermissions = JSON.stringify(new Object({
                primary: [],
                privilege: []
            }));
        }

        const result = await utils.updateOne(pool, table, ["permission"], [jsonPermissions], [conditionField], [personnel_id]);

        return new Object({
            affectedRows: result ? result[0].affectedRows : 0,
            acceptedNumber: acceptedNumber,
            acceptedArray: acceptedArray,
        });
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

module.exports = {
    getAuthorization,
    updateAuthorization,
    deleteAuthorization,
}