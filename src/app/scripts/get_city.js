// Then, pass the location coordinates to a Geocoding API to get the city name

export default function showCity(latitude, longitude) {
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_REVERSE_GEO_LOCATION_KEY;
    // Make a request to a Geocoding API (e.g. Google Maps Geocoding API)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;
    // Fetch the data
    fetch(url)
        .then(response => {
            return response.json().then(data => {
                const city= data.results[0].address_components[1].long_name;
                console.log(city);
                return city;
            })
        })

}