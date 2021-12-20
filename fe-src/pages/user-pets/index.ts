import { state } from "../../state";

customElements.define(
  "user-pets-page",
  class Userpets extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });

    connectedCallback() {
      state.getUserPets();
      this.render();
      state.subscribe(() => {
        this.getUserPets();
      });
    }
    //obtiene las mascotas reportadas del usuario
    getUserPets() {
      const currentState = state.getState();
      const containerEl = this.shadow.querySelector(".cards__container");
      const userPets = currentState.userPets;
      if (userPets.length > 0) {
        //por cada mascota creo un componente petcard con sus atributos
        for (const pet of userPets) {
          const cardEl = document.createElement("pet-card");
          cardEl.setAttribute("type", "user");
          cardEl.setAttribute("id", pet.id);
          cardEl.setAttribute("name", pet.name);
          cardEl.setAttribute("pictureUrl", pet.pictureUrl);
          cardEl.setAttribute("zone", pet.zone);
          cardEl.setAttribute("condition", pet.condition);
          cardEl.setAttribute("userId", pet.id);
          containerEl.appendChild(cardEl);
        }
      } else {
        const titleEl = document.createElement("h5");
        titleEl.classList.add("title");
        titleEl.classList.add("is-5");
        titleEl.classList.add("has-text-info");
        titleEl.innerText = "Aun no tienes mascotas reportadas";
        containerEl.appendChild(titleEl);
      }
    }

    render() {
      const containerEl = document.createElement("div");
      const styles = document.createElement("style");

      styles.innerHTML = `
        @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";
        
      
        .container{
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
        .report-card{
          position: fixed;
          width:100%;
          height:100%;
          z-index:5;
        }
       
      
        `;
      containerEl.classList.add("container");

      containerEl.innerHTML = `
      
    
        <nav-bar ></nav-bar>
        
      <div class="main__container">
        <h1 class="title is-1">Mis mascotas reportadas</h1>
          <div class="cards__container ">
          </div>
       </div>
    
    
        
          `;
      this.shadow.appendChild(styles);
      this.shadow.appendChild(containerEl);
    }
  }
);
