const socket = io("http://localhost:5000");
const notificationArea = document.querySelector("#notificationArea");

socket.on("notifyNewOrderToAgency", (order) => {
    const message = "Thời gian tạo: " + order.createdTime + '\n' +
                    "Điểm gửi: " + order.source + '\n' + 
                    "Điểm nhận: " + order.destination + '\n';
    
    const p = document.createElement("p");
    p.innerText = message;
    notificationArea.appendChild(p);
});