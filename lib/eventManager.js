const EventEmitter = require("events");

class EvenMananger extends EventEmitter {};

const eventManager = new EvenMananger();

eventManager.once("ioInitialize", (io) => {
    // Thiết lập trình xử lý sự kiện 'connection' và 'disconnect' trong io
    io.on("connection", (socket) => {
        const user = socket.request.user;
        console.log("Socket connected with ID: ", socket.id);
        console.log('User:', socket.request.user);
        if (user) {
            console.log("Socket connected with ID: ", socket.id);
            console.log('User:', socket.request.user);
            if (user.agency_id) {
                socket.join(user.agency_id);
            }
        }
        
        // socket.on("notifyNewOrderFromUser", (info) => ordersController.createNewOrder(info));

        eventManager.on("notifyNewOrderToAgency", (info) => {
            if (socket.request.user.role !== "USER") {
                socket.emit("notifyNewOrderToAgency", info.order);
            }
        });

        eventManager.on("notifyError", message => {
            socket.send("notifyError", message);
        });
    
        eventManager.on("notifySuccessCreatedNewOrder", message => {
            socket.emit("notifySuccessCreatedNewOrder", message);
        });
    
        eventManager.on("notifyFailCreatedNewOrder", message => {
            socket.emit("notifyFailCreatedNewOrder", message);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected with ID: ", socket.id);
        });
    });
});

module.exports = eventManager;