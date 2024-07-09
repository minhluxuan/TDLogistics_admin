const axios = require("axios");
const zalo = require("../database/Zalo");

const createAccessToken = async (code) => {
    try {
        const data = {
            app_id: "2757135236453764158",
            code: code,
            grant_type: "authorization_code",
        };
        const response = await axios.post("https://oauth.zaloapp.com/v4/oa/access_token", data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                secret_key: "6SdZXHd4ZG2SYsGINzdG",
            },
        });
        console.log(response.data);
        if (response.data.error) {
            throw new Error(`Error message: ${response.data.error.message}`);
        }
        updateAccessToken(response.data.access_token);
        updateRefreshToken(response.data.refresh_token);
    } catch (error) {
        console.log(error);
        throw new Error(`Error message: ${err.message}`);
    }
};

const refreshToken = async () => {
    try {
        const key = await zalo.gettingKey();
        const data = {
            refresh_token: key.refresh_token,
            app_id: "2757135236453764158",
            grant_type: "refresh_token",
        };
        const response = await axios.post(" https://oauth.zaloapp.com/v4/oa/access_token", data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                secret_key: "6SdZXHd4ZG2SYsGINzdG",
            },
        });

        console.log(response.data);
        if (response.data.error) {
            throw new Error(`Error message: ${response.data.error.message}`);
        }
        await zalo.updateKey(response.data.access_token, response.data.refresh_token);
    } catch (error) {
        console.log(error);
        throw new Error(`Error message: ${err.message}`);
    }
    return response;
};

const updateAccessToken = async (access_token) => {
    await zalo.updateAccessToken(access_token);
};

const updateRefreshToken = async (refresh_token) => {
    await zalo.updateRefreshToken(refresh_token);
};

const confirmPaymentCustomer = async (phone, fee, customer_name, order_id) => {
    const formattedPhoneNumber = "+84" + phone.substring(1);
    let data = {
        phone: formattedPhoneNumber,
        template_id: "330875",
        template_data: {
            fee: fee,
            customer_name: customer_name,
            order_id: order_id,
        },
    };

    try {
        const key = await zalo.gettingKey();
        const accessToken = key.access_token;

        const response = await axios.post("https://business.openapi.zalo.me/message/template", data, {
            headers: {
                "Content-Type": "application/json",
                access_token: accessToken,
            },
        });
    } catch (error) {
        console.log(error);
        throw new Error(`Error message: ${err.message}`);
    }
};

const confirmPaymentAgency = async (
    phone,
    created_time,
    service_type,
    address_source,
    address_destination,
    fee,
    COD,
    name_sender,
    order_id
) => {
    const formattedPhoneNumber = "+84" + phone.substring(1);
    let data = {
        phone: formattedPhoneNumber,
        template_id: "343027",
        template_data: {
            created_time: created_time,
            service_type: service_type,
            address_source: address_source,
            address_destination: address_destination,
            fee: fee,
            COD: COD,
            name_sender: name_sender,
            order_id: order_id,
        },
    };

    try {
        const key = await zalo.gettingKey();
        const accessToken = key.access_token;

        const response = await axios.post("https://business.openapi.zalo.me/message/template", data, {
            headers: {
                "Content-Type": "application/json",
                access_token: accessToken,
            },
        });
        console.log(response.data);
    } catch (error) {
        console.log(error);
        throw new Error(`Error message: ${err.message}`);
    }
};
const confirmCreateOrder = async (
    phone,
    shipper,
    service_type,
    name_receiver,
    address_source,
    address_destination,
    cod,
    name_sender,
    order_id
) => {
    const formattedPhoneNumber = "+84" + phone.substring(1);
    let data = {
        phone: formattedPhoneNumber,
        template_id: "330874",
        template_data: {
            shipper: shipper,
            service_type: service_type,
            name_receiver: name_receiver,
            address_source: address_source,
            address_destination: address_destination,
            COD: cod,
            name_sender: name_sender,
            order_id: order_id,
        },
    };

    try {
        const key = await zalo.gettingKey();
        const accessToken = key.access_token;

        const response = await axios.post("https://business.openapi.zalo.me/message/template", data, {
            headers: {
                "Content-Type": "application/json",
                access_token: accessToken,
            },
        });
    } catch (error) {
        console.log(error);
        throw new Error(`Error message: ${err.message}`);
    }
};

// const confirmOrder = async (phone, order_code, date, price, name, status) => {
//     const formattedPhoneNumber = "+84" + phone.substring(1);

//     const data = {
//         phone: formattedPhoneNumber,
//         template_id: "330287",
//         template_data: {
//             order_code: order_code,
//             date: date,
//             price: price,
//             name: name,
//             phone_number: formattedPhoneNumber,
//             status: status,
//         },
//     };
//     try {
//         const key = await zalo.gettingKey();
//         const accessToken = key.access_token;

//         const response = await axios.post("https://business.openapi.zalo.me/message/template", data, {
//             headers: {
//                 "Content-Type": "application/json",
//                 access_token: accessToken,
//             },
//         });
//     } catch {
//         console.log(error);
//         throw new Error(`Error message: ${err.message}`);
//     }
// };

const verifyOTP = async (phone, otp) => {
    const formattedPhoneNumber = "+84" + phone.substring(1);
    let data = {
        phone: formattedPhoneNumber,
        template_id: "343026",
        template_data: {
            otp: otp,
        },
    };

    try {
        const key = await zalo.gettingKey();
        const accessToken = key.access_token;

        const response = await axios.post("https://business.openapi.zalo.me/message/template", data, {
            headers: {
                "Content-Type": "application/json",
                access_token: accessToken,
            },
        });
    } catch (error) {
        console.log(error);
        throw new Error(`Error message: ${err.message}`);
    }
};

// confirmPaymentAgency("0976481171", "11/02/2024", "Fast", "Hanoi", "HCM", "100000", "50000", "Nguyen Van A", "123456");

// createAccessToken(
//     "wXtrOOUvzsNk9R8tj8kBHEyIhGFIdfjFiY3kERQvm5Ri8jjXiRoTGSeigmY5Zhz5lmIDCD-fzKBh8kSUjh3yBEubkNcYixW3kJUMHuAYe0ViAkTpmQJrTOmIoZ-CnTSpZ3tvVDcT-o21Jv4yheAMN-Dlb0U-uuOxyMxYJgl3s1IePSv9Xv-wGQj0cMVAij9wY2NGGlgxaWA-QTiiYBNLUEjdkcMBcgj5uqoW3Cs6y6JFJgia2DU4VZ5dymzjlP4MNsv5PrpMHtmnH2NHNTfcXGTZ-VzAaygBSGZRyZ6sZx9o4QtJFxIC2PALdadu39__lqc7Yx3oWzAX2A2ovvNG_jvfgz_axfQNnrx7lFoPnetNSEUXNbacD1dNLksgrmW"
// );
module.exports = {
    confirmPaymentAgency,
    confirmCreateOrder,
    refreshToken,
    verifyOTP,
    createAccessToken,
};
