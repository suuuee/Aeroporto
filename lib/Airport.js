var WINDOWBORDERSIZE = 10;
var HUGE = 999999; //Sometimes useful when testing for big or small numbers
var animationDelay = 200; //controls simulation and transition speed
var isRunning = false; // used in simStep and toggleSimStep
var surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing surface
var simTimer; // Set in the initialization function

//The drawing surface will be divided into logical cells
var maxCols = 40;
var cellWidth; //cellWidth is calculated in the redrawWindow function
var cellHeight; //cellHeight is calculated in the redrawWindow function

//You are free to change images to suit your purpose. These images came from icons-land.com. 
// The copyright rules for icons-land.com require a backlink on any page where they appear. 
// See the credits element on the html page for an example of how to comply with this rule.
const urlAgent = "images/People-Female-icon.png";
const urlAgent2 = "images/People-Male-icon.png";
const urlChair = "images/Chair-icon.png";
const urlRetail = "images/retail.png";
const urlFood = "images/food.png";
const urlConstruction = "images/construction.png";

var serverRow = 22;
var serverCol = 4;
var exitRow = 3;
var exitCol = 12;
var immigrationcount = 0;

// agent enters the airport UNCHECKED, then QUEUING for immigration, then IMMIGRATION, then CHECKED
const UNCHECKED = 0;
const WAITING = 1;
const IMMIGRATION = 2;
const CHECKED = 3;
const BOARDED = 4;
const EXITED = 5;

// immigration server can either be idle or busy
const IDLE = 0;
const BUSY = 1;

// chairscan either be empty or occupied
const EMPTY = 0;
const OCCUPIED = 1;

// agents is a dynamic list, initially empty
var agents = [];
// servers is a static list, populated with a server and a server	
var servers = [{ "label": "Immigration Counter", "location": { "row": serverRow, "col": serverCol }, "state": IDLE }];
var server = servers[0]; // the server is the first element of the servers list.

var counters = [
	{"label":"Immigration Counter", "location":{"row":serverRow,"col":serverCol+1,"count":immigrationcount}}
];

// We can section our screen into different areas. In this model, the waiting area and the staging area are separate.
var areas = [
	{ "label": "Immigration Area", "startRow": serverRow + 1, "numRows": 1, "startCol": serverCol - 3, "numCols": 6 },
	{ "label": "Seating Area", "startRow": 9, "numRows": 10, "startCol": 9, "numCols": 9 },
	{ "label": "Transit Area", "startRow": 3, "numRows": 22, "startCol": 1, "numCols": 24, "color": "pink" },
	{ "label": "Standing Area", "startRow": 8, "numRows": 15, "startCol": 7, "numCols": 12 }
]

var rooms = [
	{ "label": "Toilet", "startRow": 23, "numRows": 1, "startCol": 20, "numCols": 5 },
	{ "label": "Shop 1", "startRow": 2.5, "numRows": 2, "startCol": 2, "numCols": 4 },
	{ "label": "Shop 2", "startRow": 6, "numRows": 2, "startCol": 2, "numCols": 4 },
	{ "label": "Shop 3", "startRow": 10, "numRows": 2, "startCol": 2, "numCols": 4 },
	{ "label": "Shop 4", "startRow": 14, "numRows": 2, "startCol": 2, "numCols": 4 },
	{ "label": "Shop 5", "startRow": 18, "numRows": 2, "startCol": 2, "numCols": 4 },
	{ "label": "Shop 6", "startRow": 2.5, "numRows": 2, "startCol": 15.5, "numCols": 4 },
	{ "label": "Shop 7", "startRow": 2, "numRows": 4, "startCol": 21.5, "numCols": 2 },
	{ "label": "Shop 8", "startRow": 9, "numRows": 2, "startCol": 21, "numCols": 4 },
	{ "label": "Shop 9", "startRow": 13, "numRows": 2, "startCol": 21, "numCols": 4 },
	{ "label": "Shop 10", "startRow": 17, "numRows": 2, "startCol": 21, "numCols": 4 }
]

var seatingArea = areas[1];
var transitArea = areas[2];
var standingArea = areas[3];
// shops are ordered left to right, top to bottom
var shop1 = rooms[1];
var shop2 = rooms[2];
var shop3 = rooms[3];
var shop4 = rooms[4];
var shop5 = rooms[5];
var shop6 = rooms[6];
var shop7 = rooms[7];
var shop8 = rooms[8];
var shop9 = rooms[9];
var shop10 = rooms[10];

