import { state } from "../../state";
import Dropzone from "dropzone";
import { Router } from "@vaadin/router";

customElements.define(
  "report-page",
  class Report extends HTMLElement {
    constructor() {
      super();
    }
    pictureUrl = "";
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();
      this.sendPetReport();
      this.setCancelButton();
    }
    sendPetReport() {
      const form = this.shadow.querySelector(".form");
      //boton que sirve para subir la imagen
      const dropEl = this.shadow.querySelector(".foto-input");
      //div donde se muestra el thumbnail
      const previewContainer = this.shadow.querySelector(".dropzone-previews");

      //creo un nuevo dropzone
      const myDropzone = new Dropzone(dropEl, {
        url: "/falsa",
        autoProcessQueue: false,
        addRemoveLinks: true,
        createImageThumbnails: true,
        thumbnailMethod: "crop",
        previewsContainer: previewContainer,
        thumbnailHeight: 50,
      });
      let picture;
      //obtengo la url de la imagen
      myDropzone.on("thumbnail", function (file) {
        picture = file;
      });
      //envio todos los datos de la mascota al backend
      form.addEventListener("submit", (e) => {
        const currentState = state.getState();

        const target = e.target as any;
        e.preventDefault();
        const petData = {
          name: target.name.value,
          lat: currentState.coordinates.lat,
          lng: currentState.coordinates.lng,
          condition: "lost",
          pictureUrl: picture.dataURL,
          zone: currentState.petZone,
        };
        state.reportPet(petData).then(() => {
          Router.go("/user-pets");
        });
      });
    }
    setCancelButton() {
      const buttonEl = this.shadow.querySelector(".cancel-button");
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault();
        Router.go("/");
      });
    }

    render() {
      const container = document.createElement("div");
      const styles = document.createElement("style");
      styles.innerHTML = `
              @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
              *{
                box-sizing:border-box;
              }
              .page__container{
                  display: grid;
                  grid-template-rows: 10% 90%;
                }
                .main__container{
                
                  padding:20px;
                  display: grid;
                  grid-template-rows: 1fr 4fr;
                  
                }
                .dropzone-previews{
                  min-height:200px;
                  border: solid 2px black;
                }
               
              `;
      container.classList.add("page__container");
      container.setAttribute("id", "map");
      container.innerHTML = `
              
        <nav-bar></nav-bar>
        <div class="container is-fullhd">
        <div class="main__container">
            <h2 class="title is-2">Reportar mascota perdida</h2>
            <form class="form ">
              <div class="field">
                 <label class="label ">Nombre</label>
                 <div class="control">
                     <input class="input"  type="text" name="name"/>
                 </div>
              </div>
              <div class="field ">
                 <div class="control">
                   <figure class="dropzone-previews image is-331x147 ">
                   
                    </figure>
                 </div>
             
                 <div class="control ">
                    <button class="button is-medium is-primary is-fullwidth foto-input" id="pic_button" type="button">Agregar/Modificar foto</button>
                 </div>
              </div>
              <div class="field" id="div">
              <div class="control">
              <map-el></map-el>
              </div>
              </div>
              <div class="field">
            <div class="control">
            <button class="button is-medium is-danger is-fullwidth">Reportar como perdido</button>
            </div>
            </div>
           
              <div class="field">
              <div class="control">
              <button class="button is-medium is-warning is-fullwidth cancel-button" type="button">Cancelar</button>
              </div>
            </div>
           
            
           
            </form>
            </div>
           </div>
       
                `;

      this.shadow.appendChild(styles);
      this.shadow.appendChild(container);
    }
  }
);
