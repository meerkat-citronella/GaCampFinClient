// configure and itialize firebase
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

let albersJohnRef = storage
	.ref("AlbersJohn.jpg")
	.getDownloadURL()
	.then((url) => console.log(url));

// console.log(albersJohnRef);