var seatingCoordinates = [
	[seatingArea.startRow, seatingArea.startCol],
	[seatingArea.startRow, seatingArea.startCol + 1],
	[seatingArea.startRow, seatingArea.startCol + 2],
	[seatingArea.startRow, seatingArea.startCol + 3],
	[seatingArea.startRow, seatingArea.startCol + 4],
	[seatingArea.startRow, seatingArea.startCol + 5],
	[seatingArea.startRow, seatingArea.startCol + 6],
	[seatingArea.startRow, seatingArea.startCol + 7],
	[seatingArea.startRow, seatingArea.startCol + 8],
	[seatingArea.startRow + 3, seatingArea.startCol],
	[seatingArea.startRow + 3, seatingArea.startCol + 1],
	[seatingArea.startRow + 3, seatingArea.startCol + 2],
	[seatingArea.startRow + 3, seatingArea.startCol + 3],
	[seatingArea.startRow + 3, seatingArea.startCol + 4],
	[seatingArea.startRow + 3, seatingArea.startCol + 5],
	[seatingArea.startRow + 3, seatingArea.startCol + 6],
	[seatingArea.startRow + 3, seatingArea.startCol + 7],
	[seatingArea.startRow + 3, seatingArea.startCol + 8],
	[seatingArea.startRow + 6, seatingArea.startCol],
	[seatingArea.startRow + 6, seatingArea.startCol + 1],
	[seatingArea.startRow + 6, seatingArea.startCol + 2],
	[seatingArea.startRow + 6, seatingArea.startCol + 3],
	[seatingArea.startRow + 6, seatingArea.startCol + 4],
	[seatingArea.startRow + 6, seatingArea.startCol + 5],
	[seatingArea.startRow + 6, seatingArea.startCol + 6],
	[seatingArea.startRow + 6, seatingArea.startCol + 7],
	[seatingArea.startRow + 6, seatingArea.startCol + 8],
	[seatingArea.startRow + 9, seatingArea.startCol],
	[seatingArea.startRow + 9, seatingArea.startCol + 1],
	[seatingArea.startRow + 9, seatingArea.startCol + 2],
	[seatingArea.startRow + 9, seatingArea.startCol + 3],
	[seatingArea.startRow + 9, seatingArea.startCol + 4],
	[seatingArea.startRow + 9, seatingArea.startCol + 5],
	[seatingArea.startRow + 9, seatingArea.startCol + 6],
	[seatingArea.startRow + 9, seatingArea.startCol + 7],
	[seatingArea.startRow + 9, seatingArea.startCol + 8]
];

var toiletCoordinates = [
	[rooms[0].startRow, rooms[0].startCol],
	[rooms[0].startRow, rooms[0].startCol + 3]
]

// Each shop is 2x4
var shopCoordinates = [
	// shops on the left
	[rooms[1].startRow, rooms[1].startCol],
	[rooms[1].startRow, rooms[1].startCol + 1],
	[rooms[1].startRow, rooms[1].startCol + 2],
	[rooms[1].startRow, rooms[1].startCol + 3],
	[rooms[1].startRow + 1, rooms[1].startCol],
	[rooms[1].startRow + 1, rooms[1].startCol + 1],
	[rooms[1].startRow + 1, rooms[1].startCol + 2],
	[rooms[1].startRow + 1, rooms[1].startCol + 3],

	[rooms[2].startRow, rooms[2].startCol],
	[rooms[2].startRow, rooms[2].startCol + 1],
	[rooms[2].startRow, rooms[2].startCol + 2],
	[rooms[2].startRow, rooms[2].startCol + 3],
	[rooms[2].startRow + 1, rooms[2].startCol],
	[rooms[2].startRow + 1, rooms[2].startCol + 1],
	[rooms[2].startRow + 1, rooms[2].startCol + 2],
	[rooms[2].startRow + 1, rooms[2].startCol + 3],

	[rooms[3].startRow, rooms[3].startCol],
	[rooms[3].startRow, rooms[3].startCol + 1],
	[rooms[3].startRow, rooms[3].startCol + 2],
	[rooms[3].startRow, rooms[3].startCol + 3],
	[rooms[3].startRow + 1, rooms[3].startCol],
	[rooms[3].startRow + 1, rooms[3].startCol + 1],
	[rooms[3].startRow + 1, rooms[3].startCol + 2],
	[rooms[3].startRow + 1, rooms[3].startCol + 3],

	[rooms[4].startRow, rooms[4].startCol],
	[rooms[4].startRow, rooms[4].startCol + 1],
	[rooms[4].startRow, rooms[4].startCol + 2],
	[rooms[4].startRow, rooms[4].startCol + 3],
	[rooms[4].startRow + 1, rooms[4].startCol],
	[rooms[4].startRow + 1, rooms[4].startCol + 1],
	[rooms[4].startRow + 1, rooms[4].startCol + 2],
	[rooms[4].startRow + 1, rooms[4].startCol + 3],

	[rooms[5].startRow, rooms[5].startCol],
	[rooms[5].startRow, rooms[5].startCol + 1],
	[rooms[5].startRow, rooms[5].startCol + 2],
	[rooms[5].startRow, rooms[5].startCol + 3],
	[rooms[5].startRow + 1, rooms[5].startCol],
	[rooms[5].startRow + 1, rooms[5].startCol + 1],
	[rooms[5].startRow + 1, rooms[5].startCol + 2],
	[rooms[5].startRow + 1, rooms[5].startCol + 3],

	// shops on the right
	[rooms[6].startRow, rooms[6].startCol],
	[rooms[6].startRow, rooms[6].startCol + 1],
	[rooms[6].startRow, rooms[6].startCol + 2],
	[rooms[6].startRow, rooms[6].startCol + 3],
	[rooms[6].startRow + 1, rooms[6].startCol],
	[rooms[6].startRow + 1, rooms[6].startCol + 1],
	[rooms[6].startRow + 1, rooms[6].startCol + 2],
	[rooms[6].startRow + 1, rooms[6].startCol + 3],

	[rooms[7].startRow, rooms[7].startCol],
	[rooms[7].startRow + 1, rooms[7].startCol],
	[rooms[7].startRow + 2, rooms[7].startCol],
	[rooms[7].startRow + 3, rooms[7].startCol],
	[rooms[7].startRow, rooms[7].startCol + 1],
	[rooms[7].startRow + 1, rooms[7].startCol + 1],
	[rooms[7].startRow + 2, rooms[7].startCol + 1],
	[rooms[7].startRow + 3, rooms[7].startCol + 1],

	[rooms[8].startRow, rooms[8].startCol],
	[rooms[8].startRow, rooms[8].startCol + 1],
	[rooms[8].startRow, rooms[8].startCol + 2],
	[rooms[8].startRow, rooms[8].startCol + 3],
	[rooms[8].startRow + 1, rooms[8].startCol],
	[rooms[8].startRow + 1, rooms[8].startCol + 1],
	[rooms[8].startRow + 1, rooms[8].startCol + 2],
	[rooms[8].startRow + 1, rooms[8].startCol + 3],

	[rooms[9].startRow, rooms[9].startCol],
	[rooms[9].startRow, rooms[9].startCol + 1],
	[rooms[9].startRow, rooms[9].startCol + 2],
	[rooms[9].startRow, rooms[9].startCol + 3],
	[rooms[9].startRow + 1, rooms[9].startCol],
	[rooms[9].startRow + 1, rooms[9].startCol + 1],
	[rooms[9].startRow + 1, rooms[9].startCol + 2],
	[rooms[9].startRow + 1, rooms[9].startCol + 3],

	[rooms[10].startRow, rooms[10].startCol],
	[rooms[10].startRow, rooms[10].startCol + 1],
	[rooms[10].startRow, rooms[10].startCol + 2],
	[rooms[10].startRow, rooms[10].startCol + 3],
	[rooms[10].startRow + 1, rooms[10].startCol],
	[rooms[10].startRow + 1, rooms[10].startCol + 1],
	[rooms[10].startRow + 1, rooms[10].startCol + 2],
	[rooms[10].startRow + 1, rooms[10].startCol + 3],
]

