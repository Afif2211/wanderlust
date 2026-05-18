console.log("coordinates:", coordinates);
console.log("mapToken:", mapToken);
const map = L.map('map').setView(
    [coordinates[1], coordinates[0]],
    10
);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

L.marker([coordinates[1], coordinates[0]])
    .addTo(map)
    .bindPopup(listingTitle)
    .openPopup();