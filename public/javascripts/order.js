const socket = io("http://localhost:5000");
const notificationArea = document.querySelector("#notificationArea");

const createNewOrder = (e) => {
    e.preventDefault();

    const source = document.getElementById("source").value;
    const destination = document.getElementById("destination").value;

    console.log(source, destination);

    socket.emit("notifyNewOrderFromUser", new Object({
        source,
        destination
    }));
}

document.querySelector("#submit").addEventListener('click', createNewOrder);

socket.on("notifySuccessCreatedNewOrder", message => {
    const p = document.createElement("p");
    p.innerText = message;
    notificationArea.appendChild(p);
});

socket.on("notifyFailCreatedNewOrder", message => {
    const p = document.createElement("p");
    p.innerText = message;
    notificationArea.appendChild(p);
});