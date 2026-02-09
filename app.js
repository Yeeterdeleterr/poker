const suits = [
  { symbol: "♠", color: "black" },
  { symbol: "♥", color: "red" },
  { symbol: "♦", color: "red" },
  { symbol: "♣", color: "black" },
];
const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const botNames = [
  "Nova",
  "Maverick",
  "Jinx",
  "Echo",
  "Orbit",
  "Vega",
  "Blaze",
  "Rogue",
];

const seatPositions = [
  { top: "12%", left: "50%", transform: "translate(-50%, -20%)" },
  { top: "28%", left: "82%", transform: "translate(-50%, -20%)" },
  { top: "68%", left: "82%", transform: "translate(-50%, -20%)" },
  { top: "84%", left: "50%", transform: "translate(-50%, -80%)" },
  { top: "68%", left: "18%", transform: "translate(-50%, -20%)" },
  { top: "28%", left: "18%", transform: "translate(-50%, -20%)" },
];

const seatsEl = document.getElementById("seats");
const communityEl = document.getElementById("community");
const summaryEl = document.getElementById("handSummary");
const humanCountInput = document.getElementById("humanCount");
const newHandBtn = document.getElementById("newHand");
const toggleQrBtn = document.getElementById("toggleQr");
const qrPanel = document.getElementById("qrPanel");
const qrCodeEl = document.getElementById("qrCode");
const qrLinkEl = document.getElementById("qrLink");

let deck = [];
let tableId = crypto.randomUUID().split("-")[0];
let qrVisible = false;

function buildDeck() {
  const fresh = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      fresh.push({ suit: suit.symbol, color: suit.color, rank });
    }
  }
  return fresh;
}

function shuffle(cards) {
  const array = [...cards];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCard(card) {
  const el = document.createElement("div");
  el.className = `card ${card.color === "red" ? "red" : ""}`;
  el.innerHTML = `
    <span>${card.rank}</span>
    <span class="suit">${card.suit}</span>
  `;
  return el;
}

function createCardBack() {
  const el = document.createElement("div");
  el.className = "card back";
  return el;
}

function setupPlayers() {
  const humanCount = Math.max(1, Math.min(6, Number(humanCountInput.value || 1)));
  humanCountInput.value = humanCount;

  const players = [];
  for (let i = 0; i < 6; i += 1) {
    if (i < humanCount) {
      players.push({ name: `You ${i + 1}`, type: "human" });
    } else {
      const name = botNames[i - humanCount] || `Bot ${i + 1}`;
      players.push({ name, type: "bot" });
    }
  }
  return players;
}

function dealHand(players) {
  deck = shuffle(buildDeck());
  const hands = players.map((player) => ({ ...player, cards: [] }));

  for (let round = 0; round < 2; round += 1) {
    for (const player of hands) {
      player.cards.push(deck.pop());
    }
  }

  const community = [];
  for (let i = 0; i < 5; i += 1) {
    community.push(deck.pop());
  }

  return { hands, community };
}

function renderSeats(hands) {
  seatsEl.innerHTML = "";
  hands.forEach((player, index) => {
    const seat = document.createElement("div");
    seat.className = "seat";
    seat.style.top = seatPositions[index].top;
    seat.style.left = seatPositions[index].left;
    seat.style.transform = seatPositions[index].transform;

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = player.name;

    const stack = document.createElement("div");
    stack.className = "stack";
    stack.textContent = player.type === "human" ? "Stack: $1200" : "Bot ready";

    const cards = document.createElement("div");
    cards.className = "cards";
    player.cards.forEach((card, idx) => {
      cards.appendChild(player.type === "bot" ? createCardBack() : createCard(card));
      if (player.type === "bot" && idx === 1) {
        cards.lastChild.style.opacity = "0.7";
      }
    });

    seat.appendChild(name);
    seat.appendChild(cards);
    seat.appendChild(stack);
    seatsEl.appendChild(seat);
  });
}

function renderCommunity(cards) {
  communityEl.innerHTML = "";
  cards.forEach((card) => {
    communityEl.appendChild(createCard(card));
  });
}

function renderSummary(hands, community) {
  summaryEl.innerHTML = "";
  hands.forEach((player) => {
    const li = document.createElement("li");
    const cardList = player.cards.map((card) => `${card.rank}${card.suit}`).join(" ");
    li.textContent = `${player.name} → ${cardList}`;
    summaryEl.appendChild(li);
  });
  const communityLi = document.createElement("li");
  communityLi.textContent = `Board: ${community.map((card) => `${card.rank}${card.suit}`).join(" ")}`;
  summaryEl.appendChild(communityLi);
}

function buildQrUrl() {
  const base = window.location.origin === "null" ? "http://localhost:8080" : window.location.origin;
  return `${base}${window.location.pathname}?table=${tableId}`;
}

function updateQr() {
  const url = buildQrUrl();
  qrLinkEl.textContent = url;
  qrCodeEl.innerHTML = "";
  if (window.QRCode) {
    new QRCode(qrCodeEl, {
      text: url,
      width: 180,
      height: 180,
      colorDark: "#0d0d0d",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  } else {
    qrCodeEl.textContent = "QR generator not available.";
  }
}

function newHand() {
  const players = setupPlayers();
  const { hands, community } = dealHand(players);
  renderSeats(hands);
  renderCommunity(community);
  renderSummary(hands, community);
}

newHandBtn.addEventListener("click", newHand);

humanCountInput.addEventListener("change", newHand);

toggleQrBtn.addEventListener("click", () => {
  qrVisible = !qrVisible;
  qrPanel.classList.toggle("active", qrVisible);
  qrPanel.setAttribute("aria-hidden", String(!qrVisible));
  if (qrVisible) {
    updateQr();
  }
});

newHand();
