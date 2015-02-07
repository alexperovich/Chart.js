/*!
 * Chart.js
 * http://chartjs.org/
 * Version: {{ version }}
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 *
 * Ported to Typescript by https://github.com/alexperovich
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ChartJs;
(function (ChartJs) {
    "use strict";
    var Color = (function () {
        function Color(fill, stroke) {
            this.fill = fill;
            this.stroke = stroke;
        }
        return Color;
    })();
    ChartJs.Color = Color;
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    ChartJs.Point = Point;
    var AngleAndDistance = (function () {
        function AngleAndDistance(angle, distance) {
            this.angle = angle;
            this.distance = distance;
        }
        return AngleAndDistance;
    })();
    ChartJs.AngleAndDistance = AngleAndDistance;
    var SplineCurve = (function () {
        function SplineCurve(inner, outer) {
            this.inner = inner;
            this.outer = outer;
        }
        return SplineCurve;
    })();
    ChartJs.SplineCurve = SplineCurve;
    function cloneProperties(value) {
        var objClone = {};
        for (var prop in value) {
            if (value.hasOwnProperty(prop))
                objClone[prop] = value[prop];
        }
        return objClone;
    }
    ChartJs.cloneProperties = cloneProperties;
    function merge(options, defaults) {
        for (var prop in defaults) {
            if (!options.hasOwnProperty(prop)) {
                options[prop] = defaults[prop];
            }
        }
        return options;
    }
    ChartJs.merge = merge;
    function each(collection, callback, param) {
        if (collection.length) {
            var i;
            for (i = 0; i < collection.length; i++) {
                callback(collection[i], i, param);
            }
        }
        else {
            for (var item in collection) {
                if (collection.hasOwnProperty(item)) {
                    callback(collection[item], item, param);
                }
            }
        }
    }
    ChartJs.each = each;
    function where(collection, predicate) {
        var filtered = [];
        each(collection, function (item) {
            if (predicate(item)) {
                filtered.push(item);
            }
        });
        return filtered;
    }
    ChartJs.where = where;
    function findNextWhere(collection, predicate, startIndex) {
        if (!startIndex) {
            startIndex = -1;
        }
        for (var i = startIndex + 1; i < collection.length; i++) {
            var currentItem = collection[i];
            if (predicate(currentItem)) {
                return currentItem;
            }
        }
        return null;
    }
    ChartJs.findNextWhere = findNextWhere;
    function findPreviousWhere(collection, predicate, startIndex) {
        if (!startIndex) {
            startIndex = collection.length;
        }
        for (var i = startIndex - 1; i >= 0; i--) {
            var currentItem = collection[i];
            if (predicate(currentItem)) {
                return currentItem;
            }
        }
        return null;
    }
    ChartJs.findPreviousWhere = findPreviousWhere;
    var id = 0;
    function uid() {
        return "chart-" + id++;
    }
    function warn(str) {
        if (window.console && window.console.warn instanceof Function)
            window.console.warn(str);
    }
    ChartJs.warn = warn;
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    ChartJs.isNumber = isNumber;
    function max(array) {
        return Math.max.apply(Math, array);
    }
    ChartJs.max = max;
    function min(array) {
        return Math.min.apply(Math, array);
    }
    ChartJs.min = min;
    function clamp(value, minValue, maxValue) {
        return max([min([value, maxValue]), minValue]);
    }
    ChartJs.clamp = clamp;
    function getDecimalPlaces(num) {
        if (num % 1 !== 0 && isNumber(num)) {
            return num.toString().split(".")[1].length;
        }
        else {
            return 0;
        }
    }
    ChartJs.getDecimalPlaces = getDecimalPlaces;
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    ChartJs.toRadians = toRadians;
    function getAngleFromPoint(centerPoint, anglePoint) {
        var distanceFromXCenter = anglePoint.x - centerPoint.x, distanceFromYCenter = anglePoint.y - centerPoint.y, radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
        var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);
        //If the segment is in the top left quadrant, we need to add another rotation to the angle
        if (distanceFromXCenter < 0 && distanceFromYCenter < 0) {
            angle += Math.PI * 2;
        }
        return {
            angle: angle,
            distance: radialDistanceFromCenter
        };
    }
    ChartJs.getAngleFromPoint = getAngleFromPoint;
    function aliasPixel(pixelWidth) {
        return (pixelWidth % 2 === 0) ? 0 : 0.5;
    }
    ChartJs.aliasPixel = aliasPixel;
    function splineCurve(first, middle, after, t) {
        //Props to Rob Spencer at scaled innovation for his post on splining between points
        //http://scaledinnovation.com/analytics/splines/aboutSplines.html
        var d01 = Math.sqrt(Math.pow(middle.x - first.x, 2) + Math.pow(middle.y - first.y, 2)), d12 = Math.sqrt(Math.pow(after.x - middle.x, 2) + Math.pow(after.y - middle.y, 2)), fa = t * d01 / (d01 + d12), fb = t * d12 / (d01 + d12);
        return {
            inner: {
                x: middle.x - fa * (after.x - first.x),
                y: middle.y - fa * (after.y - first.y)
            },
            outer: {
                x: middle.x + fb * (after.x - first.x),
                y: middle.y + fb * (after.y - first.y)
            }
        };
    }
    ChartJs.splineCurve = splineCurve;
    function calculateOrderOfMagnitude(value) {
        return Math.floor(Math.log(value) / Math.LN10);
    }
    ChartJs.calculateOrderOfMagnitude = calculateOrderOfMagnitude;
    var ScaleRange = (function () {
        function ScaleRange(steps, stepValue, min, max) {
            this.steps = steps;
            this.stepValue = stepValue;
            this.min = min;
            this.max = max;
        }
        return ScaleRange;
    })();
    ChartJs.ScaleRange = ScaleRange;
    function calculateScaleRange(values, drawingSize, textSize, startFromZero, integersOnly) {
        //Set a minimum step of two - a point at the top of the graph, and a point at the base
        var minSteps = 2, maxSteps = Math.floor(drawingSize / (textSize * 1.5)), skipFitting = (minSteps >= maxSteps);
        var maxValue = max(values), minValue = min(values);
        // We need some degree of seperation here to calculate the scales if all the values are the same
        // Adding/minusing 0.5 will give us a range of 1.
        if (maxValue === minValue) {
            maxValue += 0.5;
            // So we don't end up with a graph with a negative start value if we've said always start from zero
            if (minValue >= 0.5 && !startFromZero) {
                minValue -= 0.5;
            }
            else {
                // Make up a whole number above the values
                maxValue += 0.5;
            }
        }
        var valueRange = Math.abs(maxValue - minValue), rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange), graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude), graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude), graphRange = graphMax - graphMin, stepValue = Math.pow(10, rangeOrderOfMagnitude), numberOfSteps = Math.round(graphRange / stepValue);
        while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
            if (numberOfSteps > maxSteps) {
                stepValue *= 2;
                numberOfSteps = Math.round(graphRange / stepValue);
                // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
                if (numberOfSteps % 1 !== 0) {
                    skipFitting = true;
                }
            }
            else {
                //If user has declared ints only, and the step value isn't a decimal
                if (integersOnly && rangeOrderOfMagnitude >= 0) {
                    //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
                    if (stepValue / 2 % 1 === 0) {
                        stepValue /= 2;
                        numberOfSteps = Math.round(graphRange / stepValue);
                    }
                    else {
                        break;
                    }
                }
                else {
                    stepValue /= 2;
                    numberOfSteps = Math.round(graphRange / stepValue);
                }
            }
        }
        if (skipFitting) {
            numberOfSteps = minSteps;
            stepValue = graphRange / numberOfSteps;
        }
        return {
            steps: numberOfSteps,
            stepValue: stepValue,
            min: graphMin,
            max: graphMin + (numberOfSteps * stepValue)
        };
    }
    ChartJs.calculateScaleRange = calculateScaleRange;
    //Templating methods
    //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
    function template(tmpl, values) {
        // If templateString is function rather than string-template - call the function for valuesObject
        if (tmpl instanceof Function) {
            return tmpl(values);
        }
        var cache = {};
        return (function (str, data) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ? cache[str] = cache[str] : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
            // Provide some basic currying to the user
            return data ? fn(data) : fn;
        })(tmpl, values);
    }
    ChartJs.template = template;
    function generateLabels(tmpl, numberOfSteps, graphMin, stepValue) {
        var labelsArray = new Array(numberOfSteps);
        if (tmpl) {
            each(labelsArray, function (val, index) {
                labelsArray[index] = template(tmpl, { value: (graphMin + (stepValue * (index + 1))) });
            });
        }
        return labelsArray;
    }
    ChartJs.generateLabels = generateLabels;
    var Statics = (function () {
        function Statics() {
        }
        Statics.ctor = (function () {
            Statics.easingEffects = {};
            Statics.easingEffects["linear"] = function (t) { return t; };
            Statics.easingEffects["easeInQuad"] = function (t) { return t * t; };
            Statics.easingEffects["easeOutQuad"] = function (t) { return -1 * t * (t - 2); };
            Statics.easingEffects["easeInOutQuad"] = function (t) {
                if ((t /= 1 / 2) < 1)
                    return 1 / 2 * t * t;
                return -1 / 2 * ((--t) * (t - 2) - 1);
            };
            Statics.easingEffects["easeInCubic"] = function (t) { return t * t * t; };
            Statics.easingEffects["easeOutCubic"] = function (t) { return 1 * ((t = t / 1 - 1) * t * t + 1); };
            Statics.easingEffects["easeInOutCubic"] = function (t) {
                if ((t /= 1 / 2) < 1)
                    return 1 / 2 * t * t * t;
                return 1 / 2 * ((t -= 2) * t * t + 2);
            };
            Statics.easingEffects["easeInQuart"] = function (t) { return t * t * t * t; };
            Statics.easingEffects["easeOutQuart"] = function (t) { return -1 * ((t = t / 1 - 1) * t * t * t - 1); };
            Statics.easingEffects["easeInOutQuart"] = function (t) {
                if ((t /= 1 / 2) < 1)
                    return 1 / 2 * t * t * t * t;
                return -1 / 2 * ((t -= 2) * t * t * t - 2);
            };
            Statics.easingEffects["easeInQuint"] = function (t) { return 1 * (t /= 1) * t * t * t * t; };
            Statics.easingEffects["easeOutQuint"] = function (t) { return 1 * ((t = t / 1 - 1) * t * t * t * t + 1); };
            Statics.easingEffects["easeInOutQuint"] = function (t) {
                if ((t /= 1 / 2) < 1)
                    return 1 / 2 * t * t * t * t * t;
                return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
            };
            Statics.easingEffects["easeInSine"] = function (t) { return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1; };
            Statics.easingEffects["easeOutSine"] = function (t) { return 1 * Math.sin(t / 1 * (Math.PI / 2)); };
            Statics.easingEffects["easeInOutSine"] = function (t) {
                return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
            };
            Statics.easingEffects["easeInExpo"] = function (t) { return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1)); };
            Statics.easingEffects["easeOutExpo"] = function (t) { return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1); };
            Statics.easingEffects["easeInOutExpo"] = function (t) {
                if (t === 0)
                    return 0;
                if (t === 1)
                    return 1;
                if ((t /= 1 / 2) < 1)
                    return 1 / 2 * Math.pow(2, 10 * (t - 1));
                return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
            };
            Statics.easingEffects["easeInCirc"] = function (t) {
                if (t >= 1)
                    return t;
                return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
            };
            Statics.easingEffects["easeOutCirc"] = function (t) {
                return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
            };
            Statics.easingEffects["easeInOutCirc"] = function (t) {
                if ((t /= 1 / 2) < 1)
                    return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
                return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
            };
            Statics.easingEffects["easeInElastic"] = function (t) {
                var s;
                var a = 1;
                if (t === 0)
                    return 0;
                if ((t /= 1) === 1)
                    return 1;
                var p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                }
                else
                    s = p / (2 * Math.PI) * Math.asin(1 / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            };
            Statics.easingEffects["easeOutElastic"] = function (t) {
                var s;
                var a = 1;
                if (t === 0)
                    return 0;
                if ((t /= 1) === 1)
                    return 1;
                var p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                }
                else
                    s = p / (2 * Math.PI) * Math.asin(1 / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
            };
            Statics.easingEffects["easeInOutElastic"] = function (t) {
                var s;
                var a = 1;
                if (t === 0)
                    return 0;
                if ((t /= 1 / 2) === 2)
                    return 1;
                var p = 1 * (0.3 * 1.5);
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                }
                else
                    s = p / (2 * Math.PI) * Math.asin(1 / a);
                if (t < 1)
                    return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
            };
            Statics.easingEffects["easeInBack"] = function (t) {
                var s = 1.70158;
                return 1 * (t /= 1) * t * ((s + 1) * t - s);
            };
            Statics.easingEffects["easeOutBack"] = function (t) {
                var s = 1.70158;
                return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
            };
            Statics.easingEffects["easeInOutBack"] = function (t) {
                var s = 1.70158;
                if ((t /= 1 / 2) < 1)
                    return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
                return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
            };
            Statics.easingEffects["easeInBounce"] = function (t) {
                return 1 - Statics.easingEffects["easeOutBounce"](1 - t);
            };
            Statics.easingEffects["easeOutBounce"] = function (t) {
                if ((t /= 1) < (1 / 2.75)) {
                    return 1 * (7.5625 * t * t);
                }
                else if (t < (2 / 2.75)) {
                    return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
                }
                else if (t < (2.5 / 2.75)) {
                    return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
                }
                else {
                    return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
                }
            };
            Statics.easingEffects["easeInOutBounce"] = function (t) {
                if (t < 1 / 2)
                    return Statics.easingEffects["easeInBounce"](t * 2) * 0.5;
                return Statics.easingEffects["easeOutBounce"](t * 2 - 1) * 0.5 + 1 * 0.5;
            };
            return 0;
        })();
        return Statics;
    })();
    ChartJs.Statics = Statics;
    function requestAnimFrame(callback) {
        return (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || (function (cb) { return window.setTimeout(cb, 1000 / 60); });
        })()(callback);
    }
    ChartJs.requestAnimFrame = requestAnimFrame;
    function cancelAnimFrame(handle) {
        (function () {
            return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;
        })()(handle);
    }
    ChartJs.cancelAnimFrame = cancelAnimFrame;
    function animationLoop(callback, totalSteps, easingString, onProgress, onComplete, chartInstance) {
        var currentStep = 0, easingFunction = Statics.easingEffects[easingString] || Statics.easingEffects["linear"];
        var animationFrame = function () {
            currentStep++;
            var stepDecimal = currentStep / totalSteps;
            var easeDecimal = easingFunction(stepDecimal);
            callback.call(chartInstance, easeDecimal, stepDecimal, currentStep);
            onProgress.call(chartInstance, easeDecimal, stepDecimal);
            if (currentStep < totalSteps) {
                chartInstance.animationFrame = requestAnimFrame(animationFrame);
            }
            else {
                onComplete.apply(chartInstance);
            }
        };
        chartInstance.animationFrame = requestAnimFrame(animationFrame);
    }
    ChartJs.animationLoop = animationLoop;
    function getRelativePosition(evt) {
        var mouseX, mouseY;
        var e = evt.originalEvent || evt;
        var canvas = (evt.currentTarget || evt.srcElement);
        var boundingRect = canvas.getBoundingClientRect();
        if (e.touches) {
            mouseX = e.touches[0].clientX - boundingRect.left;
            mouseY = e.touches[0].clientY - boundingRect.top;
        }
        else {
            mouseX = e.clientX - boundingRect.left;
            mouseY = e.clientY - boundingRect.top;
        }
        return {
            x: mouseX,
            y: mouseY
        };
    }
    ChartJs.getRelativePosition = getRelativePosition;
    function addEvent(node, eventType, handler) {
        if (node.addEventListener) {
            node.addEventListener(eventType, handler, false);
        }
        else if (node.attachEvent) {
            node.attachEvent("on" + eventType, handler);
        }
        else {
            node["on" + eventType] = handler;
        }
    }
    ChartJs.addEvent = addEvent;
    function removeEvent(node, eventType, handler) {
        if (node.removeEventListener) {
            node.removeEventListener(eventType, handler, false);
        }
        else if (node.detachEvent) {
            node.detachEvent(eventType, handler);
        }
        else {
            node["on" + eventType] = function () {
            };
        }
    }
    ChartJs.removeEvent = removeEvent;
    function bindEvents(chartInstance, events, handler) {
        if (!chartInstance.events)
            chartInstance.events = {};
        each(events, function (eventName) {
            chartInstance.events[eventName] = function () {
                handler.apply(chartInstance, arguments);
            };
            addEvent(chartInstance.canvas, eventName, chartInstance.events[eventName]);
        });
    }
    ChartJs.bindEvents = bindEvents;
    function unbindEvents(chartInstance, events) {
        each(events, function (handler, eventName) {
            removeEvent(chartInstance.canvas, eventName, handler);
        });
    }
    ChartJs.unbindEvents = unbindEvents;
    function getMaximumWidth(node) {
        var container = node.parentElement;
        return container.clientWidth;
    }
    ChartJs.getMaximumWidth = getMaximumWidth;
    function getMaximumHeight(node) {
        var container = node.parentElement;
        return container.clientHeight;
    }
    ChartJs.getMaximumHeight = getMaximumHeight;
    function retinaScale(chart) {
        var ctx = chart.ctx, width = chart.canvas.width, height = chart.canvas.height;
        if (window.devicePixelRatio) {
            ctx.canvas.style.width = width + "px";
            ctx.canvas.style.height = height + "px";
            ctx.canvas.height = height * window.devicePixelRatio;
            ctx.canvas.width = width * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    }
    ChartJs.retinaScale = retinaScale;
    function clear(chart) {
        chart.ctx.clearRect(0, 0, chart.width, chart.height);
    }
    ChartJs.clear = clear;
    function fontString(pixelSize, fontStyle, fontFamily) {
        return fontStyle + " " + pixelSize + "px " + fontFamily;
    }
    ChartJs.fontString = fontString;
    function longestText(ctx, font, strings) {
        ctx.font = font;
        var longest = 0;
        each(strings, function (s) {
            var textWidth = ctx.measureText(s).width;
            longest = (textWidth > longest) ? textWidth : longest;
        });
        return longest;
    }
    ChartJs.longestText = longestText;
    function drawRoundedRectangle(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    ChartJs.drawRoundedRectangle = drawRoundedRectangle;
    var Element = (function () {
        function Element(ctx, options) {
            this.ctx = ctx;
            this.label = options.label;
            this.strokeColor = options.strokeColor;
            this.fillColor = options.fillColor;
            this.initialize.apply(this, arguments);
            this.save();
        }
        Element.prototype.initialize = function () {
        };
        Element.prototype.restore = function (props) {
            var _this = this;
            if (!props) {
                var dictionary = this._saved;
                for (var prop in dictionary) {
                    if (dictionary.hasOwnProperty(prop)) {
                        this[prop] = dictionary[prop];
                    }
                }
            }
            else {
                each(props, function (key) {
                    _this[key] = _this._saved[key];
                });
            }
            return this;
        };
        Element.prototype.save = function () {
            this._saved = cloneProperties(this);
            delete this._saved._saved;
            return this;
        };
        Element.prototype.update = function (newOptions) {
            for (var prop in newOptions) {
                if (newOptions.hasOwnProperty(prop)) {
                    this._saved[prop] = this[prop];
                    this[prop] = newOptions[prop];
                }
            }
            return this;
        };
        Element.prototype.transition = function (props, ease) {
            var _this = this;
            each(props, function (value, key) {
                _this[key] = ((value - _this._saved[key]) * ease) + _this._saved[key];
            });
            return this;
        };
        Element.prototype.hasValue = function () {
            if (this.value)
                return true;
            return false;
        };
        Element.prototype.draw = function (easingDecimal) {
        };
        Element.prototype.inRange = function (chartX, chartY) {
            return false;
        };
        Element.prototype.clone = function () {
            return cloneProperties(this);
        };
        Element.prototype.tooltipPosition = function () {
            return {
                x: this.x,
                y: this.y
            };
        };
        return Element;
    })();
    ChartJs.Element = Element;
    var ChartPoint = (function (_super) {
        __extends(ChartPoint, _super);
        function ChartPoint(ctx, options) {
            _super.call(this, ctx, options);
            return;
        }
        ChartPoint.prototype.inRange = function (chartX, chartY) {
            var hitDetectionRange = this.hitDetectionRadius + this.radius;
            return ((Math.pow(chartX - this.x, 2) + Math.pow(chartY - this.y, 2)) < Math.pow(hitDetectionRange, 2));
        };
        ChartPoint.prototype.draw = function () {
            if (this.display) {
                var ctx = this.ctx;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.strokeStyle = this.strokeColor;
                ctx.lineWidth = this.strokeWidth;
                ctx.fillStyle = this.fillColor;
                ctx.fill();
                ctx.stroke();
            }
        };
        return ChartPoint;
    })(Element);
    ChartJs.ChartPoint = ChartPoint;
    var Arc = (function (_super) {
        __extends(Arc, _super);
        function Arc(ctx, options) {
            _super.call(this, ctx, options);
        }
        Arc.prototype.inRange = function (chartX, chartY) {
            var pointRelativePosition = getAngleFromPoint(this, {
                x: chartX,
                y: chartY
            });
            var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle), withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);
            return (betweenAngles && withinRadius);
        };
        Arc.prototype.tooltipPosition = function () {
            var centerAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2), rangeFromCenter = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
            return {
                x: this.x + (Math.cos(centerAngle) * rangeFromCenter),
                y: this.y + (Math.sin(centerAngle) * rangeFromCenter)
            };
        };
        Arc.prototype.draw = function (animationPercent) {
            var easingDevimal = animationPercent || 1;
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);
            ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);
            ctx.closePath();
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.fillStyle = this.fillColor;
            ctx.fill();
            ctx.lineJoin = "bevel";
            if (this.showStroke) {
                ctx.stroke();
            }
        };
        return Arc;
    })(Element);
    ChartJs.Arc = Arc;
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle() {
            _super.apply(this, arguments);
        }
        Rectangle.prototype.draw = function () {
            var ctx = this.ctx, halfWidth = this.width / 2, leftX = this.x - halfWidth, rightX = this.x + halfWidth, top = this.y, halfStroke = this.strokeWidth / 2;
            // Canvas doesn't allow us to stroke inside the width so we can
            // adjust the sizes to fit if we're setting a stroke on the line
            if (this.showStroke) {
                leftX += halfStroke;
                rightX -= halfStroke;
                top += halfStroke;
            }
            ctx.beginPath();
            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            // It'd be nice to keep this class totally generic to any rectangle
            // and simply specify which border to miss out.
            ctx.moveTo(leftX, this.base);
            ctx.lineTo(leftX, top);
            ctx.lineTo(rightX, top);
            ctx.lineTo(rightX, this.base);
            ctx.fill();
            if (this.showStroke) {
                ctx.stroke();
            }
        };
        Rectangle.prototype.height = function () {
            return this.base - this.y;
        };
        Rectangle.prototype.inRange = function (chartX, chartY) {
            return (chartX >= this.x - this.width / 2 && chartX <= this.x + this.width / 2) && (chartY >= this.y && chartY <= this.base);
        };
        return Rectangle;
    })(Element);
    ChartJs.Rectangle = Rectangle;
    var TextElement = (function (_super) {
        __extends(TextElement, _super);
        function TextElement(ctx, options) {
            _super.call(this, ctx, options);
            return;
        }
        return TextElement;
    })(Element);
    ChartJs.TextElement = TextElement;
    var Tooltip = (function (_super) {
        __extends(Tooltip, _super);
        function Tooltip(ctx, options) {
            _super.call(this, ctx, options);
            return;
        }
        Tooltip.prototype.initialize = function () {
            this.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);
        };
        Tooltip.prototype.draw = function () {
            var ctx = this.ctx;
            ctx.font = this.font;
            this.xAlign = "center";
            this.yAlign = "above";
            //Distance between the actual element.y position and the start of the tooltip caret
            var caretPadding = this.caretPadding = 2;
            var tooltipWidth = ctx.measureText(this.text).width + 2 * this.xPadding, tooltipRectHeight = this.fontSize + 2 * this.yPadding, tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;
            if (this.x + tooltipWidth / 2 > this.chart.width) {
                this.xAlign = "left";
            }
            else if (this.x - tooltipWidth / 2 < 0) {
                this.xAlign = "right";
            }
            if (this.y - tooltipHeight < 0) {
                this.yAlign = "below";
            }
            var tooltipX = this.x - tooltipWidth / 2, tooltipY = this.y - tooltipHeight;
            ctx.fillStyle = this.fillColor;
            // Custom Tooltips
            if (this.custom) {
                this.custom(this);
            }
            else {
                switch (this.yAlign) {
                    case "above":
                        //Draw a caret above the x/y
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y - caretPadding);
                        ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
                        ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case "below":
                        tooltipY = this.y + caretPadding + this.caretHeight;
                        //Draw a caret below the x/y
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y + caretPadding);
                        ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
                        ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
                        ctx.closePath();
                        ctx.fill();
                        break;
                }
                switch (this.xAlign) {
                    case "left":
                        tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
                        break;
                    case "right":
                        tooltipX = this.x - (this.cornerRadius + this.caretHeight);
                        break;
                }
                drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipRectHeight, this.cornerRadius);
                ctx.fill();
                ctx.fillStyle = this.textColor;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.text, tooltipX + tooltipWidth / 2, tooltipY + tooltipRectHeight / 2);
            }
        };
        return Tooltip;
    })(TextElement);
    ChartJs.Tooltip = Tooltip;
    var MultiToolTip = (function (_super) {
        __extends(MultiToolTip, _super);
        function MultiToolTip(ctx, options) {
            _super.call(this, ctx, options);
            return;
        }
        MultiToolTip.prototype.initialize = function () {
            this.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);
            this.titleFont = fontString(this.titleFontSize, this.titleFontStyle, this.titleFontFamily);
            this.height = (this.labels.length * this.fontSize) + ((this.labels.length - 1) * (this.fontSize / 2)) + (this.yPadding * 2) + this.titleFontSize * 1.5;
            this.ctx.font = this.titleFont;
            var titleWidth = this.ctx.measureText(this.title).width, 
            //Label has a legend square as well so account for this.
            labelWidth = longestText(this.ctx, this.font, this.labels) + this.fontSize + 3, longestTextWidth = max([labelWidth, titleWidth]);
            this.width = longestTextWidth + (this.xPadding * 2);
            var halfHeight = this.height / 2;
            //Check to ensure the height will fit on the canvas
            //The three is to buffer form the very
            if (this.y - halfHeight < 0) {
                this.y = halfHeight;
            }
            else if (this.y + halfHeight > this.chart.height) {
                this.y = this.chart.height - halfHeight;
            }
            //Decide whether to align left or right based on position on canvas
            if (this.x > this.chart.width / 2) {
                this.x -= this.xOffset + this.width;
            }
            else {
                this.x += this.xOffset;
            }
        };
        MultiToolTip.prototype.getLineHeight = function (index) {
            var baseLineHeight = this.y - (this.height / 2) + this.yPadding, afterTitleIndex = index - 1;
            if (index === 0) {
                return baseLineHeight + this.titleFontSize / 2;
            }
            else {
                return baseLineHeight + ((this.fontSize * 1.5 * afterTitleIndex) + this.fontSize / 2) + this.titleFontSize * 1.5;
            }
        };
        MultiToolTip.prototype.draw = function () {
            var _this = this;
            if (this.custom) {
                this.custom(this);
            }
            else {
                var ctx = this.ctx;
                drawRoundedRectangle(ctx, this.x, this.y - this.height / 2, this.width, this.height, this.cornerRadius);
                ctx.fillStyle = this.fillColor;
                ctx.fill();
                ctx.closePath();
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillStyle = this.titleTextColor;
                ctx.font = this.titleFont;
                ctx.fillText(this.title, this.x + this.xPadding, this.getLineHeight(0));
                ctx.font = this.font;
                each(this.labels, function (label, index) {
                    ctx.fillStyle = _this.textColor;
                    ctx.fillText(label, _this.x + _this.xPadding + _this.fontSize + 3, _this.getLineHeight(index + 1));
                    //A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
                    //ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
                    //Instead we'll make a white filled block to put the legendColour palette over.
                    ctx.fillStyle = _this.legendColorBackground;
                    ctx.fillRect(_this.x + _this.xPadding, _this.getLineHeight(index + 1) - _this.fontSize / 2, _this.fontSize, _this.fontSize);
                    ctx.fillStyle = _this.legendColors[index].fill;
                    ctx.fillRect(_this.x + _this.xPadding, _this.getLineHeight(index + 1) - _this.fontSize / 2, _this.fontSize, _this.fontSize);
                });
            }
        };
        return MultiToolTip;
    })(TextElement);
    ChartJs.MultiToolTip = MultiToolTip;
    var Scale = (function (_super) {
        __extends(Scale, _super);
        function Scale(ctx, options) {
            this.templateString = options.templateString;
            this.height = options.height;
            this.width = options.width;
            this.textColor = options.textColor;
            this.fontSize = options.fontSize;
            this.fontStyle = options.fontStyle;
            this.fontFamily = options.fontFamily;
            this.xLabels = options.xLabels;
            this.font = options.font;
            this.lineWidth = options.lineWidth;
            this.lineColor = options.lineColor;
            this.showHorizontalLines = options.showHorizontalLines;
            this.showVerticalLines = options.showVerticalLines;
            this.gridLineWidth = options.gridLineWidth;
            this.gridLineColor = options.gridLineColor;
            this.padding = options.padding;
            this.showLabels = options.showLabels;
            this.display = options.display;
            this.valuesCount = options.valuesCount;
            _super.call(this, ctx, options);
        }
        Scale.prototype.initialize = function () {
            this.fit();
        };
        Scale.prototype.buildYLabels = function () {
            this.yLabels = [];
            var stepDecimalPlaces = getDecimalPlaces(this.stepValue);
            for (var i = 0; i <= this.steps; i++) {
                this.yLabels.push(template(this.templateString, { value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces) }));
            }
            this.yLabelWidth = (this.display && this.showLabels) ? longestText(this.ctx, this.font, this.yLabels) : 0;
        };
        Scale.prototype.addXLabel = function (label) {
            this.xLabels.push(label);
            this.valuesCount++;
            this.fit();
        };
        Scale.prototype.removeXLabel = function () {
            this.xLabels.shift();
            this.valuesCount--;
            this.fit();
        };
        Scale.prototype.fit = function () {
            // First we need the width of the yLabels, assuming the xLabels aren't rotated
            // To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
            this.startPoint = (this.display) ? this.fontSize : 0;
            this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels
            // Apply padding settings to the start and end point.
            this.startPoint += this.padding;
            this.endPoint -= this.padding;
            // Cache the starting height, so can determine if we need to recalculate the scale yAxis
            var cachedHeight = this.endPoint - this.startPoint, cachedYLabelWidth;
            // Build the current yLabels so we have an idea of what size they'll be to start
            /*
             *	This sets what is returned from calculateScaleRange as static properties of this class:
             *
                this.steps;
                this.stepValue;
                this.min;
                this.max;
             *
             */
            this.calculateYRange(cachedHeight);
            // With these properties set we can now build the array of yLabels
            // and also the width of the largest yLabel
            this.buildYLabels();
            this.calculateXLabelRotation();
            while ((cachedHeight > this.endPoint - this.startPoint)) {
                cachedHeight = this.endPoint - this.startPoint;
                cachedYLabelWidth = this.yLabelWidth;
                this.calculateYRange(cachedHeight);
                this.buildYLabels();
                // Only go through the xLabel loop again if the yLabel width has changed
                if (cachedYLabelWidth < this.yLabelWidth) {
                    this.calculateXLabelRotation();
                }
            }
        };
        Scale.prototype.calculateXLabelRotation = function () {
            //Get the width of each grid by calculating the difference
            //between x offsets between 0 and 1.
            this.ctx.font = this.font;
            var firstWidth = this.ctx.measureText(this.xLabels[0]).width, lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width, firstRotated, lastRotated;
            this.xScalePaddingRight = lastWidth / 2 + 3;
            this.xScalePaddingLeft = (firstWidth / 2 > this.yLabelWidth + 10) ? firstWidth / 2 : this.yLabelWidth + 10;
            this.xLabelRotation = 0;
            if (this.display) {
                var originalLabelWidth = longestText(this.ctx, this.font, this.xLabels), cosRotation, firstRotatedWidth;
                this.xLabelWidth = originalLabelWidth;
                //Allow 3 pixels x2 padding either side for label readability
                var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;
                while ((this.xLabelWidth > xGridWidth && this.xLabelRotation === 0) || (this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0)) {
                    cosRotation = Math.cos(toRadians(this.xLabelRotation));
                    firstRotated = cosRotation * firstWidth;
                    lastRotated = cosRotation * lastWidth;
                    // We're right aligning the text now.
                    if (firstRotated + this.fontSize / 2 > this.yLabelWidth + 8) {
                        this.xScalePaddingLeft = firstRotated + this.fontSize / 2;
                    }
                    this.xScalePaddingRight = this.fontSize / 2;
                    this.xLabelRotation++;
                    this.xLabelWidth = cosRotation * originalLabelWidth;
                }
                if (this.xLabelRotation > 0) {
                    this.endPoint -= Math.sin(toRadians(this.xLabelRotation)) * originalLabelWidth + 3;
                }
            }
            else {
                this.xLabelWidth = 0;
                this.xScalePaddingRight = this.padding;
                this.xScalePaddingLeft = this.padding;
            }
        };
        Scale.prototype.calculateYRange = function (cachedHeight) {
            throw new Error("calculateYRange must be implemented in a derived class.");
        };
        Scale.prototype.drawingArea = function () {
            return this.startPoint - this.endPoint;
        };
        Scale.prototype.calculateY = function (value) {
            var scalingFactor = this.drawingArea() / (this.min - this.max);
            return this.endPoint - (scalingFactor * (value - this.min));
        };
        Scale.prototype.calculateX = function (index) {
            var isRotated = (this.xLabelRotation > 0), 
            // innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
            innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight), valueWidth = innerWidth / (this.valuesCount - ((this.offsetGridLines) ? 0 : 1)), valueOffset = (valueWidth * index) + this.xScalePaddingLeft;
            if (this.offsetGridLines) {
                valueOffset += (valueWidth / 2);
            }
            return Math.round(valueOffset);
        };
        Scale.prototype.update = function (newOptions) {
            _super.prototype.update.call(this, newOptions);
            this.fit();
            return this;
        };
        Scale.prototype.draw = function (easingDecimal) {
            var _this = this;
            var ctx = this.ctx, yLabelGap = (this.endPoint - this.startPoint) / this.steps, xStart = Math.round(this.xScalePaddingLeft);
            if (this.display) {
                ctx.fillStyle = this.textColor;
                ctx.font = this.font;
                each(this.yLabels, function (labelString, index) {
                    var yLabelCenter = _this.endPoint - (yLabelGap * index), linePositionY = Math.round(yLabelCenter), drawHorizontalLine = _this.showHorizontalLines;
                    ctx.textAlign = "right";
                    ctx.textBaseline = "middle";
                    if (_this.showLabels) {
                        ctx.fillText(labelString, xStart - 10, yLabelCenter);
                    }
                    // This is X axis, so draw it
                    if (index === 0 && !drawHorizontalLine) {
                        drawHorizontalLine = true;
                    }
                    if (drawHorizontalLine) {
                        ctx.beginPath();
                    }
                    if (index > 0) {
                        // This is a grid line in the centre, so drop that
                        ctx.lineWidth = _this.gridLineWidth;
                        ctx.strokeStyle = _this.gridLineColor;
                    }
                    else {
                        // This is the first line on the scale
                        ctx.lineWidth = _this.lineWidth;
                        ctx.strokeStyle = _this.lineColor;
                    }
                    linePositionY += aliasPixel(ctx.lineWidth);
                    if (drawHorizontalLine) {
                        ctx.moveTo(xStart, linePositionY);
                        ctx.lineTo(_this.width, linePositionY);
                        ctx.stroke();
                        ctx.closePath();
                    }
                    ctx.lineWidth = _this.lineWidth;
                    ctx.strokeStyle = _this.lineColor;
                    ctx.beginPath();
                    ctx.moveTo(xStart - 5, linePositionY);
                    ctx.lineTo(xStart, linePositionY);
                    ctx.stroke();
                    ctx.closePath();
                });
                each(this.xLabels, function (label, index) {
                    var xPos = _this.calculateX(index) + aliasPixel(_this.lineWidth), 
                    // Check to see if line/bar here and decide where to place the line
                    linePos = _this.calculateX(index - (_this.offsetGridLines ? 0.5 : 0)) + aliasPixel(_this.lineWidth), isRotated = (_this.xLabelRotation > 0), drawVerticalLine = _this.showVerticalLines;
                    // This is Y axis, so draw it
                    if (index === 0 && !drawVerticalLine) {
                        drawVerticalLine = true;
                    }
                    if (drawVerticalLine) {
                        ctx.beginPath();
                    }
                    if (index > 0) {
                        // This is a grid line in the centre, so drop that
                        ctx.lineWidth = _this.gridLineWidth;
                        ctx.strokeStyle = _this.gridLineColor;
                    }
                    else {
                        // This is the first line on the scale
                        ctx.lineWidth = _this.lineWidth;
                        ctx.strokeStyle = _this.lineColor;
                    }
                    if (drawVerticalLine) {
                        ctx.moveTo(linePos, _this.endPoint);
                        ctx.lineTo(linePos, _this.startPoint - 3);
                        ctx.stroke();
                        ctx.closePath();
                    }
                    ctx.lineWidth = _this.lineWidth;
                    ctx.strokeStyle = _this.lineColor;
                    // Small lines at the bottom of the base grid line
                    ctx.beginPath();
                    ctx.moveTo(linePos, _this.endPoint);
                    ctx.lineTo(linePos, _this.endPoint + 5);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.save();
                    ctx.translate(xPos, (isRotated) ? _this.endPoint + 12 : _this.endPoint + 8);
                    ctx.rotate(toRadians(_this.xLabelRotation) * -1);
                    ctx.font = _this.font;
                    ctx.textAlign = (isRotated) ? "right" : "center";
                    ctx.textBaseline = (isRotated) ? "middle" : "top";
                    ctx.fillText(label, 0, 0);
                    ctx.restore();
                });
            }
        };
        return Scale;
    })(Element);
    ChartJs.Scale = Scale;
    var RadialScale = (function (_super) {
        __extends(RadialScale, _super);
        function RadialScale(ctx, options) {
            _super.call(this, ctx, options);
        }
        RadialScale.prototype.initialize = function () {
            this.size = min([this.height, this.width]);
            this.drawingArea = (this.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
        };
        RadialScale.prototype.calculateCenterOffset = function (value) {
            var scalingFactor = this.drawingArea / (this.max - this.min);
            return (value - this.min) * scalingFactor;
        };
        RadialScale.prototype.update = function (newOptions) {
            _super.prototype.update.call(this, newOptions);
            if (!this.lineArc) {
                this.setScaleSize();
            }
            else {
                this.drawingArea = (this.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
            }
            this.buildYLabels();
            return this;
        };
        RadialScale.prototype.buildYLabels = function () {
            this.yLabels = [];
            var stepDecimalPlaces = getDecimalPlaces(this.stepValue);
            for (var i = 0; i <= this.steps; i++) {
                this.yLabels.push(template(this.templateString, { value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces) }));
            }
        };
        RadialScale.prototype.getCircumference = function () {
            return ((Math.PI * 2) / this.valuesCount);
        };
        RadialScale.prototype.setScaleSize = function () {
            /*
             * Right, this is really confusing and there is a lot of maths going on here
             * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
             *
             * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
             *
             * Solution:
             *
             * We assume the radius of the polygon is half the size of the canvas at first
             * at each index we check if the text overlaps.
             *
             * Where it does, we store that angle and that index.
             *
             * After finding the largest index and angle we calculate how much we need to remove
             * from the shape radius to move the point inwards by that x.
             *
             * We average the left and right distances to get the maximum shape radius that can fit in the box
             * along with labels.
             *
             * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
             * on each side, removing that from the size, halving it and adding the left x protrusion width.
             *
             * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
             * and position it in the most space efficient manner
             *
             * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
             */
            // Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
            // Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
            var largestPossibleRadius = min([(this.height / 2 - this.pointLabelFontSize - 5), this.width / 2]), pointPosition, i, textWidth, halfTextWidth, furthestRight = this.width, furthestRightIndex, furthestRightAngle, furthestLeft = 0, furthestLeftIndex, furthestLeftAngle, xProtrusionLeft, xProtrusionRight, radiusReductionRight, radiusReductionLeft, maxWidthRadius;
            this.ctx.font = fontString(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily);
            for (i = 0; i < this.valuesCount; i++) {
                // 5px to space the text slightly out - similar to what we do in the draw function.
                pointPosition = this.getPointPosition(i, largestPossibleRadius);
                textWidth = this.ctx.measureText(template(this.templateString, { value: this.labels[i] })).width + 5;
                if (i === 0 || i === this.valuesCount / 2) {
                    // If we're at index zero, or exactly the middle, we're at exactly the top/bottom
                    // of the radar chart, so text will be aligned centrally, so we'll half it and compare
                    // w/left and right text sizes
                    halfTextWidth = textWidth / 2;
                    if (pointPosition.x + halfTextWidth > furthestRight) {
                        furthestRight = pointPosition.x + halfTextWidth;
                        furthestRightIndex = i;
                    }
                    if (pointPosition.x - halfTextWidth < furthestLeft) {
                        furthestLeft = pointPosition.x - halfTextWidth;
                        furthestLeftIndex = i;
                    }
                }
                else if (i < this.valuesCount / 2) {
                    // Less than half the values means we'll left align the text
                    if (pointPosition.x + textWidth > furthestRight) {
                        furthestRight = pointPosition.x + textWidth;
                        furthestRightIndex = i;
                    }
                }
                else if (i > this.valuesCount / 2) {
                    // More than half the values means we'll right align the text
                    if (pointPosition.x - textWidth < furthestLeft) {
                        furthestLeft = pointPosition.x - textWidth;
                        furthestLeftIndex = i;
                    }
                }
            }
            xProtrusionLeft = furthestLeft;
            xProtrusionRight = Math.ceil(furthestRight - this.width);
            furthestRightAngle = this.getIndexAngle(furthestRightIndex);
            furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);
            radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI / 2);
            radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI / 2);
            // Ensure we actually need to reduce the size of the chart
            radiusReductionRight = (isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
            radiusReductionLeft = (isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;
            this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2;
            //this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
            this.setCenterPoint(radiusReductionLeft, radiusReductionRight);
        };
        RadialScale.prototype.setCenterPoint = function (leftMovement, rightMovement) {
            var maxRight = this.width - rightMovement - this.drawingArea, maxLeft = leftMovement + this.drawingArea;
            this.xCenter = (maxLeft + maxRight) / 2;
            this.yCenter = (this.height / 2);
        };
        RadialScale.prototype.getIndexAngle = function (index) {
            var angleMultiplier = (Math.PI * 2) / this.valuesCount;
            return index * angleMultiplier - (Math.PI / 2);
        };
        RadialScale.prototype.getPointPosition = function (index, distanceFromCenter) {
            var thisAngle = this.getIndexAngle(index);
            return {
                x: (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
                y: (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
            };
        };
        RadialScale.prototype.draw = function () {
            var _this = this;
            if (this.display) {
                var ctx = this.ctx;
                each(this.yLabels, function (label, index) {
                    // Don't draw a center value
                    if (index > 0) {
                        var yCenterOffset = index * (_this.drawingArea / _this.steps), yHeight = _this.yCenter - yCenterOffset, pointPosition;
                        // Draw circular lines around the scale
                        if (_this.lineWidth > 0) {
                            ctx.strokeStyle = _this.lineColor;
                            ctx.lineWidth = _this.lineWidth;
                            if (_this.lineArc) {
                                ctx.beginPath();
                                ctx.arc(_this.xCenter, _this.yCenter, yCenterOffset, 0, Math.PI * 2);
                                ctx.closePath();
                                ctx.stroke();
                            }
                            else {
                                ctx.beginPath();
                                for (var i = 0; i < _this.valuesCount; i++) {
                                    pointPosition = _this.getPointPosition(i, _this.calculateCenterOffset(_this.min + (index * _this.stepValue)));
                                    if (i === 0) {
                                        ctx.moveTo(pointPosition.x, pointPosition.y);
                                    }
                                    else {
                                        ctx.lineTo(pointPosition.x, pointPosition.y);
                                    }
                                }
                                ctx.closePath();
                                ctx.stroke();
                            }
                        }
                        if (_this.showLabels) {
                            ctx.font = fontString(_this.fontSize, _this.fontStyle, _this.fontFamily);
                            if (_this.showLabelBackdrop) {
                                var labelWidth = ctx.measureText(label).width;
                                ctx.fillStyle = _this.backdropColor;
                                ctx.fillRect(_this.xCenter - labelWidth / 2 - _this.backdropPaddingX, yHeight - _this.fontSize / 2 - _this.backdropPaddingY, labelWidth + _this.backdropPaddingX * 2, _this.fontSize + _this.backdropPaddingY * 2);
                            }
                            ctx.textAlign = 'center';
                            ctx.textBaseline = "middle";
                            ctx.fillStyle = _this.fontColor;
                            ctx.fillText(label, _this.xCenter, yHeight);
                        }
                    }
                });
                if (!this.lineArc) {
                    ctx.lineWidth = this.angleLineWidth;
                    ctx.strokeStyle = this.angleLineColor;
                    for (var i = this.valuesCount - 1; i >= 0; i--) {
                        if (this.angleLineWidth > 0) {
                            var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
                            ctx.beginPath();
                            ctx.moveTo(this.xCenter, this.yCenter);
                            ctx.lineTo(outerPosition.x, outerPosition.y);
                            ctx.stroke();
                            ctx.closePath();
                        }
                        // Extra 3px out for some label spacing
                        var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
                        ctx.font = fontString(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily);
                        ctx.fillStyle = this.pointLabelFontColor;
                        var labelsCount = this.labels.length, halfLabelsCount = this.labels.length / 2, quarterLabelsCount = halfLabelsCount / 2, upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount), exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
                        if (i === 0) {
                            ctx.textAlign = 'center';
                        }
                        else if (i === halfLabelsCount) {
                            ctx.textAlign = 'center';
                        }
                        else if (i < halfLabelsCount) {
                            ctx.textAlign = 'left';
                        }
                        else {
                            ctx.textAlign = 'right';
                        }
                        // Set the correct text baseline based on outer positioning
                        if (exactQuarter) {
                            ctx.textBaseline = 'middle';
                        }
                        else if (upperHalf) {
                            ctx.textBaseline = 'bottom';
                        }
                        else {
                            ctx.textBaseline = 'top';
                        }
                        ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
                    }
                }
            }
        };
        return RadialScale;
    })(Element);
    ChartJs.RadialScale = RadialScale;
    var Dataset = (function () {
        function Dataset() {
        }
        return Dataset;
    })();
    ChartJs.Dataset = Dataset;
    var ChartBase = (function () {
        function ChartBase(context, data) {
            this.canvas = context.canvas;
            this.ctx = context;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.aspectRatio = this.width / this.height;
            this.id = uid();
            this.data = data;
            Chart.instances[this.id] = this;
            if (this.getChartOptions().responsive) {
                this.resize();
            }
            this.initialize(data);
            retinaScale(this);
        }
        ChartBase.prototype.initialize = function (data) {
            return this;
        };
        ChartBase.prototype.clear = function () {
            clear(this);
            return this;
        };
        ChartBase.prototype.stop = function () {
            cancelAnimFrame(this.animationFrame);
            return this;
        };
        ChartBase.prototype.resize = function (callback) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.stop();
            var canvas = this.canvas, newWidth = getMaximumWidth(canvas), newHeight = this.getChartOptions().maintainAspectRatio ? newWidth / this.aspectRatio : getMaximumHeight(canvas);
            canvas.width = this.width = newWidth;
            canvas.height = this.height = newHeight;
            retinaScale(this);
            callback.apply(this, args);
            return this;
        };
        ChartBase.prototype.reflow = function () {
        };
        ChartBase.prototype.render = function (reflow) {
            if (reflow) {
                this.reflow();
            }
            var options = this.getChartOptions();
            if (options.animation && !reflow) {
                animationLoop(this.draw, options.animationSteps, options.animationEasing, options.onAnimationProgress, options.onAnimationComplete, this);
            }
            else {
                this.draw(1);
                options.onAnimationComplete.call(this);
            }
            return this;
        };
        ChartBase.prototype.generateLegend = function () {
            return template(this.getChartOptions().legendTemplate, this);
        };
        ChartBase.prototype.destroy = function () {
            this.clear();
            unbindEvents(this, this.events);
            var canvas = this.canvas;
            canvas.width = this.width;
            canvas.height = this.height;
            if (canvas.style.removeProperty) {
                canvas.style.removeProperty('width');
                canvas.style.removeProperty('height');
            }
            else {
                canvas.style.removeAttribute('width');
                canvas.style.removeAttribute('height');
            }
            delete Chart.instances[this.id];
        };
        ChartBase.prototype.showTooltip = function (chartElements, forceRedraw) {
            var _this = this;
            if (!this.activeElements)
                this.activeElements = [];
            var isChanged = (function (elements) {
                var changed = false;
                if (elements.length !== _this.activeElements.length) {
                    return true;
                }
                each(elements, function (element, index) {
                    if (element !== _this.activeElements[index]) {
                        changed = true;
                    }
                });
                return changed;
            })(chartElements);
            if (!isChanged && !forceRedraw) {
                return;
            }
            else {
                this.activeElements = chartElements;
            }
            this.draw(1);
            var options = this.getChartOptions();
            if (chartElements.length > 0) {
                if (this.datasets && this.datasets.length) {
                    var dataArray, dataIndex = 0;
                    for (var i = this.datasets.length - 1; i >= 0; i--) {
                        dataArray = this.datasets[i].elements;
                        dataIndex = dataArray.indexOf(chartElements[0]);
                        if (dataIndex !== -1) {
                            break;
                        }
                    }
                    var tooltipLabels = [], tooltipColors = [], medianPosition = (function (index) {
                        var elements = [], dataCollection, xPositions = [], yPositions = [];
                        each(_this.datasets, function (dataset) {
                            dataCollection = dataset.elements;
                            if (dataCollection[index] && dataCollection[index].hasValue()) {
                                elements.push(dataCollection[index]);
                            }
                        });
                        each(elements, function (element) {
                            xPositions.push(element.x);
                            yPositions.push(element.y);
                            tooltipLabels.push(template(options.multiTooltipTemplate, element));
                            tooltipColors.push({
                                fill: element.fillColor,
                                stroke: element.strokeColor
                            });
                        });
                        var yMin = min(yPositions);
                        var yMax = max(yPositions);
                        var xMin = min(xPositions);
                        var xMax = max(xPositions);
                        return {
                            x: (xMin > _this.width / 2) ? xMin : xMax,
                            y: (yMin + yMax) / 2
                        };
                    })(dataIndex);
                    new MultiToolTip(this.ctx, {
                        x: medianPosition.x,
                        y: medianPosition.y,
                        xPadding: options.tooltipXPadding,
                        yPadding: options.tooltipYPadding,
                        xOffset: options.tooltipXOffset,
                        fillColor: options.tooltipFillColor,
                        textColor: options.tooltipFontColor,
                        fontFamily: options.tooltipFontFamily,
                        fontStyle: options.tooltipFontStyle,
                        fontSize: options.tooltipFontSize,
                        titleTextColor: options.tooltipTitleFontColor,
                        titleFontFamily: options.tooltipTitleFontFamily,
                        titleFontStyle: options.tooltipTitleFontStyle,
                        titleFontSize: options.tooltipTitleFontSize,
                        cornerRadius: options.tooltipCornerRadius,
                        labels: tooltipLabels,
                        legendColors: tooltipColors,
                        legendColorBackground: options.multiTooltipKeyBackground,
                        title: chartElements[0].label,
                        chart: this
                    }).draw();
                }
                else {
                    each(chartElements, function (element) {
                        var tooltipPosition = element.tooltipPosition();
                        new Tooltip(_this.ctx, {
                            x: Math.round(tooltipPosition.x),
                            y: Math.round(tooltipPosition.y),
                            xPadding: options.tooltipXPadding,
                            yPadding: options.tooltipYPadding,
                            fillColor: options.tooltipFillColor,
                            textColor: options.tooltipFontColor,
                            fontFamily: options.tooltipFontFamily,
                            fontStyle: options.tooltipFontStyle,
                            fontSize: options.tooltipFontSize,
                            caretHeight: options.tooltipCaretSize,
                            cornerRadius: options.tooltipCornerRadius,
                            text: template(options.tooltipTemplate, Element),
                            chart: _this
                        }).draw();
                    });
                }
            }
            return this;
        };
        ChartBase.prototype.draw = function (ease) {
        };
        ChartBase.prototype.toBase64Image = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (type) {
                return this.canvas.toDataURL.call(this.canvas, [type].concat(args));
            }
            else {
                return this.canvas.toDataURL.call(this.canvas, args);
            }
        };
        ChartBase.prototype.getChartOptions = function () {
            throw new Error("Not Implemented");
        };
        ChartBase.instances = {};
        return ChartBase;
    })();
    ChartJs.ChartBase = ChartBase;
    var Chart = (function (_super) {
        __extends(Chart, _super);
        function Chart(context, data, options, defaults) {
            this.options = merge(options, merge(defaults, Chart.globalDefaults));
            _super.call(this, context, data);
        }
        Chart.prototype.getChartOptions = function () {
            return this.options;
        };
        return Chart;
    })(ChartBase);
    ChartJs.Chart = Chart;
    Chart.globalDefaults = {
        animation: true,
        animationSteps: 60,
        animationEasing: "easeOutQuart",
        showScale: true,
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleLineColor: "rgba(0,0,0,.1)",
        scaleLineWidth: 1,
        scaleShowLabels: true,
        scaleLabel: "<%=value%>",
        scaleIntegersOnly: true,
        scaleBeginAtZero: false,
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        responsive: false,
        maintainAspectRatio: true,
        showTooltips: true,
        customTooltips: false,
        tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],
        tooltipFillColor: "rgba(0,0,0,0.8)",
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipFontSize: 14,
        tooltipFontStyle: "normal",
        tooltipFontColor: "#fff",
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipTitleFontSize: 14,
        tooltipTitleFontStyle: "bold",
        tooltipTitleFontColor: "#fff",
        tooltipYPadding: 6,
        tooltipXPadding: 6,
        tooltipCaretSize: 8,
        tooltipCornerRadius: 6,
        tooltipXOffset: 10,
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
        multiTooltipTemplate: "<%= value %>",
        multiTooltipKeyBackground: '#fff',
        onAnimationProgress: function () {
        },
        onAnimationComplete: function () {
        },
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
    };
})(ChartJs || (ChartJs = {}));
//# sourceMappingURL=Chart.Core.js.map