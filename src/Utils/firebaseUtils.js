import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyDQDI-fdCzTw3kMBv_M7H5va_pmmffpmOo',
  authDomain: 'ccb-agendamento-culto.firebaseapp.com',
  databaseURL: 'https://ccb-agendamento-culto.firebaseio.com',
  projectId: 'ccb-agendamento-culto',
  storageBucket: 'ccb-agendamento-culto.appspot.com',
  messagingSenderId: '696195101988',
  appId: '1:696195101988:web:bb79d9cac21c92a2b56fb1',
};

export const firebaseImpl = firebase.initializeApp(firebaseConfig);
export const firebaseDatabase = firebase.database();
