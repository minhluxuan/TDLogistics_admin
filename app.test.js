var request = require('supertest');
var server = request.agent('http://localhost:5000');

describe('GET /get_session', function(){
    before(function(done) {
        server
            .post('/api/v1/staffs/login')
            .send({
                username: "ntdung@tdlogistics",
                password: "NTDung@tdlogistics2k24"
            })
            .expect(200, done); // Call done() when login operation is complete
    });

    it('should be able to access /api/getDir after login', function(done){
        server
            .get('/get_session')                       
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                console.log(res.body);
                done();
            });
    });
});


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