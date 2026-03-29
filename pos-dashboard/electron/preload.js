// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posAPI', {
  // Printing support (silent printing for receipts)
  printReceipt: () => ipcRenderer.send('print-receipt'),
  // Generic hardware scanning/barcodes
  onBarcodeScan: (callback) => ipcRenderer.on('barcode-scan', (_event, value) => callback(value)),
  // System info checking or pos hardware initialization
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  openDevTools: () => ipcRenderer.send('open-devtools')
});
