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
const urlServer = "images/People-Male-icon.png";
const urlChair = "images/Chair-icon.png";


var serverRow = 22;
var serverCol = 4;
var shopNumRows = 3;
var shopNumCols = 3;
var exitRow = 3;
var exitCol = 12;


// agent enters the airport UNCHECKED, then QUEUING for immigration, then IMMIGRATION, then CHECKED
const UNCHECKED=0;
const WAITING=1;
const IMMIGRATION=2;
const CHECKED=3;
const BOARDED=4;
const EXITED=5;

// immigration server can either be idle or busy
const IDLE = 0;
const BUSY = 1;

// chairscan either be empty or occupied
const EMPTY = 0;
const OCCUPIED = 1;

// agents is a dynamic list, initially empty
var agents = [];
// servers is a static list, populated with a server and a server	
var servers = [
    {"label":"Immigration Counter","location":{"row":serverRow,"col":serverCol},"state":IDLE},
];
var server = servers[0]; // the server is the first element of the servers list.

// We can section our screen into different areas. In this model, the waiting area and the staging area are separate.
var areas = [
	{ "label": "Immigration Area", "startRow": serverRow + 1, "numRows": 1, "startCol": serverCol-3, "numCols": 6},
	{ "label": "Seating Area", "startRow": 12, "numRows": 4, "startCol": 10, "numCols": 5 },
	{ "label": "Transit Area", "startRow": 3, "numRows": 21, "startCol": 0, "numCols": 25},
	// { "label": "Test Area", "startRow": 19, "numRows": 5, "startCol": 13, "numCols": 5, "color": "purple" },
]

var shops = [
	{ "label": "Toilet", "startRow": 22, "numRows": 1, "startCol": 20, "numCols": 5},
	{ "label": "Shop 1", "startRow": 3, "numRows": 2, "startCol": 1, "numCols": 5},
	{ "label": "Shop 2", "startRow": 7, "numRows": 2, "startCol": 1, "numCols": 5},
	{ "label": "Shop 3", "startRow": 11, "numRows": 2, "startCol": 1, "numCols": 5},
	{ "label": "Shop 4", "startRow": 15, "numRows": 2, "startCol": 1, "numCols": 5},
	{ "label": "Shop 5", "startRow": 19, "numRows": 2, "startCol": 1, "numCols": 5},
	{ "label": "Shop 6", "startRow": 3, "numRows": 2, "startCol": 15, "numCols": 5},
	{ "label": "Shop 7", "startRow": 3, "numRows": 5, "startCol": 20, "numCols": 5},
	{ "label": "Shop 8", "startRow": 10, "numRows": 2, "startCol": 20, "numCols": 5},
	{ "label": "Shop 9", "startRow": 14, "numRows": 2, "startCol": 20, "numCols": 5},
	{ "label": "Shop 10", "startRow": 18, "numRows": 2, "startCol": 20, "numCols": 5}
]

var seatingArea = areas[1];
var transitArea = areas[2];
// shops are ordered left to right, top to bottom
var shop1 = shops[1];
var shop2 = shops[2];
var shop3 = shops[3];
var shop4 = shops[4];
var shop5 = shops[5];
var shop6 = shops[6];
var shop7 = shops[7];
var shop8 = shops[8];
var shop9 = shops[9];
var shop10 = shops[10];

var seatingCoordinates = [
	[seatingArea.startRow, seatingArea.startCol + 1],
	[seatingArea.startRow, seatingArea.startCol + 2],
	[seatingArea.startRow, seatingArea.startCol + 3],
	[seatingArea.startRow + 1, seatingArea.startCol],
	[seatingArea.startRow + 2, seatingArea.startCol],
	[seatingArea.startRow + 3, seatingArea.startCol],
	[seatingArea.startRow + 1, seatingArea.startCol + seatingArea.numCols - 1],
	[seatingArea.startRow + 2, seatingArea.startCol + seatingArea.numCols - 1],
	[seatingArea.startRow + 3, seatingArea.startCol + seatingArea.numCols - 1]
];

