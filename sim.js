/*************
 * variables *
 *************/

var doorKnobPosition = 50;
var numElectrons = 0;
var priorHandPosition;
var priorHandPosition;
var priorFootPosition;
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
var handValueText = "Position %position, %distance the doorknob";


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
    var distanceDesc = getHandDistanceDesc(currentDist);

    var handTemplate = handNoChangeDesc;

    if (priorDist < currentDist) {
        handTemplate = handAwayDesc;
    } else if (priorDist > currentDist) {
        handTemplate = handTowardDesc;
    }

    description.textContent = strTemplate(handTemplate, {distance: distanceDesc});
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

var discharge = function (newPos, oldPos) {
    // Will fire a discharge if there is a charge gained and the hand crosses or lands on the doorknob.
    // However, if the newPos is at either extreme (0 or 100) no discharge will be fired. This is
    // to prevent the case where home/end are pressed on the keyboard and the hand jumps to the extreme.
    // It is believe that this is a special case and does not reflect a simulation of hand movement.
    if (isWithin(doorKnobPosition, [newPos, oldPos]) && numElectrons && newPos !== 100 && newPos) {
        numElectrons = 0;
        setElectronMessage(numElectrons);
        addAlert();
    }
}

var isOnFloor = function (newPos) {
    return newPos >= 10 && newPos <= 20;
};

// Based on: 
// Asaf Karagila (http://math.stackexchange.com/users/622/asaf-karagila),
// What is the Shortest possible formula to find the intersection between a set
// of two ranges of number, URL (version: 2010-12-29):
// http://math.stackexchange.com/q/15809
var numIntersectingPoints = function (range1, range2) {
    return Math.max(0, Math.min(range1.max, range2.max) - Math.max(range1.min, range2.min));
};

var electronsGained = function (newPos, oldPos) {
    var floor = {min: 10, max: 20};
    var pos = {
        min: Math.min(newPos, oldPos),
        max: Math.max(newPos, oldPos)
    };

    return numIntersectingPoints(floor, pos);
};

var addCharge = function (electrons) {
    numElectrons = Math.min(100, numElectrons + electrons);
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
    var gained = electronsGained(newPos, priorFootPosition);
    if (gained) {
        addCharge(gained);
        setElectronMessage(numElectrons);
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

var getHandDistanceDesc = function (distance) {
    if (distance === 0) {
        return "closest to";
    } else if (isWithin(distance, [1, 8])) {
        return "very close to";
    } else if (isWithin(distance, [9, 16])) {
        return "close to";
    } else if (isWithin(distance, [17, 24])) {
        return "somewhat close to";
    } else if (isWithin(distance, [25, 32])) {
        return "neither far nor close to";
    } else if (isWithin(distance, [33, 40])) {
        return "far from";
    } else if (isWithin(distance, [41, 49])) {
        return "very far from";
    } else if (distance === 50) {
        return "farthest from";
    }
};

var setHandValueText = function (newPos) {
    var distance = getDistance(newPos, doorKnobPosition);
    var distanceDesc = getHandDistanceDesc(distance);
    var valueText = strTemplate(handValueText, {position: newPos, distance: distanceDesc});

    handSlider.setAttribute("aria-valuetext", valueText);
}

var setSimDescription = function (text) {
    description.textContent = text;
};

var setupSim = function (footPos, handPos, electrons) {
    setSimDescription(defaultDesc);
    removeAlert();

    numElectrons = electrons || 0;
    footSlider.value = footPos;
    priorFootPosition = footPos;
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
    removeAlert();
    priorFootPosition = newPos;
};

var handleHand = function (event) {
    var newPos = Number(event.target.value);
    setHandValueText(newPos);
    discharge(newPos, priorHandPosition);
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
