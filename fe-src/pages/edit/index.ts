import { state } from "../../state";
import Dropzone from "dropzone";
import { Router } from "@vaadin/router";

customElements.define(
  "edit-page",
  class Edit extends HTMLElement {
    constructor() {
      super();
    }
    petData = {
      id: "",
      name: "",
      pictureUrl: "",
      lat: 0,
      lng: 0,
      condition: "",
      userId: 0,
      zone: "",
      newPicture: false,
    };
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      const currentState = state.getState();
      this.petData = currentState.petData;
      this.render();
      this.setModifyPet();
      this.setUnpublishPet();
      this.setReportFoundPet();
      state.subscribe(() => {
        //obtengo la data de la mascota desde el state, esto es importante porque si modifico los datos de coordenadas
        //y ubicacion de la mascota se guardaran en el state y debo recuperarlos desde alli
        const currentState = state.getState();
        this.petData = currentState.petData;
      });
    }
    //seteo todas las funciones del formulario que modifica la mascota
    setModifyPet() {
      const form = this.shadow.querySelector(".form");
      //boton que sirve para subir la imagen
      const dropEl = this.shadow.querySelector(".foto-input");
      //div donde se muestra el thumbnail de la imagen
      const previewContainer = this.shadow.querySelector(".dropzone-previews");

      //creo un dropzone para subir la imagen
      const myDropzone = new Dropzone(dropEl, {
        url: "/falsa",
        autoProcessQueue: false,
        addRemoveLinks: true,
        createImageThumbnails: true,
        thumbnailMethod: "crop",
        previewsContainer: previewContainer,
        thumbnailHeight: 50,
      });
      let picture = {
        dataURL: "",
      };
      myDropzone.on("thumbnail", function (file) {
        picture = file;
      });

      form.addEventListener("submit", (e) => {
        const target = e.target as any;
        e.preventDefault();

        let petData = this.petData;
        //el formulario solo obtiene el nombre y la url de la imagen
        //los datos de zona y coordenadas vienen del state
        //por eso debo hacer un spread de petData
        //y luego modificar el nombre o la url segun corresponda
        if (target.name.value) {
          petData = {
            ...petData,
            name: target.name.value,
          };
        }
        if (picture.dataURL) {
          petData = {
            ...petData,
            pictureUrl: picture.dataURL,
            //agrego el auxiliar newPicture para saber que en el backend
            //debo ejecutar la funcion que sube una imagen nueva a cloudinary
            newPicture: true,
          };
        }
        state.editUserPet(petData).then(() => {
          Router.go("/user-pets");
        });
      });
    }
    setUnpublishPet() {
      const linkEl = this.shadow.querySelector(".unpublish");
      linkEl.addEventListener("click", (e) => {
        e.preventDefault();
        const respuesta = confirm("¿Desea despublicar su mascota?");
        if (respuesta == true) {
          state.deleteUserPet(parseInt(this.petData.id)).then((res) => {
            if (res == 1) {
              alert("mascota despublicada");
              Router.go("/user-pets");
            }
          });
        }
      });
    }
    setReportFoundPet() {
      const linkEl = this.shadow.querySelector(".report-as-found");
      linkEl.addEventListener("click", (e) => {
        e.preventDefault();
        const respuesta = confirm("¿Desea reportar como encontrado?");
        if (respuesta == true) {
          state
            .editUserPet({ condition: "found", id: this.petData.id })
            .then((res) => {
              if (res == 1) {
                Router.go("/user-pets");
              }
            });
        }
      });
    }

    render() {
      const container = document.createElement("div");
      const styles = document.createElement("style");
      styles.innerHTML = `
              @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
              .page__container{
                  display: grid;
                  grid-template-rows: 10% 90%;
                }
                .main__container{
                
                  padding:20px;
                  display: grid;
                  grid-template-rows: 1fr 4fr;
                  
                }
               
              `;
      container.classList.add("page__container");
      container.setAttribute("id", "map");
      container.innerHTML = `
              
        <nav-bar></nav-bar>
        <div class="container is-fullhd">
        <div class="main__container container">
            <h2 class="title is-2">Editar mascota perdida</h2>
            <form class="form ">
              <div class="field">
                 <label class="label ">Nombre</label>
                 <div class="control">
                     <input class="input"  type="text" name="name" placeholder="${this.petData.name}"/>
                 </div>
              </div>
              <div class="field ">
              <div class="control">
                <figure class="dropzone-previews image is-331x147 ">
                <img src=${this.petData.pictureUrl}>
                 </figure>
              </div>
          
              <div class="control ">
                 <button class="button is-medium is-primary is-fullwidth foto-input" id="pic_button" type="button">Agregar/Modificar foto</button>
              </div>
           </div>
              
              <div class="field" id="div">
              <div class="control">
              <map-el lat=${this.petData.lat} lng=${this.petData.lng} zone=${this.petData.zone}></map-el>
              </div>
              </div>
              <div class="field">
            <div class="control">
            <button class="button is-medium is-danger is-fullwidth">Guardar</button>
            </div>
            </div>
           
              <div class="block">
              <div class="control">
              <button class="button is-medium is-success is-fullwidth report-as-found" type="button">Reportar como encontrado</button>
              </div>
            </div>
           
              <div class="field">
              <div class="control is-flex is-justify-content-center">
             <a class="has-text-danger unpublish">DESPUBLICAR</a>
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