var wallCoordinates = [
	[2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10],
	[3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [3, 9], [3, 10],
	[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
	[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6],
	[10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6],
	[11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6],
	[14, 1], [14, 2], [14, 3], [14, 4], [14, 5], [14, 6],
	[15, 1], [15, 2], [15, 3], [15, 4], [15, 5], [15, 6],
	[18, 1], [18, 2], [18, 3], [18, 4], [18, 5], [18, 6],
	[19, 1], [19, 2], [19, 3], [19, 4], [19, 5], [19, 6],
	[3, 14], [3, 15], [3, 16], [3, 17], [3, 18], [3, 19],
	[3, 14], [4, 14], [5, 14], [6, 14], [7, 14],
	[6, 14], [6, 15], [6, 16],
	[7, 14], [7, 15], [7, 16],
	[3, 19], [4, 19], [5, 19], [6, 19],
	[3, 19], [3, 20], [3, 21], [3, 22], [3, 23], [3, 24],
	[4, 19], [4, 20], [4, 21], [4, 22], [4, 23], [4, 24],
	[9, 19], [9, 20], [9, 21], [9, 22], [9, 23], [9, 24],
	[10, 19], [10, 20], [10, 21], [10, 22], [10, 23], [10, 24],
	[13, 19], [13, 20], [13, 21], [13, 22], [13, 23], [13, 24],
	[14, 19], [14, 20], [14, 21], [14, 22], [14, 23], [14, 24],
	[17, 19], [17, 20], [17, 21], [17, 22], [17, 23], [17, 24],
	[18, 19], [18, 20], [18, 21], [18, 22], [18, 23], [18, 24],
	[21, 19], [22, 19], 
	[21, 22], [22, 22],
	[21, 20], [21, 21], [21, 22], [21, 23], [21, 24],
	[22, 20], [22, 21], [22, 22], [22, 23], [22, 24],
	[22, 1], [22, 2], [22, 3], [22, 4], [22, 5], [22, 6],
	[2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [2, 1], [2, 13], [2, 14], [2, 15], [2, 16], [2, 17], [2, 18], [2, 19], [2, 20], [2, 21], [2, 22], [2, 23], [2, 24], [2, 25],
	[25, 1], [25, 2], [25, 3], [25, 4], [25, 5], [25, 6], [25, 7], [25, 8], [25, 9], [25, 10], [25, 11], [25, 1], [25, 13], [25, 14], [25, 15], [25, 16], [25, 17], [25, 18], [25, 19], [25, 20], [25, 21], [25, 22], [25, 23], [25, 24], [25, 25],
,];

var seats = seatingCoordinates.map(function (d) {
	return {
		"state": EMPTY,
		"location": { "row": d[0], "col": d[1] }
	};
});

var shops = shopCoordinates.map(function (d) {
	return {
		"state": EMPTY,
		"location": { "row": d[0], "col": d[1] }
	};
});

var toilets = toiletCoordinates.map(function (d) {
	return {
		"state": EMPTY,
		"location": { "row": d[0], "col": d[1] }
	}
})

var walls = wallCoordinates.map(function (d) {
	return { "row": d[0], "col": d[1] };
})

// agent probability to shops, toilet, seats
var probShop = 0.4;
var probSit = 0.4;
var probToilet = 0.2;
// var probLeaveFoodShop = 0.7;
// var probLeaveRetailShop = 0.2;

// To manage the queues, we need to keep track of agentIDs.
var nextagentID = 0; // increment this and assign it to the next admitted agent 
var nextCheckedagentID = 1; //this is the id of the next agent to be treated by the server

// This next function is executed when the script is loaded. It contains the page initialization code.
(function () {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
	simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
	redrawWindow();
	updateProfitChart(0);
})();

function ShopsInitialization(numberOfFood, numberOfRetail) {
    var surface = d3.select('#surface');

    // Clear any previous shop images
    surface.selectAll(".shopImage").remove();

    // Total number of shops is fixed at 10
    const totalShops = 10;

    // Iterate over each shop and append the correct image
    for (let i = 0; i < totalShops; i++) {
        let imageUrl;
        if (i < numberOfFood) {
            // Append food shop image
            imageUrl = urlFood;
        } else if (i < numberOfFood + numberOfRetail) {
            // Append retail shop image
            imageUrl = urlRetail;
        } else {
            // Append construction image for the remaining shops
            imageUrl = urlConstruction;
        }

        // Assuming 'rooms' contains the correct shop data
        let shop = rooms.filter(room => room.label.startsWith("Shop"))[i];
        if (shop) {
            surface.append("svg:image")
                .attr("class", "shopImage")
                .attr("x", (shop.startCol - 2) * cellWidth + "px") // Use startCol for X position
                .attr("y", (shop.startRow - 1.5) * cellHeight + "px") // Use startRow for Y position
				.attr("width", (cellWidth * shop.numCols * 0.7) + "px")
                .attr("height", (cellHeight * shop.numRows * 0.7) + "px")
                .attr("xlink:href", imageUrl);
        }
    }
}

// We need a function to start and pause the the simulation.
function toggleSimStep() {
	//this function is called by a click event on the html page. 
	isRunning = !isRunning;
	console.log("isRunning: " + isRunning);
}

function redrawWindow() {
	isRunning = false; // used by simStep
	window.clearInterval(simTimer); // clear the Timer
	animationDelay = 550 - document.getElementById("slider1").value;
	simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds

	// Re-initialize simulation variables
	nextagentID = 0;
	nextCheckedagentID = 1;
	currentTime = 0;
	server.state = IDLE;
	agents = [];
	immigrationcount = 0;

	// Resize the drawing surface; remove all its contents; 
	var drawsurface = document.getElementById("surface");
	var creditselement = document.getElementById("credits");
	var w = window.innerWidth;
	var h = window.innerHeight;

	// Calculate surface width and left position for the left half of the screen
	var surfaceWidth = (3 * w / 4) - (3 * WINDOWBORDERSIZE);
	var surfaceLeft = WINDOWBORDERSIZE / 2;

	// Calculate surface height
	var surfaceHeight = h - creditselement.offsetHeight - 3 * WINDOWBORDERSIZE;

	// Apply the calculated styles to the drawing surface
	drawsurface.style.width = surfaceWidth + "px";
	drawsurface.style.height = surfaceHeight + "px";
	drawsurface.style.left = surfaceLeft + "px";
	drawsurface.style.top = WINDOWBORDERSIZE / 2 + "px";

	// Compute the cellWidth and cellHeight, given the size of the drawing surface
	numCols = maxCols;
	cellWidth = surfaceWidth / numCols;
	numRows = Math.ceil(surfaceHeight / cellWidth);
	cellHeight = surfaceHeight / numRows;

	// In other functions we will access the drawing surface using the d3 library. 
	//Here we set the global variable, surface, equal to the d3 selection of the drawing surface
	surface = d3.select('#surface');
	surface.selectAll('*').remove(); // we added this because setting the inner html to blank may not remove all svg elements
	surface.style("font-size", "100%");
	// rebuild contents of the drawing surface
	updateSurface();
	updateParameters();
};

// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location) {
	var row = location.row;
	var col = location.col;
	var x = (col - 1) * cellWidth; //cellWidth is set in the redrawWindow function
	var y = (row - 1) * cellHeight; //cellHeight is set in the redrawWindow function
	return { "x": x, "y": y };
}

function updateSurface() {
	// This function is used to create or update most of the svg elements on the drawing surface.
	// See the function removeDynamicAgents() for how we remove svg elements

	//Select all svg elements of class "agent" and map it to the data list called agents
	var allagents = surface.selectAll(".agent").data(agents);

	// If the list of svg elements is longer than the data list, the excess elements are in the .exit() list
	// Excess elements need to be removed:
	allagents.exit().remove(); //remove all svg elements associated with entries that are no longer in the data list
	// (This remove function is needed when we resize the window and re-initialize the agents array)

	// If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
	// The first time this is called, all the elements of data will be in the .enter() list.
	// Create an svg group ("g") for each new entry in the data list; give it class "agent"
	var newagents = allagents.enter().append("g").attr("class", "agent");
	//Append an image element to each new agent svg group, position it according to the location data, and size it to fill a cell
	// Also note that we can choose a different image to represent the agent based on the agent type
	newagents.append("svg:image")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return cell.x + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return cell.y + "px"; })
		.attr("width", Math.min(cellWidth, cellHeight) + "px")
		.attr("height", Math.min(cellWidth, cellHeight) + "px")
		.attr("xlink:href", function(d) { return Math.random() < 0.5 ? urlAgent : urlAgent2; });

	//Animation of agents
	var images = allagents.selectAll("image");
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images.transition()
		.attr("x", function (d) { var cell = getLocationCell(d.location); return cell.x + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return cell.y + "px"; })
		.duration(animationDelay).ease('sin'); // This specifies the speed and type of transition we want.

	var allcounters = surface.selectAll(".counter").data(counters);
	var newcounters = allcounters.enter().append("g").attr("class", ".counter");

	// Rectangle for text label of counter
	newcounters.append("rect")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return cell.x + cellWidth - 70; }) // Shift left for padding
		.attr("y", function (d) { var cell = getLocationCell(d.location); return cell.y + cellHeight / 2 - 35; }) // Shift up for padding
		.attr("width", function (d) {var stringlength = d.label.length; return stringlength * cellWidth * 0.25}) 
		.attr("height", 20) 
		.style("fill", "#b3d9ff") // Light blue background
		.style("stroke", "#007bff") // Blue border
		.style("stroke-width", "2");
	
	newcounters.append("text")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return (cell.x + cellWidth - 67) + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return (cell.y + cellHeight / 2 - 25) + "px"; })
		.attr("dy", ".35em")
		.attr("font-size", "10px")
		.text(function (d) { return d.label; });

	// Immigration counter
	newcounters.append("rect")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return (cell.x + 2) + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return (cell.y - 2) + "px"; })
		.attr("width", function (d) {var stringlength = immigrationcount.toString().length; return Math.sqrt(stringlength *cellWidth*12)})
		.attr("height", "17px")
		.style("fill", "white")
		.style("opacity", 1)
		.style("stroke", "black")
		.style("stroke-width", 1);

	newcounters.append("text")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return (cell.x + cellWidth - 19) + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return (cell.y + cellHeight / 2 - 4) + "px"; })
		.attr("dy", ".35em")
		.attr("font-size", "10px")
		.text(immigrationcount);

	drawBackgroundRect(false);
}

