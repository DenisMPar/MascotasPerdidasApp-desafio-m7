import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "pet-card",
  class Card extends HTMLElement {
    constructor() {
      super();
    }
    petData = {
      id: "",
      name: "",
      pictureUrl: "",
      zone: "",
      condition: "",
      userId: "",
    };
    shadow = this.attachShadow({ mode: "open" });
    type: string;
    connectedCallback() {
      this.type = this.getAttribute("type");
      this.petData.id = this.getAttribute("id");
      this.petData.name = this.getAttribute("name");
      this.petData.pictureUrl = this.getAttribute("pictureUrl");
      this.petData.zone = this.getAttribute("zone");
      this.petData.condition = this.getAttribute("condition");
      this.petData.userId = this.getAttribute("userId");

      this.render();
      this.setReport();
      this.setTypeUser();
    }
    //En caso que la card sea del type user debo modificar
    //el footer para que en vez de mostrar la tarjeta de reporte me envie a editar mascota
    setTypeUser() {
      const cardFooterEl = this.shadow.querySelector(".card-footer");
      if (this.type == "user") {
        cardFooterEl.innerHTML = ` <a href="#" class="card-footer-item">Editar</a> `;
        const linkEl = this.shadow.querySelector(".card-footer-item");

        linkEl.addEventListener("click", (e) => {
          e.preventDefault();
          state.getPetData(this.petData.id).then(() => {
            Router.go("/edit");
          });
        });
      }
    }
    //agrego al funcion que muestra la tarjeta de reporte
    setReport() {
      const linkEl = this.shadow.querySelector(".card-footer-item");

      linkEl.addEventListener("click", (e) => {
        e.preventDefault();
        const currentState = state.getState();
        currentState.showReport = true;
        //guardo el petId para saber que mascota esta siendo reportada como vista
        currentState.reportPetId = this.petData.id;
        state.setState(currentState);
      });
    }

    render() {
      const container = document.createElement("div");
      const styles = document.createElement("style");

      styles.innerHTML = `
      @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
      `;
      container.classList.add("card");
      container.innerHTML = `
      <div class="card-image">
        <figure class="image is-331x147">
          <img src="${this.petData.pictureUrl}"alt="Placeholder image">
        </figure>
      </div>
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <p class="title is-4">${this.petData.name}</p>
            <p class="subtitle is-6">${this.petData.zone}</p>
          </div>
        </div>
        </div>
        <footer class="card-footer">
        <a class="card-footer-item" id="element">Reportar información</a>
      </footer>
   
        `;
      this.shadow.appendChild(styles);
      this.shadow.appendChild(container);
    }
  }
);
