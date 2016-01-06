// vars
var contactPosition = 15;
var numElectrons = 0;
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

// descriptions
var defaultDesc = "John is standing with a foot on the rug, and his hand is very close to the doorknob.";
var footRubDesc = "John has rubbed his foot on the rug and has gained %electrons number of negative charges.";
var handAwayDesc = "His hand has moved away from the doorknob, and is %distance it.";
var handTowardDesc = "His hand has moved toward the doorknob, and is %distance it.";
var handNoChangeDesc = "His hand is %distance the doorknob";


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
        setElectronMessage(numElectrons);
        addAlert();
    }
}

var isOnFloor = function (newPos) {
    return newPos >= 10 && newPos <= 20;
};

var addCharge = function () {
    numElectrons = Math.min(100, numElectrons + 1);
};

var getElectronsMessage = function (numElectrons) {
    if (numElectrons <= 0) {
        return "no negative charges";
    } else if (numElectrons < 34) {
        return "a small amount of negative charges";
    } else if (numElectrons < 67) {
        return "a moderate amount of negative charges";
    } else if (numElectrons >= 67) {
        return "a large amount of negative charges";
    }
};

var setElectronMessage = function (numElectrons) {
    var message = getElectronsMessage(numElectrons);
    electrons.textContent = message;
    electrons.setAttribute("aria-valuetext", message);
    electrons.value = numElectrons;
};

var updateElectrons = function (newPos) {
    if (isOnFloor(newPos)) {
        addCharge();
        setElectronMessage(numElectrons);
        removeAlert();
    }
};

var setFootValueText = function (newPos, isStart) {
    var msg = "foot is off the carpet";

    if (isOnFloor(newPos)) {
        msg = "foot is on the carpet.";
        msg += numElectrons < 100 && !isStart ? " A charge has been gained." : "";
    }

    var position = "Position " + newPos + ", " + msg;

    footSlider.setAttribute("aria-valuetext", position);
};

var isWithin = function (val, args) {
    for(var i = 1; i < arguments.length; i++) {
        range = arguments[i];
        var max = Math.max.apply(null, range);
        var min = Math.min.apply(null, range);
        if (max >= val && min <= val) {
            return true;
        }
    }
    return false;
};

var getHandMessage = function (newPos) {
    if (newPos === 15) {
        return "closest to the door knob";
    } else if (isWithin(newPos, [13, 14], [16, 17])) {
        return "very close to the door knob";
    } else if (isWithin(newPos, [8, 12], [18, 22])) {
        return "close to the door knob";
    } else if (isWithin(newPos, [3, 7], [23, 27])) {
        return "somewhat close to the door knob";
    } else if (isWithin(newPos, [0, 2], [28, 32], [58, 60])) {
        return "neither far or close to the door knob";
    } else if (isWithin(newPos, [33, 37], [53, 57])) {
        return "neither far or close to the door knob";
    } else if (isWithin(newPos, [38, 42], [48, 52])) {
        return "very far from the door knob";
    } else if (isWithin(newPos, [43, 47])) {
        return "farthest from the door knob";
    }
};

var setHandValueText = function (newPos) {
    var msg = getHandMessage(newPos);
    var position = "Position " + newPos + ", " + msg;

    handSlider.setAttribute("aria-valuetext", position);
}

var setSimDescription = function (text) {
    description.textContent = text;
};

var setupSim = function (footPos, handPos, electrons) {
    setSimDescription(defaultDesc);
    removeAlert();

    numElectrons = electrons || 0;
    footSlider.value = footPos;
    handSlider.value = handPos;

    setFootValueText(footPos, true);
    setHandValueText(handPos);
};

// event binding
var handleFoot = function (event) {
    var newPos = Number(event.target.value);
    updateElectrons(newPos);
    setFootValueText(newPos);
};

var handleHand = function (event) {
    var newPos = Number(event.target.value);
    setHandValueText(newPos);
    discharge(newPos);
};

// Handling both "input" and "change" events so that we get consistent updates
// from both keyboard and mouse across platforms.

footSlider.addEventListener("change", handleFoot, false);
footSlider.addEventListener("input", handleFoot, false);

handSlider.addEventListener("change", handleHand);
handSlider.addEventListener("input", handleHand);


restartBtn.addEventListener("click", function (e) {
    setupSim(8, 8);
});

// init
setupSim(8, 8);
