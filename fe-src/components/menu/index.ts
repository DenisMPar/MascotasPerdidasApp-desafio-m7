import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "menu-el",
  class Nav extends HTMLElement {
    constructor() {
      super();
    }
    userEmail: "";
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      const currentState = state.getState();
      this.userEmail = currentState.userEmail;
      this.render();
      this.setLogin();
      this.redirectToLogin();
      this.setUserName();
    }
    //muestra en el menu si el usuario esta logeado
    setUserName() {
      if (this.userEmail) {
        const titleEl = this.shadow.querySelector(".title");

        titleEl.innerHTML = this.userEmail;
        const titleContainer = this.shadow.querySelector(
          ".user-name_container"
        );
        titleContainer.classList.remove("is-hidden");

        const loginButton = this.shadow.querySelector(".login_container");
        loginButton.classList.add("is-hidden");
      }
    }
    //elimina el username cuando este se deslogea
    removeUserName() {
      const titleContainer = this.shadow.querySelector(".user-name_container");
      titleContainer.classList.add("is-hidden");

      const loginButton = this.shadow.querySelector(".login_container");
      loginButton.classList.remove("is-hidden");
    }
    //seteo las funciones de los botones de login y logout en el menu
    setLogin() {
      const loginButtonEl = this.shadow.querySelector(".login-button");
      loginButtonEl.addEventListener("click", (e) => {
        e.preventDefault();
        Router.go("/login");
      });
      const logoutLinkEl = this.shadow.querySelector(".link");
      logoutLinkEl.addEventListener("click", (e) => {
        e.preventDefault();
        state.logOutUser();
        this.removeUserName();
      });
    }
    //setea las funciones de los botones del menu
    redirectToLogin() {
      const menuButtonsEls = this.shadow.querySelectorAll(".is-link");
      for (const button of menuButtonsEls) {
        button.addEventListener("click", () => {
          const currentState = state.getState();
          //redirige al login cuando se elige una opcion del menu que necesita una sesion activa
          if (!currentState.authtoken) {
            Router.go("/login");
            //el dato redirect me sirve para redireccionar a la pagina que corresponda luego de que el user se loguee
            currentState.redirect = button.id;
            state.setState(currentState);
          } else {
            Router.go(button.id);
          }
        });
      }
    }
    render() {
      const container = document.createElement("div");
      const styles = document.createElement("style");

      container.classList.add("menu");

      styles.innerHTML = `
        @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
    
        .menu{
            display:flex;
            flex-direction:column;
            justify-content:space-evenly;
            background-color:hsl(219, 70%, 96%);
            width:100%;
            
            height:100vh;
            position:absolute;
            z-index:5;
            
        }
        .delete__container{
         display:flex;
         justify-content:end;
         margin:20px 20px;
        }
        .menu__container{
            width:100%;
            max-width:600px;
            height:100%%;
            display:flex;
            flex-direction:column;
            justify-content:center;
            padding:60px;
            gap:40px;
            place-self:center;
        }
        .session_container{
            display:flex;
            flex-direction:column;
            align-items:center;
        }

        `;

      container.innerHTML = `
      <div class="delete__container">
      <button class="delete is-large"></button>
      </div>
      <div class="menu__container">
      <button class="button is-link is-large" id="user-data">Mis datos</button>
      <button class="button is-link is-large" id="user-pets">Mis mascotas perdidas</button>
      <button class="button is-link is-large" id="report">Reportar mascota</button>
      </div>
      <div class="session_container">
      <div class="login_container">
      <button class="button login-button">Log in</button>
      </div>
      <div class="user-name_container is-hidden">
      <h5 class="title is-5"></h3>
      <a class="link">CERRAR SESIÓN</a>
      </div>
      </div>
      
          `;
      this.shadow.appendChild(styles);
      this.shadow.appendChild(container);
    }
  }
);
