//Import react dependency
import React from 'react';

//Importing assets 
import CrossSVG from '../../assets/cross.svg';

//Importing styling
import './modal.scss';

//Creating the modal react component
const Modal = props => {
  //Extracting data from properties of component
  const { title, content } = props.data;

  return (
    <div id="modal">
      <button id="close-button" onClick={props.onClick}>
        <img src={CrossSVG} alt="cross" />
      </button>

      <div id="main">
        <div id="header">
          <h3>{title}</h3>
        </div>

        <div id="modal-content">
          {content}
        </div>
      </div>
    </div>
  )
}

export default Modal;
