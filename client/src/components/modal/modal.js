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

      <div id="modal-content">{content}</div>

      <button id="modalBtn" onClick={props.onClick}>Okay</button>
    </div>
  )
}

export default Modal;