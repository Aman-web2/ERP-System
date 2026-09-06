import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import App from './App';
import './index.css';
import AnimationProvider from './components/animation/AnimationProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AnimationProvider>
          <App />
        </AnimationProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