function addDynamicAgents() {
	//randomly generate certain amount of cash for agent
	//takes into account the family size
	//time left is in miliseconds, with lower bound of 60 minutes
	if (Math.random() < arrivalProb) {
		var size = Math.floor(Math.random() * 5 + 1);

        // Calculate base cash amount and multiply by family size
        var baseCash = Math.round(Math.random() * 400 + 10);
        var cashLeft = baseCash * size; // Now cashLeft is a multiple of size
		var newagent = {
			"id": 1, 
			"location": { 
				"row": serverRow + 1, 
				"col": 0 
			},
			"target": {
				"row": serverRow + 1,
				"col": 0
			},
			"state": UNCHECKED,
			"timeInit": currentTime,
			"timeLeft": currentTime + Math.round(Math.random() * 100000 + 36000),
			"cashLeft": cashLeft,
			"size": size,
			"shopIndex": null,
			"seatIndex": null,
			"toiletIndex": null,
			"retailTimeLeft": currentTime + Math.round(Math.random() * 5000 + 5000),
			"foodTimeLeft": currentTime + Math.round(Math.random() * 5000 + 5000),
			"toiletTimeLeft": currentTime + Math.round(Math.random() * 5000 + 5000),
			"seatTimeLeft": currentTime + Math.round(Math.random() * 5000 + 5000),
		};
		agents.push(newagent);
	}
}

