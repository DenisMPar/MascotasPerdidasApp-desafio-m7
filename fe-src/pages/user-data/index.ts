import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "user-data-page",
  class Userdata extends HTMLElement {
    constructor() {
      super();
    }

    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      const currentState = state.getState();
      const token = currentState.authtoken;
      this.render();
      //checkeo si existe el token para saber si debo dar de alta al user o modficar uno existente
      if (token) {
        this.setModifyUser();
      } else {
        this.setSubmitUser();
      }
      this.checkUserData();
      state.subscribe(() => {
        this.setUserData();
      });
    }
    //si el user existe recupero su data y la guardo en el state
    async checkUserData() {
      const currentState = state.getState();
      if (currentState.authtoken.token) {
        const userData = await state.getUserData();
        currentState.userData = userData;
        state.setState(currentState);
      }
    }
    //si en el state hay un username lo debo mostrar en pantalla
    setUserData() {
      const currentState = state.getState();
      if (currentState.userData) {
        const nameInput = this.shadow.querySelector(".name");
        nameInput.setAttribute("placeholder", currentState.userData.name);
      }
    }
    //seteo el formulario en caso que deba dar de alta el user
    setSubmitUser() {
      const formEl = this.shadow.querySelector(".form");

      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const target = e.target as any;
        //si las contraseñas coinciden y no son un valor vacio doy de alta al usuario
        //y elimino los inputs rojos en caso que existan
        if (
          target.password.value === target.repeatPassword.value &&
          target.password.value != ""
        ) {
          const paswordsInputs = this.shadow.querySelectorAll(".password");
          const paswordsHelpers = this.shadow.querySelectorAll(".help");
          for (const inp of paswordsInputs) {
            inp.classList.remove("is-danger");
          }
          for (const help of paswordsHelpers) {
            help.classList.add("is-hidden");
          }
          const userData = {
            name: target.name.value,
            password: target.password.value,
          };
          //si el usuario fue dado de alta lo redirijo al login
          state.signUpUser(userData).then((res) => {
            if (res.id) {
              Router.go("/password");
            } else {
              alert("ups algo salio mal");
              console.log(res);
            }
          });
        }
        //si las contraseñas no coinciden muestro los inputs en rojo
        if (target.password.value != target.repeatPassword.value) {
          const paswordsInputs = this.shadow.querySelectorAll(".password");
          const paswordsHelpers = this.shadow.querySelectorAll(".help");
          for (const inp of paswordsInputs) {
            inp.classList.add("is-danger");
          }
          for (const help of paswordsHelpers) {
            help.classList.remove("is-hidden");
          }
        }
        //si el usuario no ingreso una contraseña tambien muestro los inputs en rojo
        if (!target.password.value) {
          const paswordsInputs = this.shadow.querySelectorAll(".password");

          for (const inp of paswordsInputs) {
            inp.classList.add("is-danger");
          }
        }
      });
    }
    //seteo el formulario en caso que deba modificar el user
    setModifyUser() {
      const formEl = this.shadow.querySelector(".form");

      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const target = e.target as any;
        //si las contraseñas coinciden continuo con el update
        if (target.password.value === target.repeatPassword.value) {
          const paswordsInputs = this.shadow.querySelectorAll(".password");
          const paswordsHelpers = this.shadow.querySelectorAll(".help");
          for (const inp of paswordsInputs) {
            inp.classList.remove("is-danger");
          }
          for (const help of paswordsHelpers) {
            help.classList.add("is-hidden");
          }
          const userData = {
            name: target.name.value,
            password: target.password.value,
          };

          state.modifyUser(userData).then((res) => {
            if (res.message == "user updated") {
              alert("usuario modificado con éxito");
              Router.go("/");
            } else {
              alert("ups algo salio mal");
              console.log(res);
            }
          });
        }
        //si las contraseñas no coinciden pongo los inputs en rojo
        if (target.password.value != target.repeatPassword.value) {
          const paswordsInputs = this.shadow.querySelectorAll(".password");
          const paswordsHelpers = this.shadow.querySelectorAll(".help");
          for (const inp of paswordsInputs) {
            inp.classList.add("is-danger");
          }
          for (const help of paswordsHelpers) {
            help.classList.remove("is-hidden");
          }
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
                height:  90vh;
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
          <div class="main__container ">
          <h2 class="title is-2">Mis Datos</h2>
          <form class="form">
          <div class="field">
               <label class="label ">Nombre</label>
               <div class="control">
                   <input class="input name"  type="text" name="name"/>
               </div>
               
          </div>
          <div class="field">
               <label class="label">Contraseña</label>
               <div class="control">
                   <input class="input password"  type="password" name="password"/>
                   <p class="help is-danger is-hidden">Las contraseñas no coinciden</p>
               </div>
               <label class="label">Repetir contraseña</label>
               <div class="control">
                   <input class="input password"  type="password"  name="repeatPassword"/>
                   <p class="help is-danger is-hidden">Las contraseñas no coinciden</p>
               </div>
               
          </div>
         
          <div class="control">
          <button class="button is-medium is-link is-fullwidth">Enviar</button>
          </div>
         
          </form>
         </div>
         
              `;
      this.shadow.appendChild(styles);
      this.shadow.appendChild(container);
    }
  }
);
