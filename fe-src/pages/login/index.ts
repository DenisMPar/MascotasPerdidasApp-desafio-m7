import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "login-page",
  class Login extends HTMLElement {
    constructor() {
      super();
    }
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();
      this.checkEmail();
    }
    //al ingresar el email chekeo si el user existe para enviarlo al signin
    // y si no existe lo envio a la pantalla de signup
    checkEmail() {
      const formEl = this.shadow.querySelector(".form");
      formEl.addEventListener("submit", async (e) => {
        e.preventDefault();
        const target = e.target as any;

        const currentState = state.getState();
        currentState.userEmail = target.email.value;
        state.setState(currentState);

        const checked = await state.checkUserEmail(target.email.value);

        if (checked.user === true) {
          Router.go("/password");
        } else {
          Router.go("/user-data");
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
           
            height:90vh;
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
           <label class="label">Email</label>
           <div class="control">
               <input class="input"  type="text" placeholder="Text input" name="email"/>
           </div>
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
