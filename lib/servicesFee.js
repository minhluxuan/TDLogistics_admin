const libMap = require("./map");

const calculateExpressFee = async (service_type, address_source, address_dest) => {
    const map = new libMap.Map();
    let fee;
    if(service_type === 1) {
        const addressSource = address_source.split(',');
        const sourceComponent = addressSource.slice(-4).map(part => part.trim());
        const concatSource = sourceComponent.join(', ');
        
        const addressDest = address_dest.split(',');
        const destComponent = addressDest.slice(-4).map(part => part.trim());
        const concatDest = destComponent.join(', ');

        const source = await map.convertAddressToCoordinate(concatSource);
        const destination = await map.convertAddressToCoordinate(concatDest);

        const distance = (await map.calculateDistance(source, destination)).distance;
        fee = libMap.calculateFee(distance);
    } else if(service_type === 2) {
        const addressSource = address_source.split(',');
        const sourceComponent = addressSource.slice(-4).map(part => part.trim());
        const concatSource = sourceComponent.join(', ');
        
        const addressDest = address_dest.split(',');
        const destComponent = addressDest.slice(-4).map(part => part.trim());
        const concatDest = destComponent.join(', ');

        const source = await map.convertAddressToCoordinate(concatSource);
        const destination = await map.convertAddressToCoordinate(concatDest);

        const distance = (await map.calculateDistance(source, destination)).distance;
        fee = libMap.calculateFee(distance) * 2;
    } else if(service_type === 3) {
        const addressSource = address_source.split(',');
        const sourceComponent = addressSource.slice(-4).map(part => part.trim());
        const concatSource = sourceComponent.join(', ');
        
        const addressDest = address_dest.split(',');
        const destComponent = addressDest.slice(-4).map(part => part.trim());
        const concatDest = destComponent.join(', ');

        const source = await map.convertAddressToCoordinate(concatSource);
        const destination = await map.convertAddressToCoordinate(concatDest);

        const distance = (await map.calculateDistance(source, destination)).distance;
        fee = libMap.calculateFee(distance) * 3;
    }
    
    return fee;
}


module.exports = {
    calculateExpressFee,
};