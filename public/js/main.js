// configure and itialize firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

/////////////// RENDER TOPS ///////////////
let tops = document.querySelector(".tops");

// small tops
// db.collection("metaSTATS")
// 	.doc("metaSTATSpartial")
// 	.get()
// 	.then((doc) => {
// 		renderTops(5, ".tops", doc);
// 	});

// renderElementWithString("p", "(click to see more, below)", tops);

// full tops
db.collection("metaSTATS")
	.doc("metaSTATSpartial")
	.get()
	.then((doc) => {
		renderTops(50, ".full-tops-ol-container", doc);
	});

// dropdown toggle (JQuery)
$(document).ready(() => {
	$(`.tops`).click(() => {
		$(`.full-tops`).toggleClass("hidden");
	});
});

/////////////// RENDER SENATORS ///////////////
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
	// firebase data handles
	let data = doc.data();
	let senName = data.info.displayName;
	let senFileName = data.info.fileName;
	let senParty = data.info.party;
	let senDistrict = data.info.district;
	let senCity = data.info.city;
	let reports = data.contributionsByReport.data;
	let uniqueContributors = data.uniqueContributors.data;
	let totalRaised = `\$${numberWithCommas(
		Number.parseInt(data.contributionsByReport.totalContributions)
	)}`;
	let lastUpdated = data.lastUpdated;

	let main = document.getElementById("main");

	// render containers
	let container = renderElementWithClassName("div", "container", main);
	let headContainer = renderElementWithClassName(
		"div",
		`head-container container-${senFileName}`,
		container
	);
	let headColOne = renderElementWithClassName(
		"div",
		"headColOne",
		headContainer
	);
	let headColTwo = renderElementWithClassName(
		"div",
		"headColTwo",
		headContainer
	);
	let headColThree = renderElementWithClassName(
		"div",
		"headColThree",
		headContainer
	);
	let dropdownContainer = renderElementWithClassName(
		"div",
		`hidden dropdown-container dropdown-container-${senFileName}`,
		container
	);

	///// HEAD /////
	// col 1
	if (senParty === "Republican")
		headColOne.style.backgroundColor = "hsla(5, 36%, 80%, 1)";
	if (senParty === "Democrat")
		headColOne.style.backgroundColor = "hsla(214, 32%, 83%, 1)";

	// render photo
	let photoEnclosure = renderElementWithClassName(
		"div",
		"photo-enclosure",
		headColOne
	);
	renderPhoto(senFileName, photoEnclosure);

	// col 2
	// render info data
	renderName(senName, headColTwo);
	renderSenInfoElement("Party: ", senParty, headColTwo);
	renderSenInfoElement("District: ", senDistrict, headColTwo);
	renderSenInfoElement("City: ", senCity, headColTwo);

	// col 3
	// render contribution total
	renderElementWithString(
		"p",
		`${senName} has raised a total of:`,
		headColThree
	);
	renderElementWithString("h1", totalRaised, headColThree);
	renderElementWithString(
		"p",
		"in itemized cash and in-kind contributions",
		headColThree
	);

	///// DROP DOWN /////
	// render last updated
	renderSenInfoElement("Last updated: ", lastUpdated, dropdownContainer);

	// render grid track
	let dropdownTrackContainer = renderElementWithClassName(
		"div",
		"dropdown-track",
		dropdownContainer
	);
	let dropColOne = renderElementWithClassName(
		"div",
		"dropColOne",
		dropdownTrackContainer
	);
	let dropColTwo = renderElementWithClassName(
		"div",
		"dropColTwo",
		dropdownTrackContainer
	);

	// col 1
	// render tracked reports
	renderElementWithString("h3", "tracked reports*:", dropColOne);

	renderContributionReportLinksAndTotals(reports, dropColOne);

	renderElementWithString(
		"p",
		"*see methodology tab to see which reports qualify for inclusion",
		dropColOne
	);

	// col 2
	// render top contributors
	renderElementWithString("h3", "top contributors:", dropColTwo);

	if (uniqueContributors.length === 0) {
		renderSenInfoElement(
			"Error: senator data missing: ",
			`An error has occurred while fetching the contribution data for ${senName}. This is likely due to an error on the <a href='http://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx' target='_blank'>GA State Media Ethics Site</a>, but could also be due to an error in fetching the data. `,
			dropColTwo
		);
	} else {
		renderListTopThirtyContributors(
			senFileName,
			uniqueContributors,
			dropColTwo
		);
	}

	// dropdown toggle (JQuery)
	$(document).ready(() => {
		$(`.container-${senFileName}`).click(() => {
			$(`.dropdown-container-${senFileName}`).toggleClass("hidden");
			if (moreBttn.innerText === "show more") moreBttn.innerText = "hide";
			else moreBttn.innerText = "show more";
		});
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////   HELPER FUNCTIONS   ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function renderTops(amount, containerSelector, doc) {
	let topContributorsArray = doc.data().data;
	let container = document.querySelector(containerSelector);
	let ol = document.createElement("ol");

	for (let i = 0; i < amount; i++) {
		let totalContributions = `\$${numberWithCommas(
			Number.parseInt(topContributorsArray[i].totalContributions)
		)}`;
		renderElementWithString(
			"li",
			`${topContributorsArray[i].contributor}, ${totalContributions}`,
			ol
		);
	}
	container.appendChild(ol);
}

function renderSenInfoElement(keyString, valueString, container) {
	try {
		let p = document.createElement("p");
		p.innerText = keyString;
		container.appendChild(p);
		let head = document.createElement("h3");
		head.innerHTML = valueString;
		container.appendChild(head);
	} catch (err) {
		console.log(
			"error rendering some element\n" + keyString + "\n" + valueString
		);
		console.log(err);
	}
}

async function renderPhoto(fileName, container) {
	let img = document.createElement("img");
	let imgURL = await storage.ref(`${fileName}.jpg`).getDownloadURL();
	img.setAttribute("src", imgURL);
	container.appendChild(img);
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

function renderListTopThirtyContributors(
	fileName,
	uniqueContributorsArray,
	container
) {
	try {
		let ol = document.createElement("ol");
		ol.setAttribute("data-id", fileName);
		for (let i = 0; i < 30; i++) {
			let li = document.createElement("li");
			li.textContent =
				uniqueContributorsArray[i].contributor +
				": " +
				`\$${numberWithCommas(
					Number.parseInt(uniqueContributorsArray[i].totalContributions)
				)}`;
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

function moreBttnClickHandler() {
	if (dropdownStatus === false) {
		dropdownContainer.style.display = "block";
		dropdownStatus = true;
	} else {
		dropdownContainer.style.display = "none";
		dropdownStatus = false;
	}
}

function renderContributionReportLinksAndTotals(reports, container) {
	let ul = document.createElement("ul");
	for (let report of reports) {
		let reportName = report.reportName;
		let totalContributionsPerReport = `\$${numberWithCommas(
			Number.parseInt(report.totalContributions)
		)}`;
		let reportUrl = report.url;
		let li = document.createElement("li");
		li.innerHTML = `<a target="_blank" href=${reportUrl}>${reportName}</a>; total raised: ${totalContributionsPerReport}`;
		ul.appendChild(li);
	}
	container.appendChild(ul);
}