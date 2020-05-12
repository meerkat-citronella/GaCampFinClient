// configure and itialize firebase

firebase.initializeApp(firebaseConfig);
db = firebase.firestore();

// get data from firebase and call render function
db.collection("senatorSTATS")
	.get()
	.then((snap) => {
		// console.log(snap.docs);
		snap.docs.forEach((doc) => {
			renderSenatorData(doc);
		});
	});

function renderSenatorData(doc) {
	let data = doc.data();
	let uniqueContributors = data.uniqueContributors.data;
	let senName = data.info.displayName;
	let senFileName = data.info.fileName;
	let senParty = data.info.party;
	let senDistrict = data.info.district;
	let senCity = data.info.city;
	let ol = document.createElement("ol");
	let container = document.createElement("div");

	container.setAttribute("class", "container");

	// handle a null dataset (i.e. some puppeteer or parse or writing error from the node.js which was pushed to firestore)
	if (uniqueContributors.length === 0) {
		// render photo
		renderPhoto(senFileName, container);

		// render info data
		renderName(senName, container);
		renderSenInfoElement("Party: ", senParty, container);
		renderSenInfoElement("District: ", senDistrict, container);
		renderSenInfoElement("City: ", senCity, container);

		// render error
		renderSenInfoElement(
			"Error: senator data missing: ",
			`An error has occurred while fetching the contribution data for ${senName}. This is likely due to an error on Ga Media State Ethics Site, but could also be due to an error in fetching the data. `,
			container
		);

		// append to main
		main.appendChild(container);
	}

	// if no error, render 20 contributors
	try {
		// render photo
		renderPhoto(senFileName, container);

		// render info data
		renderName(senName, container);
		renderSenInfoElement("Party: ", senParty, container);
		renderSenInfoElement("District: ", senDistrict, container);
		renderSenInfoElement("City: ", senCity, container);

		// render 20 contributors
		ol.setAttribute("data-id", senFileName);
		for (let i = 0; i < 20; i++) {
			let li = document.createElement("li");
			li.textContent =
				uniqueContributors[i].contributor +
				", " +
				uniqueContributors[i].totalContributions;
			ol.appendChild(li);
		}
		container.appendChild(ol);

		// append to main
		main.appendChild(container);
	} catch (err) {
		console.log(senName, err);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// helper functions
function renderSenInfoElement(keyString, valueString, container) {
	try {
		let head = document.createElement("h3");
		head.innerText = keyString;
		container.appendChild(head);
		let p = document.createElement("p");
		p.innerText = valueString;
		container.appendChild(p);
	} catch (err) {
		console.log(
			"error rendering some element\n" + keyString + "\n" + valueString
		);
	}
}

function renderPhoto(fileName, container) {
	try {
		let img = document.createElement("img");
		img.setAttribute("src", `./pics/${fileName}.jpg`);
		container.appendChild(img);
	} catch (err) {
		console.log("error rendering image:\n" + fileName);
	}
}

function renderName(name, container) {
	try {
		let hTwo = document.createElement("h2");
		hTwo.textContent = name;
		container.appendChild(hTwo);
	} catch (err) {
		console.log("error rendering name:\n" + name);
		console.log(err);
	}
}
