/*************
 * variables *
 *************/

var doorKnobPosition = 50;
var numElectrons = 0;
var priorHandPosition;
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
// var footRubDesc = "John has rubbed his foot on the rug and has gained %electrons number of negative charges.";
var handAwayDesc = "His hand has moved away from the doorknob, and is %distance it.";
var handTowardDesc = "His hand has moved toward the doorknob, and is %distance it.";
var handNoChangeDesc = "His hand is %distance the doorknob";


/***********
 * Methods *
 ***********/

var toRegExp = function (str) {
    return new RegExp(str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "g");
};

var strTemplate = function (template, values) {
    for (var key in values) {
        var re = toRegExp("%" + key);
        template = template.replace(re, values[key]);
    }
  return template;
}

var updateDescription = function () {
    var currentHandPosition = Number(handSlider.value);
    var priorDist = getDistance(priorHandPosition, doorKnobPosition);
    var currentDist = getDistance(currentHandPosition, doorKnobPosition);

    var handTemplate = handNoChangeDesc;

    if (priorDist < currentDist) {
        handTemplate = handAwayDesc;
    } else if (priorDist > currentDist) {
        handTemplate = handTowardDesc;
    }

    // TODO: Convert distance number to a category message.
    description.textContent = strTemplate(handTemplate, {distance: currentDist});
    priorHandPosition = currentHandPosition;
};

var addAlert = function () {
    description.parentNode.insertBefore(alertElm, description);
};

var removeAlert = function () {
    if (description.parentNode.contains(alertElm)) {
        description.parentNode.removeChild(alertElm);
    }
};

var discharge = function (newPos) {
    if (newPos === doorKnobPosition) {
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

var getDistance = function (a, b) {
    return Math.abs(a - b);
};

var getHandMessage = function (newPos) {
    var distance = getDistance(newPos, doorKnobPosition);
    if (distance === 0) {
        return "closest to the doorknob";
    } else if (isWithin(distance, [1, 8])) {
        return "very close to the doorknob";
    } else if (isWithin(distance, [9, 16])) {
        return "close to the doorknob";
    } else if (isWithin(distance, [17, 24])) {
        return "somewhat close to the doorknob";
    } else if (isWithin(distance, [25, 32])) {
        return "neither far nor close to the doorknob";
    } else if (isWithin(distance, [33, 40])) {
        return "far from the doorknob";
    } else if (isWithin(distance, [41, 49])) {
        return "very far from the doorknob";
    } else if (distance === 50) {
        return "farthest from the doorknob";
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
    priorHandPosition = handPos;

    setFootValueText(footPos, true);
    setHandValueText(handPos);
};

/*****************
 * event binding *
 *****************/

var handleFoot = function (event) {
    var newPos = Number(event.target.value);
    updateElectrons(newPos);
    setFootValueText(newPos);
};

var handleHand = function (event) {
    var newPos = Number(event.target.value);
    setHandValueText(newPos);
    discharge(newPos);
    updateDescription();
};

// Due to the variability of input and change event firing across browsers,
// it is necessary to track if the input event was fired and if not, to
// handle the change event instead.
// see: https://wiki.fluidproject.org/pages/viewpage.action?pageId=61767683

var handInputEventFired = false;
var footInputEventFired = false;

// foot slider
footSlider.addEventListener("change", function (event) {
    if (!footInputEventFired) {
        handleFoot(event);
    }
    footInputEventFired = false;
}, false);
footSlider.addEventListener("input", function (event) {
    handleFoot(event);
    footInputEventFired = true;
}, false);

// hand slider
handSlider.addEventListener("change", function (event) {
    if (!handInputEventFired) {
        handleHand(event);
    }
    handInputEventFired = false;
});
handSlider.addEventListener("input", function (event) {
    handleHand(event);
    handInputEventFired = true;
});

// restart button
restartBtn.addEventListener("click", function (e) {
    setupSim(8, 38);
});

/********
 * Init *
 ********/
setupSim(8, 38);
