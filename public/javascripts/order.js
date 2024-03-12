const socket = io("http://localhost:5000");
const notificationArea = document.querySelector("#notificationArea");

const createNewOrder = (e) => {
    e.preventDefault();
    const newOrder = new Object({
        // name_receiver: document.getElementById("name_receiver").value,	
        // phone_number_receiver: document.getElementById("phone_receiver").value,
        // mass: parseFloat(document.getElementById("mass").value),
        // height: parseFloat(document.getElementById("height").value),
        // width: parseFloat(document.getElementById("width").value),
        // length: parseFloat(document.getElementById("length").value),
        // long_source: parseFloat(document.getElementById("long_source").value),
        // lat_source: parseFloat(document.getElementById("lat_source").value),
        // long_destination: parseFloat(document.getElementById("long_destination").value),
        // lat_destination: parseFloat(document.getElementById("lat_destination").value),
        // province_source: document.getElementById("province_source").value,
        // district_source: document.getElementById("district_source").value,
        // ward_source: document.getElementById("ward_source").value,
        // detail_source: document.getElementById("detail_source").value,	
        // province_dest: document.getElementById("province_dest").value,
        // district_dest: document.getElementById("district_dest").value,
        // ward_dest: document.getElementById("ward_dest").value,
        // detail_dest:document.getElementById("detail_dest").value,	
        // COD: parseFloat(document.getElementById("COD").value),
        // service_type: parseInt(document.getElementById("service_type").value)
    });

    socket.emit("notifyNewOrderFromUser", newOrder);
}

document.querySelector("#submit").addEventListener('click', createNewOrder);

socket.on("notifyError", message => {
    const p = document.createElement("p");
    p.innerText = message;
    notificationArea.appendChild(p);
});

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