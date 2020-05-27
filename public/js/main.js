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
	let lastUpdated = data.lastUpdated;
	let reports = data.contributionsByReport.data;
	let uniqueContributors = data.uniqueContributors.data;
	let totalRaised = `\$${numberWithCommas(
		Number.parseInt(data.contributionsByReport.totalContributions)
	)}`;
	let buckets = data.buckets;

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
	let lastUpdatedContainer = renderElementWithClassName(
		"div",
		"last-updated",
		dropdownContainer
	);
	renderSenInfoElement("Last updated: ", lastUpdated, lastUpdatedContainer);
	renderElementWithInnerHTML(
		"p",
		"* see <a href='./methodology/methodology.html'>Methodology</a> tab for explanationa of these datasets",
		dropdownContainer
	);

	// render buckets table
	let bucketsContainer = renderElementWithClassName(
		"div",
		"buckets-container",
		dropdownContainer
	);
	renderElementWithString("h3", "buckets:", bucketsContainer);
	let bucketsTable = renderElementWithClassName(
		"table",
		"buckets-table",
		bucketsContainer
	);

	renderBucketsTableHeadRow("bucket", "% cash", "% donations", bucketsTable);

	let bucketsTableBody = renderElementWithClassName(
		"tbody",
		"buckets-table-body",
		bucketsTable
	);
	renderBucketsTableBodyRow("<$500", "One", bucketsTableBody, buckets);
	renderBucketsTableBodyRow("$500 - $1,000", "Two", bucketsTableBody, buckets);
	renderBucketsTableBodyRow(
		"$1,000 - $1,500",
		"Three",
		bucketsTableBody,
		buckets
	);
	renderBucketsTableBodyRow(
		"$1,500 - $2,000",
		"Four",
		bucketsTableBody,
		buckets
	);
	renderBucketsTableBodyRow(
		"$2,000 - $2,500",
		"Five",
		bucketsTableBody,
		buckets
	);
	renderBucketsTableBodyRow("<$2,500", "Six", bucketsTableBody, buckets);

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
	renderElementWithString("h3", "tracked reports:", dropColOne);

	renderContributionReportLinksAndTotals(reports, dropColOne);

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

function renderElementWithInnerHTML(element, HTML, container) {
	try {
		let el = document.createElement(element);
		el.innerHTML = HTML;
		container.appendChild(el);
		return el;
	} catch (err) {
		console.log("error rendering element with HTML:\n" + element + " " + HTML);
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
		let reportName = cleanReportName(report.reportName);
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

function cleanReportName(messyReportName) {
	let year = /^\d+/.exec(messyReportName)[0];
	let messyMonth = /^(\d+)(\D+)/.exec(messyReportName)[0];
	let messyDay = /^\d+\w+\d+/.exec(messyReportName)[0];
	let messyType = /^\d+\w+\d+\w+/.exec(messyReportName)[0];
	let month = messyMonth.replace(year, "");
	let day = messyDay.replace(messyMonth, "");
	let type = messyType.replace(messyDay, "");
	return year + " " + month + " " + day + " " + type;
}

function renderBucketsTableHeadRow(
	colOneHeaderString,
	colTwoHeaderString,
	colThreeHeaderString,
	tableContainer
) {
	let th = renderElementWithClassName(
		"thead",
		"buckets-table-head",
		tableContainer
	);
	let thRow = renderElementWithClassName("tr", "buckets-table-head-row", th);
	renderElementWithString("th", colOneHeaderString, thRow);
	renderElementWithString("th", colTwoHeaderString, thRow);
	renderElementWithString("th", colThreeHeaderString, thRow);
}

function renderBucketsTableBodyRow(
	labelString,
	bucketNum,
	tbodyContainer,
	buckets
) {
	let cashPercentagePointer = `bucket${bucketNum}CashPercentage`;
	let numPercentagePointer = `bucket${bucketNum}NumPercentage`;
	let cashPercentage = buckets[cashPercentagePointer];
	let numPercentage = buckets[numPercentagePointer];
	let tr = renderElementWithClassName("tr", "", tbodyContainer);
	renderElementWithString("td", labelString, tr);
	renderElementWithString("td", `${cashPercentage}`, tr);
	renderElementWithString("td", `${numPercentage}`, tr);
}