function drawBackgroundRect(draw) {
	if (draw) {
		var allareas = surface.selectAll(".areas").data(areas);
		var newareas = allareas.enter().append("g").attr("class", "areas");
		// For each new area, append a rectangle to the group
		newareas.append("rect")
			.attr("x", function (d) { return (d.startCol - 1) * cellWidth; })
			.attr("y", function (d) { return (d.startRow - 1) * cellHeight; })
			.attr("width", function (d) { return d.numCols * cellWidth; })
			.attr("height", function (d) { return d.numRows * cellWidth; })
			.style("fill", function (d) { return d.color; })
			.style("opacity", 0.3)
			.style("stroke", "black")
			.style("stroke-width", 1);
	}
}

function goToNonShopsArea(agent) {

	var targetisseat = seats.filter(function(d){return d.row==targetRow && d.col==targetCol;});
	var targetRow = standingArea.startRow + Math.floor(Math.random() * standingArea.numRows);
	var targetCol = standingArea.startCol + Math.floor(Math.random() * standingArea.numCols);

	while (targetisseat.length>0){
        targetRow=standingArea.startRow + Math.floor(Math.random() * standingArea.numRows);
        targetCol=standingArea.startCol + Math.floor(Math.random() * standingArea.numCols);
        targetisseat=seats.filter(function(d){return d.row==targetRow && d.col==targetCol;});    
        }

	agent.target.row = targetRow;
	agent.target.col = targetCol;

	resetRetailState(agent);
	resetFoodState(agent);
	resetSeatState(agent);
	resetToiletState(agent);
}

function resetRetailState(agent) {
	if (agent.shopIndex != null) {
		shops[agent.shopIndex].state = EMPTY;
		agent.shopIndex = null;
	}
}

function resetFoodState(agent) {
	if (agent.shopIndex != null) {
		shops[agent.shopIndex].state = EMPTY;
		agent.shopIndex = null;
	}
}

function resetSeatState(agent) {
	if (agent.seatIndex != null) {
		seats[agent.seatIndex].state = EMPTY;
		agent.seatIndex = null;
	}
}

function resetToiletState(agent) {
	if (agent.toiletIndex != null) {
		toilets[agent.toiletIndex].state = EMPTY;
		agent.toiletIndex = null;
	}
}

function updateParameters(input1, input2, input3, input4, input5, input6, input7) {
	arrivalProb = input1;
	clearanceEff = input2;
	costOfOperation = input3;
	profitOfFood = input4;
	profitOfRetail = input5;
	numberOfFood=input6;
	numberOfRetail=input7;
	var totalShops = numberOfFood + numberOfRetail;	
	numShops = [totalShops, numberOfFood, numberOfRetail];
	ShopsInitialization(numberOfFood, numberOfRetail)
}

