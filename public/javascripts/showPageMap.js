//purpose javascript file for creating mapbox map found on the show page

mapboxgl.accessToken = mapboxToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl())

const marker1 = new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup( new mapboxgl.Popup().setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`))
.addTo(map);
 