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
	let totalRaised = `\$${numberWithCommas(
		Number.parseInt(data.contributionsByReport.totalContributions)
	)}`;
	let senName = data.info.displayName;
	let senFileName = data.info.fileName;
	let senParty = data.info.party;
	let senDistrict = data.info.district;
	let senCity = data.info.city;
	let container = document.createElement("div");

	container.setAttribute("class", "container");

	///// COLUMN ONE /////
	let colOne = renderElementWithClassName("div", "colOne", container);

	if (senParty === "Republican") colOne.style.backgroundColor = "#D69191";
	if (senParty === "Democrat") colOne.style.backgroundColor = "#91B9D6";

	// render photo
	let photoEnclosure = renderElementWithClassName(
		"div",
		"photo-enclosure",
		colOne
	);
	renderPhoto(senFileName, photoEnclosure);

	///// COLUMN TWO /////
	let colTwo = renderElementWithClassName("div", "colTwo", container);

	// render info data
	renderName(senName, colTwo);
	renderSenInfoElement("Party: ", senParty, colTwo);
	renderSenInfoElement("District: ", senDistrict, colTwo);
	renderSenInfoElement("City: ", senCity, colTwo);

	///// COLUMN THREE /////
	let colThree = renderElementWithClassName("div", "colThree", container);

	// render contribution total
	renderElementWithString("h2", `${senName} has raised a total of:`, colThree);
	renderElementWithString("h1", totalRaised, colThree);
	renderElementWithString("h2", "in cash and in-kind contributions", colThree);

	// render button
	let bttnEnclosure = renderElementWithClassName(
		"div",
		"button-enclosure",
		colThree
	);
	let moreBttn = renderElementWithString("button", "more", bttnEnclosure);

	///// COLUMN THREE /////

	// // handle a null dataset (i.e. some puppeteer or parse or writing error from the node.js which was pushed to firestore)
	// if (uniqueContributors.length === 0) {
	// 	// render error
	// 	renderSenInfoElement(
	// 		"Error: senator data missing: ",
	// 		`An error has occurred while fetching the contribution data for ${senName}. This is likely due to an error on Ga Media State Ethics Site, but could also be due to an error in fetching the data. `,
	// 		colThree
	// 	);
	// } else {
	// 	// if no error, render 20 contributors
	// 	renderListTopTwentyContributors(senFileName, uniqueContributors, colThree);
	// }

	// let dataRendered = false;

	// append to main
	main.appendChild(container);
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
		console.log(err);
	}
}

function renderPhoto(fileName, container) {
	try {
		let img = document.createElement("img");
		img.setAttribute("src", `./pics/${fileName}.jpg`);
		container.appendChild(img);
	} catch (err) {
		console.log("error rendering image:\n" + fileName);
		console.log(err);
	}
}

function renderName(name, container) {
	try {
		let hOne = document.createElement("h1");
		hOne.textContent = name;
		hOne.setAttribute("class", "name");
		container.appendChild(hOne);
	} catch (err) {
		console.log("error rendering name:\n" + name);
		console.log(err);
	}
}

function renderListTopTwentyContributors(
	fileName,
	uniqueContributorsArray,
	container
) {
	try {
		let ol = document.createElement("ol");
		ol.setAttribute("data-id", fileName);
		for (let i = 0; i < 20; i++) {
			let li = document.createElement("li");
			li.textContent =
				uniqueContributorsArray[i].contributor +
				", " +
				Number.parseInt(uniqueContributorsArray[i].totalContributions);
			ol.appendChild(li);
		}
		container.appendChild(ol);
	} catch (err) {
		console.log("error rendering 20 contributors:\n" + fileName);
		console.log(err);
	}
}

function renderElementWithString(element, stringToRender, container) {
	try {
		let el = document.createElement(element);
		el.innerText = stringToRender;
		container.appendChild(el);
		return el;
	} catch (err) {
		console.log(
			"error rendering element with string:\n" + element + " " + stringToRender
		);
		console.log(err);
	}
}

function renderElementWithClassName(element, className, container) {
	try {
		let el = document.createElement(element);
		el.setAttribute("class", className);
		container.appendChild(el);
		return el;
	} catch (err) {
		console.log(
			"error rendering element:\n" + element + " " + className + " " + container
		);
		console.log(err);
	}
}

function numberWithCommas(x) {
	try {
		x = x.toString();
		var pattern = /(-?\d+)(\d{3})/;
		while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
		return x;
	} catch (err) {
		console.log("error rendering number:\n" + x);
		console.log(err);
	}
}