function updateagent(agentIndex) {
	//agentIndex is an index into the agents data array
	agentIndex = Number(agentIndex); //it seems agentIndex was coming in as a string
	var agent = agents[agentIndex];
	// get the current location of the agent
	var row = agent.location.row;
	var col = agent.location.col;
	var state = agent.state;
	// determine if agent has arrived at destination
	var hasArrived = (Math.abs(agent.target.row - row) + Math.abs(agent.target.col - col)) == 0;
	// Behavior of agent depends on his or her state
	switch (state) {
		case UNCHECKED:
			agent.state = WAITING;
			agent.id = ++nextagentID;
			targetCol = serverCol - (agent.id-nextCheckedagentID); 
			if (targetCol < 0) { // If agent is out of bounds, then stay at col = 0
				agent.target.col = 0;
			}
			else{
				agent.target.col = targetCol;
			}
			immigrationcount += agent.size;
			break;
		case WAITING:
			if (server.state == IDLE) {
				if (server.state == IDLE & agent.id == nextCheckedagentID) {
					agent.target.col = serverCol;
					server.state = BUSY;
					agent.state = IMMIGRATION;
				}
			}
			else {
				targetCol = serverCol - (agent.id-nextCheckedagentID); 
				if (targetCol < 0) { // If agent is out of bounds, then stay at col = 0
					agent.target.col = 0;
				}
				else{
					agent.target.col = targetCol;
				}
			}
			break;
		case IMMIGRATION:
			if (Math.random() < clearanceEff) {
				server.state = IDLE;
				nextCheckedagentID++;
				agent.state = CHECKED;
				agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
				csvAgent.push(agentoutput);
				totalWaitingTime += (currentTime-agent.timeInit);
				immigrationcount -= agent.size;
				goToNonShopsArea(agent);
			}
			break;
		case CHECKED:
			var timeLeft = agent.timeLeft - currentTime;
			agent.timeLeft = timeLeft;

			var totalShops = numShops[0];
			var numRetailShops = numShops[2];

			if (timeLeft <= 600) {
				agent.target.row = exitRow;
				agent.target.col = exitCol;
				agent.state = BOARDED;
				agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
				csvAgent.push(agentoutput);
				
			} else if (agent.shopIndex != null) {
				var agentShopIndex = agent.shopIndex;

				// Agent is at a retail shop, multiply by 8 as each shop has 8 slots.
				if (agentShopIndex <= numRetailShops * 8) {
					var retailTimeLeft = agent.retailTimeLeft - currentTime;
					agent.retailTimeLeft = retailTimeLeft;
					if (retailTimeLeft <= 0) {
						agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
						csvAgent.push(agentoutput);
						goToNonShopsArea(agent);
					}
				} else {
					// Agent is at a food shop
					var foodTimeLeft = agent.foodTimeLeft - currentTime;
					agent.foodTimeLeft = foodTimeLeft;
					if (foodTimeLeft <= 0) {
						agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
						csvAgent.push(agentoutput);
						goToNonShopsArea(agent);
					}
				}
			} else if (agent.toiletIndex != null) {
				var toiletTimeLeft = agent.toiletTimeLeft - currentTime;
				agent.toiletTimeLeft = toiletTimeLeft;
				if (toiletTimeLeft <= 0) {
					agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
					csvAgent.push(agentoutput);
					goToNonShopsArea(agent);
				}
			} else if (agent.seatIndex != null) {
				var seatTimeLeft = agent.seatTimeLeft - currentTime;
				agent.seatTimeLeft = seatTimeLeft;
				if (seatTimeLeft <= 0) {
					agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
					csvAgent.push(agentoutput);
					goToNonShopsArea(agent);
				}
			} else {
				if (Math.random() < probShop) {
					// Let agent go shopping
					// Multiply totalShops by 8 because each shop has 8 slots
					var shopSlots = totalShops * 8;
					// Get a random slot to for shopIndex to head to
					var shopIndex = Math.floor(Math.random() * shopSlots);
					var shopState = shops[shopIndex].state;
					var maxTries = Math.floor(shops.length / 2);
					var tries = 0;
					// Try to find an empty spot in a shop
					// but limit the number of tries to prevent an infinite loop
					while (shopState == OCCUPIED && tries != maxTries) {
						shopIndex = Math.floor(Math.random() * shopSlots);
						shopState = shops[shopIndex].state;
						tries++;
					}
					// If the spot in the shop is occupied at this point, go to a random spot in transit
					if (shopState == OCCUPIED) {
						goToNonShopsArea(agent);
					// else, go to a spot in a shop
					} else {
						var shopLocation = shops[shopIndex].location;
						agent.target.row = shopLocation.row;
						agent.target.col = shopLocation.col;
						agent.shopIndex = shopIndex;
						agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
						csvAgent.push(agentoutput);
						shops[shopIndex].state = OCCUPIED;
					}
				} else if (Math.random() < probSit) {
					// Let agent go sit
					var seatIndex = Math.floor(Math.random() * seats.length);
					var seatState = seats[seatIndex].state;
					var maxTries = Math.floor(seats.length / 2);
					var tries = 0;
					// Try to find an empty seat
					// but limit the number of tries to prevent an infinite loop
					while (seatState == OCCUPIED && tries != maxTries) {
						seatIndex = Math.floor(Math.random() * seats.length);
						seatState = seats[seatIndex].state;
						tries++;
					}
					// If the seat is occupied at this point, go to a random spot in transit
					if (seatState == OCCUPIED) {
						goToNonShopsArea(agent);
					// else, go to a seat
					} else {
						var seatLocation = seats[seatIndex].location;
						agent.target.row = seatLocation.row;
						agent.target.col = seatLocation.col;
						agent.seatIndex = seatIndex;
						agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
						csvAgent.push(agentoutput);
						seats[seatIndex].state = OCCUPIED;
					}
				} else if (Math.random() < probToilet) {
					// Let agent go toilet
					var toiletIndex = Math.floor(Math.random() * toilets.length);
					var toiletState = toilets[toiletIndex].state;
					var maxTries = Math.floor(toilets.length / 2);
					var tries = 0;
					// Try to find an empty toilet
					// but limit the number of tries to prevent an infinite loop
					while (toiletState == OCCUPIED && tries != maxTries) {
						toiletIndex = Math.floor(Math.random() * toilets.length);
						toiletState = toilets[toiletIndex].state;
						tries++;
					}
					// If the toilet is occupied at this point, go to a random spot in transit
					if (toiletState == OCCUPIED) {
						goToNonShopsArea(agent);
					// else, go to a toilet
					} else {
						var toiletLocation = toilets[toiletIndex].location;
						agent.target.row = toiletLocation.row;
						agent.target.col = toiletLocation.col;
						agent.toiletIndex = toiletIndex;
						agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
						csvAgent.push(agentoutput);
						toilets[toiletIndex].state = OCCUPIED;
					}
				} else {
					goToNonShopsArea(agent);
				}
			}
			break;

		case BOARDED:
			if (hasArrived) {
				resetSeatState(agent);
				resetToiletState(agent);
				resetFoodState(state);
				resetRetailState(state);
				agent.state = EXITED;
				agentoutput = JSON.stringify({"agent_id": agent.id, "state": agent.state, "shopIndex": agent.shopIndex, "seatIndex": agent.seatIndex, "toiletIndex": agent.toiletIndex, "timeInit": agent.timeInit, "currentTime": currentTime, "cashLeft": agent.cashLeft, "size": agent.size});
				csvAgent.push(agentoutput);
			}
			break;
		default:
			break;
	}
	// set the destination row and column
	var targetRow = agent.target.row;
	var targetCol = agent.target.col;
	// compute the distance to the target destination
	// var rowsToGo = targetRow - row;
	// var colsToGo = targetCol - col;
	// // set the speed
	// var cellsPerStep = 1;
	// // compute the cell to move to
	// var newRow = row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo);
	// var newCol = col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo);

	var shouldMove = (Math.abs(targetRow - row) + Math.abs(targetCol - col)) != 0;

	if (shouldMove) {
		//Compute all possible directions o a citizen
		nextsteps = [];
		for (const dx of [-1, 0, 1]) {
			for (const dy of [-1, 0, 1]) {
				if (dx === 0 && dy === 0) continue;
				nextsteps.push({ row: row + dx, col: col + dy });
			}
		}

		// Compute distance of each possible step to the destination
		stepdistance = []
		for (i = 0; i < nextsteps.length - 1; i++) {
			var nextstep = nextsteps[i];
			var nextrow = nextstep.row
			var nextcol = nextstep.col
			stepdistance[i] = Math.sqrt((nextrow - targetRow) * (nextrow - targetRow) + (nextcol - targetCol) * (nextcol - targetCol));
		}

		//identify if the best next step (i.e. the step with the shortest distance to the target) is a wall
		var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
		var minnexstep = nextsteps[indexMin];
		var nextsteprow = minnexstep.row;
		var nextstepcol = minnexstep.col;
		var nextstepiswall = walls.filter(function (d) { return d.row == nextsteprow && d.col == nextstepcol; });

		//If the best next step is a wall, then we analyze the 2nd best next step...etc, until the next step is not a wall
		//Citizens cannot move through the wall!
		var maxTries = 2;
		var tries = 0;
		while (nextstepiswall.length > 0 && tries != maxTries) {
			nextsteps.splice((indexMin), 1);
			stepdistance.splice((indexMin), 1);
			var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
			var minnexstep = nextsteps[indexMin];
			var nextsteprow = minnexstep.row;
			var nextstepcol = minnexstep.col;
			nextstepiswall = walls.filter(function (d) { return d.row == nextsteprow && d.col == nextstepcol; });
			tries++;
		}

		// Did not manage to find path
		if (tries == maxTries) {
			// Set new target for agent
			goToNonShopsArea(agent);
		} else {
			var newRow = nextsteprow;
			var newCol = nextstepcol;

		// update the location of the agent
		agent.location.row = newRow;
		agent.location.col = newCol;
		}
	}
}

