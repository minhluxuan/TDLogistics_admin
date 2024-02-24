// login.js
const socket = io("http://localhost:5000");

function loginUser() {
    // Lấy giá trị của các trường input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // const username = "minhluxuan2k";
    // const password = "minhluxuan@TDlogistics2k24";

    // Tạo payload để gửi lên server
    const payload = {
        username: username,
        password: password
    };

    // Gửi yêu cầu bằng fetch API
    fetch('http://localhost:5000/api/v1/staffs/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Xử lý phản hồi từ server
        console.log(data);
        // Ví dụ: điều hướng hoặc hiển thị thông báo thành công
    })
    .catch(error => {
        // Xử lý lỗi
        console.error('There was a problem with the fetch operation:', error);
    });
}

// Gắn sự kiện "click" vào nút submit
document.getElementById('submit').addEventListener('click', loginUser);
