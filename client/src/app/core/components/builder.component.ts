export class AddressBuilder {
    language: String;
    country: String;
    state: String;
    city: String;
    place: String;
    addressLine1: String;
    addressLine2: String;
    pincode: String;

    constructor() { }

    setStreetLine1(place) {
        let addressLine1 = place.address_components.find(item => item.types.includes('route'));
        if (addressLine1) {
            this.addressLine1 = addressLine1.long_name;
        } else {
            this.addressLine1 = null;
        }
        return this;
    }

    setStreetLine2(place) {
        let addressLine2 = place.address_components.find(item => item.types.includes('sublocality_level_3'));
        if (addressLine2) {
            this.addressLine2 = addressLine2.long_name;
        } else if (!addressLine2) {
            let addressLine = place.address_components.find(item => item.types.includes('sublocality_level_2'));
            if (addressLine) {
                this.addressLine2 = addressLine.long_name;
            }

        } else {
            this.addressLine2 = null;
        }
        return this;
    }

    setPlace(place) {
        let placeAddress = place.address_components.find(item => item.types.includes('sublocality_level_1'));
        if (placeAddress) {
            this.place = placeAddress.long_name;
        } else {
            this.place = null;
        }
        return this;
    }

    setCity(place) {
        let city = place.address_components.find(item => item.types.includes('locality'));
        if (city) {
            this.city = city.long_name;
        }  else if (!city) {
            let city = place.address_components.find(item => item.types.includes('postal_town'));
            if (city) {
                this.city = city.long_name;
            }

        } else {
            this.city = null;
        }
        return this;
    }

    setState(place) {
        let state = place.address_components.find(item => item.types.includes('administrative_area_level_1'));
        if (state) {
            this.state = state.long_name;
        } else {
            this.state = null;
        }
        return this;
    }

    setCountry(place) {
        let country = place.address_components.find(item => item.types.includes('country'));
        if (country) {
            this.country = country.long_name;
        } else {
            this.country = null;
        }
        return this;
    }

    setPostCode(place) {
        let pincode = place.address_components.find(item => item.types.includes('postal_code'));
        if (pincode) {
            this.pincode = pincode.long_name;
        } else {
            this.pincode = null;
        }
        return this;
    }

    build() {
        return this;
    }

}

export class LocationBuilder {
    longitude: number;
    latitude: number;

    getLat(place) {
        this.latitude = place.geometry.location.lat();
        return this;
    }

    getLang(place) {
        this.longitude = place.geometry.location.lng();
        return this;
    }

    build() {
        return this;
    }

}