var cumulativeTotalCost = 0;

function TotalCost(costOfOperation, numberOfFood, numberOfRetail, currentTime) {
    // Compute total cost of operation
	cumulativeTotalCost = 0
	cumulativeTotalCost = cumulativeTotalCost + (costOfOperation * (numberOfFood + numberOfRetail) * (currentTime - 1));
	return cumulativeTotalCost;
}

var totalWaitingTime = 0;

function updateWaitingTime() {
    // Compute waiting time	
	var servedAgents = nextCheckedagentID - 1;
	return totalWaitingTime/servedAgents;
}

function removeDynamicAgents() {
	// We need to remove agents who have been discharged. 
	//Select all svg elements of class "agent" and map it to the data list called agents
	var allagents = surface.selectAll(".agent").data(agents);
	//Select all the svg groups of class "agent" whose state is EXITED
	var exitedagents = allagents.filter(function (d, i) { return d.state == EXITED; });
	// Remove the svg groups of EXITED agents: they will disappear from the screen at this point
	exitedagents.remove();

	// Remove the EXITED agents from the agents list using a filter command
	agents = agents.filter(function (d) { return d.state != EXITED; });
	// At this point the agents list should match the images on the screen one for one 
	// and no agents should have state EXITED
}
function updateDynamicAgents() {
	// loop over all the agents and update their states
	for (var agentIndex in agents) {
		updateagent(agentIndex);
	}
	updateSurface();
}

