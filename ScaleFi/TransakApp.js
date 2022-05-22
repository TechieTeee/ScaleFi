import React from 'react';
import logo from './logo.svg';
import './App.css';

import transakSDK from "@transak/transak-sdk";

const settings = {
    apiKey: 'f5e76cca-3621-458d-a2cc-35791f13c50f',
    environment: 'STAGING', // STAGING/PRODUCTION
    defaultCryptoCurrency: 'ETH',
    themeColor: '000000', // App theme color
    hostURL: window.location.origin,
    widgetHeight: "700px",
    widgetWidth: "500px",
}

export function openTransak() {
    const transak = new transakSDK(settings);

    transak.init();
}


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <button onClick={() => openTransak()}>
                    open trasak
                </button>
            </header>
        </div>
    );
}

export default App;