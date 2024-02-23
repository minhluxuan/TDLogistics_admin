const EventEmitter = require("events");

class EventManager extends EventEmitter {}

const eventManager = new EventManager();

eventManager.once("ioInitialize", (io) => {
    io.sockets.on("connection", (socket) => {
        const user = socket.request.user;
        if (user) {
            console.log("Socket connected with ID: ", socket.id);
            console.log('User:', socket.request.user);
            if (user.agency_id) {
                socket.join(user.agency_id);
                console.log("Joining Room Successfully: ", user.agency_id);
            }
        }
        
        socket.on("disconnect", () => {
            console.log("Socket disconnected with ID: ", socket.id);
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
    });
});

eventManager.on("notifyNewOrderToAgency", (info) => {
    console.log("Room: ", info.room);
    _io.to(info.room).emit("notifyNewOrderToAgency", info.order);
});

module.exports = eventManager;