function updateProfitChart(cumulativeTotalProfit) {
    var ctx = document.getElementById('profitChart').getContext('2d');
    if (!window.profitLineChart) {
        window.profitLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Profits',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Light red background
                    borderColor: 'rgba(255, 99, 132, 1)', // Solid red border
                    borderWidth: 2,
                    pointRadius: 2,
                    fill: false // Do not fill under the line
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cumulative Profit',
                        font: {
                            size: 20
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    x: { // Updated for Chart.js 3.x
                        title: {
                            display: true,
                            text: 'Time',
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            display: true,
                            drawBorder: true
                        },
                        ticks: {
                            display: true
                        }
                    },
                    y: { // Updated for Chart.js 3.x
                        title: {
                            display: true,
                            text: 'Profits',
                            font: {
                                size: 14
                            }
                        },
                        ticks: {
                            display: true,
                            beginAtZero: true,
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // If chart already exists, just update the data
        window.profitLineChart.data.labels.push(currentTime.toString());
        window.profitLineChart.data.datasets[0].data.push(cumulativeTotalProfit);
        window.profitLineChart.update();
    }
}

var totalOccupied = 0;
var foodShopOccupied = 0;
var retailShopOccupied = 0;
var foodRevenue = 0;
var retailRevenue = 0;
var totalRevenue = 0;
var cumulativeFoodRevenue = 0;
var cumulativeRetailRevenue = 0;
var cumulativeTotalRevenue = 0;
var cumulativeTotalProfit = 0;
// Variables for output to csv
var output = null;
var csvAggregate = [ ];  
var csvAgent = [ ];

function calculateTotalFoodShopOccupied(numberOfFood, shops, totalOccupied) {
    // Reset foodShopOccupied to 0 before counting
    foodShopOccupied = 0;
	retailShopOccupied = 0;

    // Calculate the total occupied shops
    foodShopOccupied = shops.reduce((total, shop, index) => {
        // Check if the index is within the range of the first numberOfFood * 8 shops
        if (index < numberOfFood * 8) {
            // Increment total by the state of the current shop
            return total + shop.state;
        } else {
            // If the index is beyond the range, return the current total unchanged
            return total;
        }
    }, 0);
	retailShopOccupied = totalOccupied - foodShopOccupied
    return foodShopOccupied, retailShopOccupied;
}

function calculateTotalOccupied(shops) {
    // Reset totalOccupied to 0 before counting
    totalOccupied = 0;

    // Calculate the total occupied shops
    totalOccupied = shops.reduce((total, shop) => {
        return total + shop.state;
    }, 0);
}

function TotalRevenue(foodShopOccupied, retailShopOccupied, profitOfFood, profitOfRetail) {
	foodRevenue = 0;
	retailRevenue = 0;
	totalRevenue = 0;
    // Calculate revenue for food shops
    foodRevenue = foodShopOccupied * profitOfFood;

    // Calculate revenue for retail shops
    retailRevenue = retailShopOccupied * profitOfRetail;

    // Calculate total revenue
    totalRevenue = foodRevenue + retailRevenue;

	cumulativeFoodRevenue = cumulativeFoodRevenue + foodRevenue;
	cumulativeRetailRevenue = cumulativeRetailRevenue + retailRevenue;
	cumulativeTotalRevenue = cumulativeTotalRevenue + totalRevenue;
    return foodRevenue, retailRevenue, totalRevenue, cumulativeFoodRevenue, cumulativeRetailRevenue, cumulativeTotalRevenue;
}

function TotalProfit(cumulativeTotalRevenue, cumulativeTotalCost) {
    // Calculate total profit
    cumulativeTotalProfit = cumulativeTotalRevenue - cumulativeTotalCost
    return cumulativeTotalProfit;
}

function simStep() {
	//This function is called by a timer; if running, it executes one simulation step 
	//The timing interval is set in the page initialization function near the top of this file
	if (isRunning) { //the isRunning variable is toggled by toggleSimStep
		// Increment current time (for computing statistics)
		currentTime++;
		updateProfitChart(cumulativeTotalProfit);
		console.log(currentTime);
		calculateTotalOccupied(shops);
		calculateTotalFoodShopOccupied(numberOfFood, shops, totalOccupied);
		TotalRevenue(foodShopOccupied, retailShopOccupied, profitOfFood, profitOfRetail);
		TotalCost(costOfOperation, numberOfFood, numberOfRetail, currentTime); // Update totalCost
		TotalProfit(cumulativeTotalRevenue, cumulativeTotalCost)
		
		// Update totalRevenue in the HTML
		document.getElementById("totalRevenue").textContent = cumulativeTotalRevenue.toFixed(2); // Format totalRevenue to 2 decimal places
		// Update totalProfit in the HTML
		document.getElementById("totalProfit").textContent = cumulativeTotalProfit.toFixed(2); // Format totalProfit to 2 decimal places
		// Update totalCost in the HTML
		document.getElementById("totalCost").textContent = cumulativeTotalCost.toFixed(2); // Format totalCost to 2 decimal places


		if (totalWaitingTime > 0 && nextCheckedagentID > 1) {
			averageWaitingTime = updateWaitingTime();
			document.getElementById("averageWaitingTime").textContent = averageWaitingTime.toFixed(2); // Format totalCost to 2 decimal places
		}

		
		output = {"Time": currentTime,"Food Revenue": foodRevenue, "Retail Revenue": retailRevenue, "Revenue": cumulativeTotalRevenue,"Cost": cumulativeTotalCost,"Profit": cumulativeTotalRevenue-cumulativeTotalCost,"AverageWaitingTime": averageWaitingTime};
		csvAggregate.push(JSON.stringify(output));
		
		// output in console.log to get data out to analyse
		console.log(csvAggregate);
		console.log(csvAgent);
		

		// Sometimes new agents will be created in the following function
		addDynamicAgents();
		// In the next function we update each agent
		updateDynamicAgents();
		// Sometimes agents will be removed in the following function
		removeDynamicAgents();
	}
}
