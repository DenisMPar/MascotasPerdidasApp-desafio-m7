import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "password-page",
  class Login extends HTMLElement {
    constructor() {
      super();
    }
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();
      this.setFormSubmit();
    }
    setFormSubmit() {
      const form = this.shadow.querySelector(".form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const target = e.target as any;
        const currentState = state.getState();

        const login = await state.signInUser(target.password.value);
        if (login) {
          //si el login fue correcto debo verificar si existe un redirect para enviar al user a esa pagina o al home
          if (currentState.redirect) {
            Router.go(currentState.redirect);
          } else {
            Router.go("/");
          }
        } else {
          //si el login fue incorrecto muestro el cartel de contraseña incorrecta
          const paswordsHelp = this.shadow.querySelector(".help");
          paswordsHelp.classList.remove("is-hidden");
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
              height:  90vh;;
              padding:20px;
              display: grid;
              grid-template-rows: 1fr 3fr;
              
            }
            .title{
               text-align:center;
               place-self:center;
            }
            .form{
              width:100%;
              max-width:700px;
              justify-self:center;
            }
          `;
      container.classList.add("page__container");
      container.innerHTML = `
          
        <nav-bar></nav-bar>
        <div class="main__container">
        <h2 class="title is-2">Ingresar</h2>
        <form class="form">
        <div class="field">
             <label class="label">Contraseña</label>
             <div class="control">
                 <input class="input"  type="password" placeholder="contraseña" name="password"/>
                 <p class="help is-danger is-hidden">Contraseña incorrecta</p>
             </div>
             <a href="#" class="card-footer-item">Olvide mi contraseña</a>
        </div>
        <button class="button is-link is-fullwidth">Enviar</button>
        </form>
       </div>
       
            `;
      this.shadow.appendChild(styles);
      this.shadow.appendChild(container);
    }
  }
);
