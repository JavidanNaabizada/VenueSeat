
/* Venue data */
const sections = [
  {
    name: "VIP",
    rows: 3,
    seatsPerRow: 10,
    price: 50,
    className: "vip"
  },
  {
    name: "Standard",
    rows: 6,
    seatsPerRow: 12,
    price: 30,
    className: "standard"
  },
  {
    name: "Economy",
    rows: 5,
    seatsPerRow: 14,
    price: 15,
    className: "economy"
  }
];

const seatContainer = document.getElementById("seat-container");
const seatDetails = document.getElementById("seat-details");
const addButton = document.getElementById("add-to-cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

const seats = [];
const cart = [];

let selectedSeat = null;
let rowNumber = 0;

/* Generate seat data */

sections.forEach(function(section) {
  for (let row = 1; row <= section.rows; row++) {
    const rowLetter = String.fromCharCode(65 + rowNumber);

    for (let number = 1; number <= section.seatsPerRow; number++) {
      const seat = {
        id: rowLetter + number,
        section: section.name,
        row: rowLetter,
        number: number,
        price: section.price,
        className: section.className,
        status: "available"
      };

      // Some seats are already unavailable
      if (number === 3 && row % 3 === 0) {
        seat.status = "unavailable";
      }

      seats.push(seat);
    }

    rowNumber++;
  }
});

/* Display the venue */
function createVenue() {
  seatContainer.innerHTML = "";

  sections.forEach(function(section) {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "seat-section";

    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "section-title";
    sectionTitle.textContent = section.name + " - " + section.price + " AZN";

    sectionDiv.appendChild(sectionTitle);

    const sectionSeats = seats.filter(function(seat) {
      return seat.section === section.name;
    });

    const rows = [...new Set(sectionSeats.map(function(seat) {
      return seat.row;
    }))];

    rows.forEach(function(rowLetter) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "seat-row";

      const rowLabel = document.createElement("span");
      rowLabel.className = "row-label";
      rowLabel.textContent = rowLetter;
      rowDiv.appendChild(rowLabel);

      const rowSeats = sectionSeats.filter(function(seat) {
        return seat.row === rowLetter;
      });

      rowSeats.forEach(function(seat) {
        const seatButton = document.createElement("button");

        seatButton.type = "button";
        seatButton.className = "seat " + seat.className + " " + seat.status;
        seatButton.textContent = seat.number;
        seatButton.dataset.id = seat.id;

        seatButton.title =
          seat.section + " - Row " + seat.row +
          " - Seat " + seat.number +
          " - " + seat.price + " AZN";

        if (seat.status === "unavailable") {
          seatButton.disabled = true;
        }

        seatButton.addEventListener("click", function() {
          inspectSeat(seat.id);
        });

        rowDiv.appendChild(seatButton);
      });

      sectionDiv.appendChild(rowDiv);
    });

    seatContainer.appendChild(sectionDiv);
  });
}

/* Inspect a seat */
function inspectSeat(seatId) {
  const seat = seats.find(function(item) {
    return item.id === seatId;
  });

  if (!seat || seat.status === "unavailable") {
    return;
  }

  selectedSeat = seat;

  seatDetails.innerHTML = `
    <div class="seat-info">
      <p><span>Section</span><strong>${seat.section}</strong></p>
      <p><span>Row</span><strong>${seat.row}</strong></p>
      <p><span>Seat</span><strong>${seat.number}</strong></p>
      <p><span>Price</span><strong>${seat.price} AZN</strong></p>
      <p><span>Status</span><strong>${seat.status === "in-cart" ? "In Cart" : "Available"}</strong></p>
    </div>
  `;

  addButton.disabled = seat.status === "in-cart";

  createVenue();
  updateSeatColors();
}

/* Update the inspected seat color */
function updateSeatColors() {
  const seatButtons = document.querySelectorAll(".seat");

  seatButtons.forEach(function(button) {
    if (
      selectedSeat &&
      button.dataset.id === selectedSeat.id &&
      selectedSeat.status === "available"
    ) {
      button.classList.remove("available");
      button.classList.add("inspected");
    }
  });
}

