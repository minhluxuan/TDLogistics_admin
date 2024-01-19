class Map {
    constructor() {
        try {
            this._googleMapsClient = require('@google/maps').createClient({
                key: process.env.GOOGLE_API_KEY,
            });
        } catch (error) {
            console.log(error);
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
    }

    seperate = (str) => {
        const arr = str.split(" ");
        const result = {
            distance: parseFloat(arr[0]),
            unit: arr[1]
        }

        if (result.unit === 'm') {
            result.distance /= 1000;
        }

        return result;
    }

    convertCoordinateToAddress = (coordinate) => {
        return new Promise((resolve, reject) => {
            try {
                const latlng = {
                    lat: coordinate.lat,
                    lng: coordinate.long
                };
                
                this._googleMapsClient.reverseGeocode({ latlng }, (error, response) => {
                    if (!error) {
                        resolve(response.json.results[0].formatted_address);
                    }
                    else {
                        console.error('Error in reverse geocoding:', error);
                        reject("Đã xảy ra lỗi. Vui lòng thử lại sau.");
                    }
                });
            } catch (error) {
                console.error('Error loading Google Maps API:', error.message);
                reject("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
        }
    )};
    
    calculateDistance = (source, destination) => {
        return new Promise((resolve, reject) => {
            try {
                const latlng1 = {
                    lat: source.lat,
                    lng: source.long
                };
                
                const latlng2 = {
                    lat: destination.lat,
                    lng: destination.long,
                };
                
                // Sử dụng hàm geolib.getDistance để tính khoảng cách giữa hai điểm
                this._googleMapsClient.distanceMatrix({
                    origins: [latlng1],
                    destinations: [latlng2],
                }, (error, response) => {
                    if (!error) {
                        const result = response.json.rows[0].elements[0].distance.text;
                        resolve(this.seperate(result));
                    } else {
                        console.error('Error in distance calculation:', error);
                        reject("Đã xảy ra lỗi. Vui lòng thử lại sau.");
                    }
                });
            } 
            catch (error) {
                console.error('Error loading Google Maps API:', error.message);
                reject("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
        });
    }
}

const calculateFee = (distance) => {
    return distance * 100;
}

module.exports = {
    Map,
    calculateFee,
}