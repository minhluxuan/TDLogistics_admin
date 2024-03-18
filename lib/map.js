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
            distance: parseFloat(arr[0].replace(/,/g, "")),
            unit: arr[1]
        }
        console.log(result);
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

    convertAddressToCoordinate = (address) => {
        return new Promise((resolve, reject) => {
            try {
                this._googleMapsClient.geocode({ address }, (error, response) => {
                    if (!error) {
                        const location = response.json.results[0].geometry.location;
                        const coordinates = {
                            lat: location.lat,
                            long: location.lng,
                        };
                        resolve(coordinates);
                    } else {
                        console.error('Error in geocoding:', error);
                        reject("Đã xảy ra lỗi. Vui lòng thử lại sau.");
                    }
                });
            } catch (error) {
                console.error('Error loading Google Maps API:', error.message);
                reject("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
        });
    }

    convertFullPlusCodeToAddressVietnamese = (fullPlusCode) => {
        return new Promise((resolve, reject) => {
            try {
                const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullPlusCode)}&language=vi&key=${process.env.GOOGLE_API_KEY}`;

                fetch(geocodingUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'OK' && data.results.length > 0) {
                            const formattedAddress = data.results[0].formatted_address;
                            resolve(formattedAddress);
                        } else {
                            reject("No results found for the given Plus Code.");
                        }
                    })
                    .catch(error => {
                        console.error('Error in geocoding:', error);
                        reject("An error occurred. Please try again later.");
                    });
            } catch (error) {
                console.error('Error loading Google Maps API:', error.message);
                reject("An error occurred. Please try again later.");
            }
        });
    }
    
    calculateDistanceByHaversineFormula(latlng1, latlng2) {
        const lng1 =  latlng1.long * Math.PI / 180;
        const lng2 = latlng2.long * Math.PI / 180;
        const lat1 = latlng1.lat * Math.PI / 180;
        const lat2 = latlng2.lat * Math.PI / 180;

        let dlng = lng2 - lng1; 
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2)
            + Math.cos(lat1) * Math.cos(lat2)
            * Math.pow(Math.sin(dlng / 2), 2);
        
        let c = 2 * Math.asin(Math.sqrt(a));
        const r = 6371;

        return c * r;
    }

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
                        const result = response.json.rows[0].elements[0].distance.text;console.log(result);
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
module.exports = {
    Map,
}