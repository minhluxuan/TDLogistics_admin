const socket = io("http://localhost:5000");
const notificationArea = document.querySelector("#notificationArea");
// let receivedNotification = false; // Flag to track if a notification has been received

socket.on("notifyNewOrderToAgency", (order) => {
    // if (!receivedNotification) {
        const message = "Thời gian tạo: " + order.order_time + '\n';
        
        console.log("Check");
        const p = document.createElement("p");
        p.innerText = message;
        notificationArea.appendChild(p);
        
        receivedNotification = true; // Set the flag to true after receiving the first notification
        
        // Remove the event listener after receiving the first notification
        // socket.off("notifyNewOrderToAgency");
    // }
});