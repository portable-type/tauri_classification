import { getFirestore, addDoc, collection, initializeFirestore } from "firebase/firestore";
import { app } from "./firebase";
import { countData, getCollectionData } from "./data";

const db = getFirestore(app);

const firestore = initializeFirestore(app, {});

const splitData = async (email) => {
    
    const count_eisa = await countData(email, 'Eisa');
    const count_not_eisa = await countData(email, 'NotEisa');
    const trainEisa = Math.floor(count_eisa * 0.8);
    const trainNotEisa = Math.floor(count_not_eisa * 0.8);
    const collectioneisa = await getCollectionData(email, 'Eisa');
    const collectionnoteisa = await getCollectionData(email, 'NotEisa');
    
    for (let i = 0; i < count_eisa; i++) {
        if (i < trainEisa) {
            const trainaisa = await addDoc(collection(db, 'users', email, 'model', 'train', 'Eisa'), {
                fileName: collectioneisa[i]
            });
            trainaisa;
            console.log(trainaisa);
        } else {
            const testaisa = await addDoc(collection(db, 'users', email, 'model', 'test', 'Eisa'), {
                fileName: collectioneisa[i]
            });
            testaisa;
        }
    }
    for (let i = 0; i < count_not_eisa; i++) {
        if (i < trainNotEisa) {
            const trainnaisa = await addDoc(collection(db, 'users', email, 'model', 'train', 'NotEisa'), {
                fileName: collectionnoteisa[i]
            });
            trainnaisa;
        } else {
            const testnaisa =await addDoc(collection(db, 'users', email, 'model', 'test', 'NotEisa'), {
                fileName: collectionnoteisa[i]
            });
            testnaisa;
        }
    }
}

export { splitData }