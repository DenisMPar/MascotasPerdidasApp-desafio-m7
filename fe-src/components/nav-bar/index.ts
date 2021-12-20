import { Router } from "@vaadin/router";

const urlLogo = require("url:../../images/logo.svg");
customElements.define(
  "nav-bar",
  class Nav extends HTMLElement {
    constructor() {
      super();
    }
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();

      const burgerMenu = this.shadow.querySelector(".navbar-burger");
      burgerMenu.addEventListener("click", (e) => {
        e.preventDefault();
        const menuEl = this.shadow.querySelector("menu-el");
        menuEl.classList.remove("is-hidden");
      });
      const desktopMenu = this.shadow.querySelector(".desktop-menu");
      desktopMenu.addEventListener("click", (e) => {
        e.preventDefault();
        const menuEl = this.shadow.querySelector("menu-el");
        menuEl.classList.remove("is-hidden");
      });
      const menuEl = this.shadow.querySelector("menu-el");
      const buttonClose = menuEl.shadowRoot.querySelector(".delete");
      buttonClose.addEventListener("click", (e) => {
        e.preventDefault();
        const menuEl = this.shadow.querySelector("menu-el");
        menuEl.classList.add("is-hidden");
      });
      const logoEl = this.shadow.querySelector(".logo");
      logoEl.addEventListener("click", (e) => {
        e.preventDefault();
        Router.go("/");
      });
    }
    render() {
      const navEl = document.createElement("nav");
      const styles = document.createElement("style");
      navEl.classList.add("navbar");
      navEl.classList.add("has-background-link-light");
      navEl.setAttribute("role", "navigation");
      navEl.setAttribute("aria-label", "main navigation");

      styles.innerHTML = `
      @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
      `;
      navEl.classList.add("card");
      navEl.innerHTML = `
      <menu-el class="is-hidden"></menu-el>
      <div class="navbar-brand">
        <a class="navbar-item logo" >
          <img src=${urlLogo} width="112" height="28">
        </a>
    
        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
    
      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-primary desktop-menu">
                Menu
              </a>
            </div>
          </div>
        </div>
      </div>
    
        `;
      this.shadow.appendChild(styles);
      this.shadow.appendChild(navEl);
    }
  }
);
