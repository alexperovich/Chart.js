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
var ChartJs;
(function (ChartJs) {
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
    function clone(value) {
        return value.clone();
    }
    function each(collection, callback, self) {
        if (collection.length) {
            var i;
            for (i = 0; i < collection.length; i++) {
                callback.apply(self, [collection[i], i]);
            }
        }
        else {
            for (var item in collection) {
                callback.apply(self, [collection[item], item]);
            }
        }
    }
    function where(collection, predicate) {
        var filtered = [];
        each(collection, function (item) {
            if (predicate(item)) {
                filtered.push(item);
            }
        });
        return filtered;
    }
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
    var id = 0;
    function uid() {
        return "chart-" + id++;
    }
    function warn(str) {
        if (window.console && window.console.warn instanceof Function)
            window.console.warn(str);
    }
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function max(array) {
        return Math.max.apply(Math, array);
    }
    function min(array) {
        return Math.min.apply(Math, array);
    }
    function clamp(value, minValue, maxValue) {
        return max([min([value, maxValue]), minValue]);
    }
    function getDecimalPlaces(num) {
        if (num % 1 !== 0 && isNumber(num)) {
            return num.toString().split(".")[1].length;
        }
        else {
            return 0;
        }
    }
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
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
    function aliasPixel(pixelWidth) {
        return (pixelWidth % 2 === 0) ? 0 : 0.5;
    }
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
    function calculateOrderOfMagnitude(value) {
        return Math.floor(Math.log(value) / Math.LN10);
    }
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
    // Blows up jshint errors based on the new Function constructor
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
    function generateLabels(tmpl, numberOfSteps, graphMin, stepValue) {
        var labelsArray = new Array(numberOfSteps);
        if (tmpl) {
            each(labelsArray, function (val, index) {
                labelsArray[index] = template(tmpl, { value: (graphMin + (stepValue * (index + 1))) });
            });
        }
        return labelsArray;
    }
    var Statics = (function () {
        function Statics() {
        }
        Statics.__ctor = (function () {
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
                var s = 1.70158;
                var p = 0;
                var a = 1;
                if (t === 0)
                    return 0;
                if ((t /= 1) == 1)
                    return 1;
                if (!p)
                    p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                }
                else
                    s = p / (2 * Math.PI) * Math.asin(1 / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            };
            Statics.easingEffects["easeOutElastic"] = function (t) {
                var s = 1.70158;
                var p = 0;
                var a = 1;
                if (t === 0)
                    return 0;
                if ((t /= 1) == 1)
                    return 1;
                if (!p)
                    p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                }
                else
                    s = p / (2 * Math.PI) * Math.asin(1 / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
            };
            Statics.easingEffects["easeInOutElastic"] = function (t) {
                var s = 1.70158;
                var p = 0;
                var a = 1;
                if (t === 0)
                    return 0;
                if ((t /= 1 / 2) == 2)
                    return 1;
                if (!p)
                    p = 1 * (0.3 * 1.5);
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
        })();
        return Statics;
    })();
    function requestAnimFrame(callback) {
        return (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || (function (cb) { return window.setTimeout(cb, 1000 / 60); });
        })()(callback);
    }
    function cancelAnimFrame(handle) {
        (function () {
            return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;
        })()(handle);
    }
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
    function unbindEvents(chartInstance, events) {
        each(events, function (handler, eventName) {
            removeEvent(chartInstance.canvas, eventName, handler);
        });
    }
    function getMaximumWidth(node) {
        var container = node.parentElement;
        return container.clientWidth;
    }
    function getMaximumHeight(node) {
        var container = node.parentElement;
        return container.clientHeight;
    }
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
    function clear(chart) {
        chart.ctx.clearRect(0, 0, chart.width, chart.height);
    }
    function fontString(pixelSize, fontStyle, fontFamily) {
        return fontStyle + " " + pixelSize + "px " + fontFamily;
    }
    function longestText(ctx, font, strings) {
        ctx.font = font;
        var longest = 0;
        each(strings, function (s) {
            var textWidth = ctx.measureText(s).width;
            longest = (textWidth > longest) ? textWidth : longest;
        });
        return longest;
    }
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
    var ChartSettings = (function () {
        function ChartSettings() {
        }
        return ChartSettings;
    })();
    ChartJs.ChartSettings = ChartSettings;
    var Chart = (function () {
        function Chart(context) {
            this.canvas = context.canvas;
            this.ctx = context;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.aspectRatio = this.width / this.height;
            retinaScale(this);
        }
        Chart.defaults = {};
        return Chart;
    })();
    ChartJs.Chart = Chart;
    Chart.defaults["global"] = {
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
        }
    };
})(ChartJs || (ChartJs = {}));
//# sourceMappingURL=Chart.Core.js.map