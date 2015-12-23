// vars
var contactPosition = 15;
var numElectrons = 0;
var footPosition;
var dischargeMsg = "A discharge has occurred";

// Elements
var description = document.getElementById("phet-description");
var footSlider = document.getElementById("phet-foot-slider");
var handSlider = document.getElementById("phet-hand-slider");
var electrons = document.getElementById("phet-numElectrons");
var restartBtn = document.getElementById("phet-restart");

var alertElm = document.createElement("p");
alertElm.setAttribute("role", "alert");
var alertMsg = document.createTextNode(dischargeMsg);
alertElm.appendChild(alertMsg);

// methods
var addAlert = function () {
    description.parentNode.insertBefore(alertElm, description);
};

var removeAlert = function () {
    if (description.parentNode.contains(alertElm)) {
        description.parentNode.removeChild(alertElm);
    }
};

var discharge = function (newPos) {
    if (newPos === contactPosition) {
        numElectrons = 0;
        electrons.value = numElectrons;
        addAlert();
    }
}

var updateElectrons = function (newPos) {
    if (newPos === contactPosition || (Math.max(newPos, footPosition) > contactPosition && Math.min(newPos, footPosition) < contactPosition)) {
        numElectrons++;
        electrons.value = numElectrons;
        removeAlert();
    }
};

var setFootValueText = function (newPos) {
    //TODO: Set proper message based on position
    var msg = "Position " + newPos;

    footSlider.setAttribute("aria-valuetext", msg);
};

// event binding
footSlider.addEventListener("input", function (e) {
    var newPos = Number(e.target.value);
    updateElectrons(newPos);
    footPosition = newPos;
    setFootValueText(newPos);
}, false);

handSlider.addEventListener("input", function (e) {
    var newPos = Number(e.target.value);
    discharge(newPos);
});

restartBtn.addEventListener("click", function (e) {
    // TODO: reload the model instead of the page
    document.location.reload(true);
});

footPosition = footSlider.value
