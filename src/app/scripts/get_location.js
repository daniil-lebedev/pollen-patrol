export default function getUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ latitude, longitude });
                },
                function (error) {
                    console.error("Geolocation error:", error.message);
                    reject(error);
                },
                { timeout: 10000, maximumAge: 60000 }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}