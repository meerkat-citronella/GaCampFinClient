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
		"head-container",
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

	///// GRID TRACK /////
	// headColOne
	if (senParty === "Republican") headColOne.style.backgroundColor = "#D69191";
	if (senParty === "Democrat") headColOne.style.backgroundColor = "#91B9D6";

	// render photo
	let photoEnclosure = renderElementWithClassName(
		"div",
		"photo-enclosure",
		headColOne
	);
	renderPhoto(senFileName, photoEnclosure);

	// headColTwo
	// render info data
	renderName(senName, headColTwo);
	renderSenInfoElement("Party: ", senParty, headColTwo);
	renderSenInfoElement("District: ", senDistrict, headColTwo);
	renderSenInfoElement("City: ", senCity, headColTwo);

	// headColThree
	// render contribution total
	renderElementWithString(
		"h2",
		`${senName} has raised a total of:`,
		headColThree
	);
	renderElementWithString("h1", totalRaised, headColThree);
	renderElementWithString(
		"h2",
		"in cash and in-kind contributions",
		headColThree
	);

	// render button
	let bttnEnclosure = renderElementWithClassName(
		"div",
		"button-enclosure",
		headColThree
	);
	let moreBttn = renderElementWithClassName(
		"button",
		`more-button-${senFileName}`,
		bttnEnclosure
	);
	moreBttn.innerText = "show more";

	///// DROP DOWN /////
	renderSenInfoElement("Last updated: ", lastUpdated, dropdownContainer);

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

	renderElementWithString("h3", "tracked reports*:", dropColOne);

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
	dropColOne.appendChild(ul);

	renderElementWithString(
		"p",
		"*see methodology tab to see which reports qualify for inclusion",
		dropColOne
	);

	renderElementWithString("h3", "top contributors:", dropColTwo);

	if (uniqueContributors.length === 0) {
		// render error
		renderSenInfoElement(
			"Error: senator data missing: ",
			`An error has occurred while fetching the contribution data for ${senName}. This is likely due to an error on Ga Media State Ethics Site, but could also be due to an error in fetching the data. `,
			dropColTwo
		);
	} else {
		// if no error, render 20 contributors
		renderListTopThirtyContributors(
			senFileName,
			uniqueContributors,
			dropColTwo
		);
	}

	// dropdown toggle (JQuery)
	$(document).ready(() => {
		$(`.more-button-${senFileName}`).click(() => {
			$(`.dropdown-container-${senFileName}`).toggleClass("hidden");
			if (moreBttn.innerText === "show more") moreBttn.innerText = "hide";
			else moreBttn.innerText = "show more";
		});
	});
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
