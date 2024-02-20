// var request = require('supertest');
// var server = request.agent('http://localhost:5000');

// // describe("Test staff login", () => {
// //     test("POST /api/v1/staffs/login", (done) => {
// //         testSession
// //         .post("/api/v1/staffs/login")
// //         .send({
// //             username: "ntdung@tdlogistics",
// //             password: "NTDung@tdlogistics2k24"
// //         })
// //         .expect(200)
// //         .end((err, res) => {
// //             if (err) return done(err);
// //             // After successful login, you can store the authentication token or session cookie
// //             // For example, you can store it in a variable like authToken
// //             const authToken = res.headers['authorization']; // Assuming the token is returned in the Authorization header
// //             done();
// //         });
// //     });
// // });

// describe("Test creating new agency", () => {
//     it('login', loginUser());

//     it('should respond with status 201', function(done) {
//         server
//             .post("/api/v1/agencies/create")
//             .set("Content-Type", "application/json")
//             .send({
//                 username: "buucucquan1",
//                 user_password: "Buucucquan1@tdlogistics",
//                 user_fullname: "Lữ Xuân Minh",
//                 user_phone_number: "0981430417",
//                 user_email: "minh.luxuanhcmc@hcmut.edu.vn",
//                 user_date_of_birth: "2004-03-03",
//                 user_cccd: "077204005691",
//                 user_province: "Tỉnh Bà Rịa - Vũng Tàu",
//                 user_district: "Huyện Đất Đỏ",
//                 user_town: "Thị trấn Đất Đỏ",
//                 user_detail_address: "326, ĐT44A",
//                 user_position: "Quản lý bưu cục",
//                 user_salary: 25000000,
//                 type: "BC",
//                 level: 3,
//                 postal_code: "70001",
//                 agency_name: "Bưu cục quận 1",
//                 detail_address: "49, Phạm Ngũ Lão, phường Phạm Ngũ Lão, quận 1, Thành phố Hồ Chí Minh",
//                 province: "Thành phố Hồ Chí Minh",
//                 district: "Quận 1",
//                 town: "Phường Phạm Ngũ Lão",
//                 detail_address: "15, đường Phạm Ngũ Lão",
//                 latitude: 10.7540931,
//                 longitude: 106.0342813,
//                 managed_wards: ["Phường Phạm Ngũ Lão", "Phường Đa Kao"],
//                 phone_number: "0981430417",
//                 email: "buucucquan1@tdlogistics.com",
//                 commission_rate: 0.4,
//                 bin: "050138319579",
//                 bank: "Sacombank"
//             })
//             .expect(201)
//             .end((err, res) => {
//                 if (err) return done(err);
//                 done();
//             });
//     });
// });

// function loginUser() {
//     return function(done) {
//         server
//             .post('/api/v1/staffs/login')
//             .send({
//                 username: "ntdung@tdlogistics",
//                 password: "NTDung@tdlogistics2k24"
//             })
//             .expect(200)
//             .end(onResponse);

//         function onResponse(err, res) {
//            if (err) return done(err);
//            return done();
//         }
//     };
// };

var request = require('superagent');
var user1 = request.agent();

user1
    .post('http://localhost:5000/api/v1/staffs/login')
    .send({ 
        username: "ntdung@tdlogistics",
        password: "NTDung@tdlogistics2k24"
    })
    .end(function(err, res) {
        // user1 will manage its own cookies
        // res.redirects contains an Array of redirects
});