// Each shop is 2x2
var shopCoordinates = [
	// shops on the left
	[shops[1].startRow, shops[1].startCol+2],
	[shops[1].startRow, shops[1].startCol+3],
	[shops[1].startRow+1, shops[1].startCol+2],
	[shops[1].startRow+1, shops[1].startCol+3],
	[shops[2].startRow, shops[2].startCol+2],
	[shops[2].startRow, shops[2].startCol+3],
	[shops[2].startRow+1, shops[2].startCol+2],
	[shops[2].startRow+1, shops[2].startCol+3],
	[shops[3].startRow, shops[3].startCol+2],
	[shops[3].startRow, shops[3].startCol+3],
	[shops[3].startRow+1, shops[3].startCol+2],
	[shops[3].startRow+1, shops[3].startCol+3],
	[shops[4].startRow, shops[4].startCol+2],
	[shops[4].startRow, shops[4].startCol+3],
	[shops[4].startRow+1, shops[4].startCol+2],
	[shops[4].startRow+1, shops[4].startCol+3],
	[shops[5].startRow, shops[5].startCol+2],
	[shops[5].startRow, shops[5].startCol+3],
	[shops[5].startRow+1, shops[5].startCol+2],
	[shops[5].startRow+1, shops[5].startCol+3],
	// shops on the right
	[shops[6].startRow, shops[6].startCol+2],
	[shops[6].startRow, shops[6].startCol+3],
	[shops[6].startRow+1, shops[6].startCol+2],
	[shops[6].startRow+1, shops[6].startCol+3],
	[shops[7].startRow+2, shops[7].startCol+1],
	[shops[7].startRow+2, shops[7].startCol+2],
	[shops[7].startRow+3, shops[7].startCol+1],
	[shops[7].startRow+3, shops[7].startCol+2],
	[shops[8].startRow, shops[8].startCol+2],
	[shops[8].startRow, shops[8].startCol+3],
	[shops[8].startRow+1, shops[8].startCol+2],
	[shops[8].startRow+1, shops[8].startCol+3],
	[shops[9].startRow, shops[9].startCol+2],
	[shops[9].startRow, shops[9].startCol+3],
	[shops[9].startRow+1, shops[9].startCol+2],
	[shops[9].startRow+1, shops[9].startCol+3],
	[shops[10].startRow, shops[10].startCol+2],
	[shops[10].startRow, shops[10].startCol+3],
	[shops[10].startRow+1, shops[10].startCol+2],
	[shops[10].startRow+1, shops[10].startCol+3]
]

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

var currentTime = 0;

// agent arrival into immigration queue
var probArrival = 0.1;
// immigration server service rate
var probDeparture = 0.1;

// agent probability to shops, toilet, seats
var probShopping = 0.8;
var probSit = 0.2;

// To manage the queues, we need to keep track of agentIDs.
var nextagentID = 0; // increment this and assign it to the next admitted agent 
var nextTreatedagentID = 1; //this is the id of the next agent to be treated by the server

// This next function is executed when the script is loaded. It contains the page initialization code.
(function () {
	// Your page initialization code goes here
	// All elements of the DOM will be available here
	window.addEventListener("resize", redrawWindow); //Redraw whenever the window is resized
	simTimer = window.setInterval(simStep, animationDelay); // call the function simStep every animationDelay milliseconds
	redrawWindow();
})();

function initialiseAirport() {
	surface = d3.select('#surface');

	//init immigration
	var allservers = surface.selectAll(".server").data(servers);
	var newservers = allservers.enter().append("g").attr("class", ".server");
	newservers.append("svg:image")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return cell.x + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return cell.y + "px"; })
		.attr("width", Math.min(cellWidth, cellHeight) + "px")
		.attr("height", Math.min(cellWidth, cellHeight) + "px")
		.attr("xlink:href", urlServer);

	// It would be nice to label the servers, so we add a text element to each new server group
	newservers.append("text")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return (cell.x + cellWidth - 30) + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return (cell.y + cellHeight / 2 - 20) + "px"; })
		.attr("dy", ".35em")
		.text(function (d) { return d.label; });

	//init chairs
	var chairs = surface.selectAll(".seats").data(seats).enter();
	chairs.append("svg:image")
		.attr("x", function (d) { var cell = getLocationCell(d.location); return cell.x + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return cell.y + "px"; })
		.attr("width", Math.min(cellWidth, cellHeight))
		.attr("height", Math.min(cellWidth, cellHeight))
		.attr("xlink:href", urlChair);
}

