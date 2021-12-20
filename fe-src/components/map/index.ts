import * as MapboxClient from "mapbox";
import * as mapboxgl from "../../../node_modules/mapbox-gl/dist/mapbox-gl.js";
import { state } from "../../state";

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const mapboxClient = new MapboxClient(MAPBOX_TOKEN);

console.log(MAPBOX_TOKEN);

customElements.define(
  "map-el",
  class Map extends HTMLElement {
    constructor() {
      super();
    }
    lat = "";
    lng = "";
    zone = "";
    shadow = this.attachShadow({ mode: "open" });

    connectedCallback() {
      this.lat = this.getAttribute("lat");
      this.lng = this.getAttribute("lng");
      this.zone = this.getAttribute("zone");
      this.render();
    }

    render() {
      const container = document.createElement("div");
      container.classList.add("page__container");

      const headEl = document.createElement("head");
      const style = document.createElement("style");
      style.innerHTML = `
      @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
      *{
        box-sizing:border-box;
      }
     
      #map {
        width: 100%;
        height:200px;
      }
      .page__container{
        width: 100%;
        height:100%;
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      `;
      headEl.innerHTML = `
      <link href='https://api.mapbox.com/mapbox-gl-js/v2.6.0/mapbox-gl.css' rel='stylesheet' />
      `;
      container.innerHTML = `
      
    <div id="map"></div>
    <form class="search-form" autocomplete="off">
      <div class="field is-grouped">
        <div class="control is-expanded">
          <input class="input" type="search" name="q">
          
        </div>
        <div class="control">
         
          <button class="button is-info">Buscar</button>
        </div>
    </div>
  </form>
  
      `;

      this.shadow.appendChild(style);
      this.shadow.appendChild(headEl);
      this.shadow.appendChild(container);

      const map = this.shadow.getElementById("map");
      const form = this.shadow.querySelector(".search-form");

      const mapBox = this.initMap(map);
      this.setDefaultLocation(mapBox);
      this.initSearchForm(form, mapBox);
    }
    //setea la ubicacion la ubicacion del mapa en caso que ya exista un atributo de lat y lng
    //sirve para cuando tengo que mostrar la ubicacion de una mascota que ya fue data de alta en la database
    setDefaultLocation(map) {
      if (this.lat && this.lng) {
        const marker = new mapboxgl.Marker()
          .setLngLat({ lat: this.lat, lng: this.lng })
          .addTo(map);
        map.setCenter({ lat: this.lat, lng: this.lng });
        map.setZoom(18);
      }
      if (this.zone) {
        const inputEl = this.shadow.querySelector(".input");
        inputEl.setAttribute("placeholder", this.zone);
      }
    }

    initMap(map) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      return new mapboxgl.Map({
        container: map,
        style: "mapbox://styles/mapbox/streets-v11",
      });
    }
    //seteo el formulario de busqueda para el mapa
    initSearchForm(form, map) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        mapboxClient.geocodeForward(
          e.target.q.value,
          {
            country: "ar",
            autocomplete: true,
            language: "es",
          },
          function (err, data, res) {
            if (!err) {
              const firstResult = data.features[0];
              const zone = firstResult.text;
              const coordinates = firstResult.geometry.coordinates;

              const marker = new mapboxgl.Marker()
                .setLngLat(coordinates)
                .addTo(map);

              map.setCenter(coordinates);
              map.setZoom(18);
              //seteo en el state las coordenadas y la zona donde se peridio la mascota
              state.setPetCoordinates(coordinates, zone);
            }
          }
        );
      });
    }
  }
);
