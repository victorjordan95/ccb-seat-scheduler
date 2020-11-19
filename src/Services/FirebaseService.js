import {
  firebaseDatabase
} from '../Utils/firebaseUtils';

export default class FirebaseService {
  static getDataList = (nodePath, callback, size = 10) => {
    const query = firebaseDatabase.ref(nodePath).limitToLast(size);

    query.on('value', dataSnapshot => {
      const items = [];
      dataSnapshot.forEach(childSnapshot => {
        const item = childSnapshot.val();
        item.key = childSnapshot.key;
        items.push(item);
      });
      callback(items);
    });

    return query;
  };

  static pushData = (node, objToSubmit) => {
    const ref = firebaseDatabase.ref(node).push();
    const id = firebaseDatabase.ref(node).push().key;
    ref.set(objToSubmit);
    return id;
  };

  static updateData = (path, obj) => {
    return firebaseDatabase.ref(path).set({
      ...obj
    });
  };
}
