//Importing react dependencies
import React, { createContext, useState } from 'react';

//Creating the context 
export const ModalContext = createContext();

//Creating the modal context provider
export default (props) => {
  const { children } = props;
  //Extracting the react components within the Provider 

  //Setting up the variables within the context
  const [isModalShowing, setIsModalShowing] = useState(null);
  const [info, setInfo] = useState({ title: '', content: '' });

  //Public function used to update the info within the modal
  //Once this function is called the modal will be displayed
  const updateModal = (info_) => {
    setInfo({ ...info_ });
    setIsModalShowing(true);
  }

  //Public function used to remove the info within the modal
  //Once this function is called the modal will no longer display
  const clearModal = () => {
    setIsModalShowing(false)
    setInfo({ title: '', content: '' });

    const modalClose = new CustomEvent('modalClosed', {
      bubbles: true,
      cancelable: true,
      composed: false
    })

    document.getElementById('main').dispatchEvent(modalClose);
  }

  return (
    <div>
      <ModalContext.Provider value={
        { isModalShowing, info, updateModal, clearModal }
      }>
        {children}
      </ModalContext.Provider>
    </div>
  )
}
