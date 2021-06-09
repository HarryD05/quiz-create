//Import react dependency
import React from 'react';

//Importing styling
import './modal.scss';

//Creating the modal react component
const Modal = props => {
  //Extracting data from properties of component
  const { title, content } = props.data;

  return (
    <div id="modal">
      <h3>{title}</h3>

      <hr className="divider" />

      <div id="modal-content">{content}</div>

      <div id="buttons">
        <button id="modalBtn" className="btn" onClick={props.onClick}>
          Close
        </button>
      </div>
    </div>
  )
}

export default Modal;
