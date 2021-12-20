import { state } from "../../state";

customElements.define(
  "report-card",
  class Card extends HTMLElement {
    constructor() {
      super();
    }
    shadow = this.attachShadow({ mode: "open" });

    connectedCallback() {
      this.render();
      this.setDeleteButton();
      this.setReportPet();
    }
    //boton que oculta la tarjeta de reporte
    setDeleteButton() {
      const deleteButtonEl = this.shadow.querySelector(".delete");
      deleteButtonEl.addEventListener("click", (e) => {
        const currentState = state.getState();
        currentState.showReport = false;
        state.setState(currentState);
      });
    }
    //seteo el formulario que va a enviar los datos de reporte
    setReportPet() {
      const formEl = this.shadow.querySelector("form");
      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const target = e.target as any;
        const currentState = state.getState();
        const report = {
          petId: currentState.reportPetId,
          name: target.name.value,
          phone: target.phone.value,
          message: target.message.value,
        };
        //mando toda la informacion al state
        state.sendReportMessage(report).then((res) => {
          //en caso que el reporte se haya enviado muestro una alerta y oculto la tarjeta de reporte
          if (res.message) {
            alert("Reporte enviado con éxito");
            const currentState = state.getState();
            currentState.showReport = false;
            state.setState(currentState);
          }
        });
      });
    }
    render() {
      const container = document.createElement("div");
      const styles = document.createElement("style");

      styles.innerHTML = `
        @import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css";

        .box{
            background-color:hsl(217, 71%, 53%);
            width:314px;
            height:80vh;
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            
            z-index:6;
    
          }
          @media (min-width: 760px) {
            .box {
              width:450px;
            }
          }
          .container-delete{
            display:flex;
            justify-content:right;
          }
          .form{
            margin-top: 40px;
          }
          .title{
            margin-top: 40px;
          }
         
        `;
      container.classList.add("box");

      container.innerHTML = `
     
      <div class="container-delete">
      <button class="delete"></button>
      </div>
   <h2 class="title has-text-white">Reportar info de boby</h2>
     <form class="form">
       <div class="field">
            <label class="label ">Tu nombre</label>
            <div class="control">
                <input class="input"  type="textt" name="name" autocomplete="off"/>
            </div>
       </div>
       <div class="field">
            <label class="label">Tu teléfono</label>
            <div class="control">
                <input class="input"  type="textt" name="phone" autocomplete="off"/>
            </div>
       </div>
       <div class="field">
            <label class="label">Donde lo viste?</label>
            <div class="control">
               <textarea class="textarea"  name="message"></textarea>
            </div>
       </div>
      
       <button class="button is-success is-fullwidth">Enviar</button>
      
       </form>
    
     
          `;
      this.shadow.appendChild(container);
      this.shadow.appendChild(styles);
    }
  }
);
