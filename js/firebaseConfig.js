// firebaseConfig.js dosyasından db'yi alıyoruz
import { db } from './firebaseConfig'; 
import { 
    collection, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    writeBatch,
    orderBy,
    Timestamp 
} from "firebase/firestore";

// Utils yine gerekecek (Toast mesajları vs. için)
// import Utils from './utils';