// We need a function to start and pause the the simulation.
function toggleSimStep() {
	//this function is called by a click event on the html page. 
	// Search BasicAgentModel.html to find where it is called.
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
	nextTreatedagentID = 1;
	currentTime = 0;
	server.state = IDLE;
	agents = [];


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
	drawsurface.style.backgroundImage = "url('images/background-edited.png')";
	drawsurface.style.backgroundSize = "cover";
	drawsurface.style.backgroundSize = "100%";
	drawsurface.innerHTML = ''; // This empties the contents of the drawing surface, like jQuery erase().

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
	initialiseAirport();
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
		.attr("xlink:href", urlAgent);

	//Animation of agents
	var images = allagents.selectAll("image");
	// Next we define a transition for each of these image elements.
	// Note that we only need to update the attributes of the image element which change
	images.transition()
		.attr("x", function (d) { var cell = getLocationCell(d.location); return cell.x + "px"; })
		.attr("y", function (d) { var cell = getLocationCell(d.location); return cell.y + "px"; })
		.duration(animationDelay).ease('sin'); // This specifies the speed and type of transition we want.

	// Finally, we would like to draw boxes around the different areas of our system. We can use d3 to do that too.

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

function addDynamicAgents() {
	//randomly generate certain amount of cash for agent
	//takes into account the family size
	//time left is in miliseconds, with lower bound of 60 minutes
	var allagents = surface.selectAll(".agent").data(agents);
	var waitingagents = allagents.filter(function (d, i) { return d.state == WAITING; });
	var queue = waitingagents.size();
	if (Math.random() < probArrival) {
		var newagent = {
			"id": 1, "location": { "row": serverRow+1, "col": 0 },
			"target": {
				"row": serverRow + 1,
				"col": serverCol - queue
			},
			"state": UNCHECKED,
			"timeLeft": Math.round(Math.random() * 100000 + 36000),
			"cashLeft": Math.round(Math.random() * 400 + 10),
			"size": Math.floor(Math.random() * 5),
			"shopIndex": null,
			"seatIndex": null,
		};
		agents.push(newagent);
	}
}

function goToTransit(agent) {
	agent.target.row = transitArea.startRow+Math.floor(Math.random()*transitArea.numRows);
	agent.target.col = transitArea.startCol + Math.floor(Math.random() * transitArea.numCols);
}

function resetShopState(agent) {
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
			break;
		case WAITING:
			if (server.state == IDLE) {
				if (agent.id == nextTreatedagentID & hasArrived) {
					agent.target.col = serverCol;
					server.state = BUSY;
					agent.state = IMMIGRATION;
				}
				else {
					agent.target.col = col+1;
				}
			}
			break;
		case IMMIGRATION:
            if (Math.random()< probDeparture){
				server.state = IDLE;
				goToTransit(agent);
                nextTreatedagentID++;
                agent.state = CHECKED;
            }
			break;

		case CHECKED:
			var timeLeft = agent.timeLeft - currentTime;
			agent.timeLeft = timeLeft;

			resetShopState(agent);
			resetSeatState(agent);

			if (timeLeft <= 0) {
				agent.target.row = exitRow;
				agent.target.col = exitCol;
				agent.state = BOARDED;
			} else {
				var random = Math.random();
				if (random < probSit) {
					// Let agent go sit
					var seatIndex = Math.floor(Math.random() * seats.length);
					var seatState = seats[seatIndex].state;
					var maxTries = shops.length / 2;
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
						goToTransit(agent);
					// else, go to a seat
					} else {
						var seatLocation = seats[seatIndex].location;
						agent.target.row = seatLocation.row;
						agent.target.col = seatLocation.col;
						agent.seatIndex = seatIndex;
						seats[seatIndex].state = OCCUPIED;
					}

				} else if (random > probShopping) {
					// Let agent go shopping
					var shopIndex = Math.floor(Math.random() * shops.length);
					var shopState = shops[shopIndex].state;
					var maxTries = shops.length / 2;
					var tries = 0;
					// Try to find an empty spot in a shop
					// but limit the number of tries to prevent an infinite loop
					while (shopState == OCCUPIED && tries != maxTries) {
						shopIndex = Math.floor(Math.random() * shops.length);
						shopState = shops[shopIndex].state;
						tries++;
					}
					// If the spot in the shop is occupied at this point, go to a random spot in transit
					if (shopState == OCCUPIED) {
						goToTransit(agent);
					} else {
						// else, go to a spot in a shop
						var shopLocation = shops[shopIndex].location;
						agent.target.row = shopLocation.row;
						agent.target.col = shopLocation.col;
						agent.shopIndex = shopIndex;
						shops[shopIndex].state = OCCUPIED;
					}
				} else {
					goToTransit(agent);
				}
			}

			break;

		case BOARDED:
			if (hasArrived) {
				resetShopState(agent);
				resetSeatState(agent);
                agent.state = EXITED;
            }
			break;
		default:
			break;
	}
	// set the destination row and column
	var targetRow = agent.target.row;
	var targetCol = agent.target.col;
	// compute the distance to the target destination
	var rowsToGo = targetRow - row;
	var colsToGo = targetCol - col;
	// set the speed
	var cellsPerStep = 1;
	// compute the cell to move to
	var newRow = row + Math.min(Math.abs(rowsToGo), cellsPerStep) * Math.sign(rowsToGo);
	var newCol = col + Math.min(Math.abs(colsToGo), cellsPerStep) * Math.sign(colsToGo);
	// update the location of the agent
	agent.location.row = newRow;
	agent.location.col = newCol;

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

function simStep() {
	//This function is called by a timer; if running, it executes one simulation step 
	//The timing interval is set in the page initialization function near the top of this file
	if (isRunning) { //the isRunning variable is toggled by toggleSimStep
		// Increment current time (for computing statistics)
		currentTime++;
		// Sometimes new agents will be created in the following function
		addDynamicAgents();
		// In the next function we update each agent
		updateDynamicAgents();
		// Sometimes agents will be removed in the following function
		removeDynamicAgents();
	}
}