import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export default (props) => {
  const { children } = props;

  const [isModalShowing, setIsModalShowing] = useState(null);
  const [info, setInfo] = useState({ title: '', content: '' });

  const updateModal = (info_) => {
    setIsModalShowing(true);
    setInfo(info_);
  }

  const clearModal = () => {
    setIsModalShowing(false)
    setInfo({ title: '', content: '' });
  }

  return (
    <div>
      <ModalContext.Provider value={{ isModalShowing, setIsModalShowing, info, setInfo, updateModal, clearModal }}>
        {children}
      </ModalContext.Provider>
    </div>
  )
}
