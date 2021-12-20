import { state } from "../../state";

customElements.define(
  "home-page",
  class Home extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    showPets = true;

    connectedCallback() {
      this.render();
      this.getCoordinates();
      state.subscribe(() => {
        const currentState = state.getState();
        //si existe en el state el dato petsAround el user ya dio su ubicacion
        //por lo tanto puedo mostrar las mascotas cercanas
        if (currentState.petsAround) {
          //el auxiliar show pets, sirve para que no se vuelvan a imprimir las cards con cada modificacion del state
          if (this.showPets) {
            this.showPetsAround();
          }
        }
        this.showReportCardComponent();
      });
    }
    //obtengo la ubicacion del usuario
    getCoordinates() {
      const buttonEl = this.shadow.querySelector(".button");
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault();
        var options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        };

        function success(pos) {
          var crd = pos.coords;
          console.log(crd);
          const coordinates = {
            lat: crd.latitude,
            lng: crd.longitude,
          };
          state.setUserCoordinates(coordinates);
        }

        function error(err) {
          console.warn("ERROR(" + err.code + "): " + err.message);
        }

        navigator.geolocation.getCurrentPosition(success, error, options);
      });
    }
    //muestro las moscotas cercanas
    showPetsAround() {
      const currentState = state.getState();
      const containerEl = this.shadow.querySelector(".cards__container");
      const petsAround = currentState.petsAround;

      //escondo el div que pide la ubicacion al user
      const getUbicationContainer = this.shadow.querySelector(
        ".ubication-check__container"
      );
      getUbicationContainer.classList.add("is-hidden");

      //si petsAround tiene elementos dentro debo mostrarlos como cards, en caso contrario debo mostrar
      //el cartel "no hay mascotas cercanas"
      if (petsAround.length > 0) {
        for (const pet of petsAround) {
          if (pet.condition === "lost") {
            const cardEl = document.createElement("pet-card");
            cardEl.setAttribute("id", pet.id);
            cardEl.setAttribute("name", pet.name);
            cardEl.setAttribute("pictureUrl", pet.pictureUrl);
            cardEl.setAttribute("zone", pet.zone);
            cardEl.setAttribute("condition", pet.condition);
            cardEl.setAttribute("userId", pet.id);
            containerEl.appendChild(cardEl);
          }
        }
      } else {
        const titleEl = document.createElement("h5");
        titleEl.classList.add("title");
        titleEl.classList.add("is-5");
        titleEl.classList.add("has-text-info");
        titleEl.innerText = "No hay mascotas reportadas cerca tuyo";
        containerEl.appendChild(titleEl);
      }
      this.showPets = false;
    }
    //muestro la tarjeta de reporte de mascota
    showReportCardComponent() {
      const currentState = state.getState();
      if (currentState.showReport) {
        const reportCardEl = this.shadow.querySelector("report-card");
        reportCardEl.classList.remove("is-hidden");
      }
      if (currentState.showReport == false) {
        const reportCardEl = this.shadow.querySelector("report-card");
        reportCardEl.classList.add("is-hidden");
      }
    }
    render() {
      const containerEl = document.createElement("div");
      const styles = document.createElement("style");

      styles.innerHTML = `
      @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
      
    
      .page__container{
        display: grid;
        grid-template-rows: 10% 90%;
      }
      
      .main__container{
        
        height:  90vh;;
        padding:20px;
        display: grid;
        grid-template-rows: 1fr 3fr;
      }
      .menu__container{
        padding:20px;
        height: 50vh;
        align-self:center;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .ubication-check__container{
        
        display: flex;
        flex-direction: column;
        
      }
      .cards__container{
        padding: 20px 0 20px 0;
        display: flex;
        flex-direction: column;
        gap:25px;
      }
      
      `;
      containerEl.classList.add("page__container");

      containerEl.innerHTML = `
      
      
     <nav-bar></nav-bar>
     <div class="main__container container">
     <report-card class="is-hidden"></report-card>
      <h1 class="title is-1">Mascotas perdidas cerca tuyo</h1>
        <div class="cards__container ">
            <div class="ubication-check__container">
                <h5 class="title is-5">Para ver las mascotas reportadas cerca tuyo necesitamos permiso para conocer tu ubicación.</h5>
                <button class="button is-link"> Dar mi ubicacion </button>
            </div> 

        </div>
     </div>
  
  
      
        `;
      this.shadow.appendChild(styles);
      this.shadow.appendChild(containerEl);
    }
  }
);