/* Add ticket */
function addToCart() {
  if (!selectedSeat) {
    return;
  }

  if (selectedSeat.status !== "available") {
    return;
  }

  const alreadyAdded = cart.some(function(ticket) {
    return ticket.id === selectedSeat.id;
  });

  if (alreadyAdded) {
    return;
  }

  selectedSeat.status = "in-cart";
  cart.push(selectedSeat);

  addButton.disabled = true;
  selectedSeat = null;

  seatDetails.innerHTML = `
    <div class="empty-state">
      <p>Ticket added successfully!</p>
      <small>Select another available seat.</small>
    </div>
  `;

  createVenue();
  displayCart();
  saveCart();
}

/* Display selected tickets */
function displayCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">No tickets added yet.</p>';
  }

  let total = 0;

  cart.forEach(function(ticket) {
    total += ticket.price;

    const item = document.createElement("div");
    item.className = "cart-item";

    item.innerHTML = `
      <div class="cart-item-info">
        <strong>${ticket.section} - ${ticket.row}${ticket.number}</strong>
        <span>${ticket.price} AZN</span>
      </div>
      <button type="button" class="remove-button">Remove</button>
    `;

    const removeButton = item.querySelector(".remove-button");

    removeButton.addEventListener("click", function() {
      removeTicket(ticket.id);
    });

    cartItems.appendChild(item);
  });

  cartCount.textContent = cart.length;
  cartTotal.textContent = total + " AZN";
}

/* Remove a ticket */
function removeTicket(seatId) {
  const ticketIndex = cart.findIndex(function(ticket) {
    return ticket.id === seatId;
  });

  if (ticketIndex === -1) {
    return;
  }

  const ticket = cart[ticketIndex];
  ticket.status = "available";

  cart.splice(ticketIndex, 1);

  selectedSeat = null;
  addButton.disabled = true;

  seatDetails.innerHTML = `
    <div class="empty-state">
      <p>No seat selected</p>
      <small>Click a seat to view its details.</small>
    </div>
  `;

  createVenue();
  displayCart();
  saveCart();
}

/* Button events */
addButton.addEventListener("click", addToCart);

/* Start the application */
createVenue();
displayCart();


/* Save and restore tickets */
function saveCart() {
  const ticketIds = cart.map(function(ticket) {
    return ticket.id;
  });

  localStorage.setItem("venueTickets", JSON.stringify(ticketIds));
}

function loadCart() {
  const savedTickets = localStorage.getItem("venueTickets");

  if (!savedTickets) {
    return;
  }

  let ticketIds;

  try {
    ticketIds = JSON.parse(savedTickets);
  } catch (error) {
    return;
  }

  if (!Array.isArray(ticketIds)) {
    return;
  }

  ticketIds.forEach(function(id) {
    const seat = seats.find(function(item) {
      return item.id === id;
    });

    if (seat && seat.status === "available") {
      seat.status = "in-cart";
      cart.push(seat);
    }
  });

  createVenue();
  displayCart();
}

/* Map navigation */
const venueMap = document.getElementById("venue-map");
const venueViewport = document.getElementById("venue-viewport");
const zoomLevel = document.getElementById("zoom-level");

let zoom = 1;
let moveX = 0;
let moveY = 0;

function updateMap() {
  venueMap.style.transform =
    "translate(" + moveX + "px, " + moveY + "px) scale(" + zoom + ")";

  zoomLevel.textContent = Math.round(zoom * 100) + "%";
}

document.getElementById("zoom-in").addEventListener("click", function() {
  if (zoom < 1.8) {
    zoom += 0.2;
    updateMap();
  }
});

document.getElementById("zoom-out").addEventListener("click", function() {
  if (zoom > 0.6) {
    zoom -= 0.2;
    updateMap();
  }
});


document.getElementById("move-up").addEventListener("click", function() {
  moveY += 40;
  updateMap();
});

document.getElementById("move-down").addEventListener("click", function() {
  moveY -= 40;
  updateMap();
});

document.getElementById("move-left").addEventListener("click", function() {
  moveX += 40;
  updateMap();
});

document.getElementById("move-right").addEventListener("click", function() {
  moveX -= 40;
  updateMap();
});



document.getElementById("reset-view").addEventListener("click", function() {
  zoom = 1;
  moveX = 0;
  moveY = 0;

  updateMap();

  venueViewport.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
  });
});


/* Restore saved tickets */
loadCart();
updateMap();
