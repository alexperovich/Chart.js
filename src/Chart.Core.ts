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

module ChartJs {
    interface ILoopable<T> {
        [index: number]: T;
        length: number;
    }

    interface ICloneable {
        clone(): any;
    }

    export class Point {
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
        x: number;
        y: number;
    }

    export class AngleAndDistance {
        constructor(angle: number, distance: number) {
            this.angle = angle;
            this.distance = distance;
        }
        angle: number;
        distance: number;
    }

    export class SplineCurve {
        constructor(inner: Point, outer: Point) {
            this.inner = inner;
            this.outer = outer;
        }
        inner: Point;
        outer: Point;
    }

    export interface IDictionary<T> {
        [key: string]: T;
    }

    function clone<T extends ICloneable>(value: T): T {
        return value.clone();
    }

    function each<T, TThis>(
        dictionary: IDictionary<T>,
        callback: (t: T, key?: string) => void,
        self?: TThis): void;
    function each<T, TThis>(
        loopable: ILoopable<T>,
        callback: (t: T, index?: number) => void,
        self?: TThis): void;

    function each<T, TThis>(collection: any, callback: (t: T, index: any) => void, self?: TThis) {
        if (collection.length) {
            var i;
            for (i = 0; i < collection.length; i++) {
                callback.apply(self, [collection[i], i]);
            }
        } else {
            for (var item in collection) {
                callback.apply(self, [collection[item], item]);
            }
        }
    }

    function where<T>(collection: ILoopable<T>, predicate: (value: T) => boolean): T[] {
        var filtered: T[] = [];
        each(collection,(item: T) => {
            if (predicate(item)) {
                filtered.push(item);
            }
        });
        return filtered;
    }

    function findNextWhere<T>(collection: ILoopable<T>, predicate: (value: T) => boolean, startIndex: number) {
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

    function findPreviousWhere<T>(collection: ILoopable<T>, predicate: (value: T) => boolean, startIndex: number) {
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

    function warn(str: string) {
        if (window.console && window.console.warn instanceof Function)
            window.console.warn(str);
    }

    function isNumber(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function max(array: number[]): number {
        return Math.max.apply(Math, array);
    }

    function min(array: number[]): number {
        return Math.min.apply(Math, array);
    }

    function clamp(value: number, minValue: number, maxValue: number) {
        return max([min([value, maxValue]), minValue]);
    }

    function getDecimalPlaces(num: number) {
        if (num % 1 !== 0 && isNumber(num)) {
            return num.toString().split(".")[1].length;
        } else {
            return 0;
        }
    }

    function toRadians(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    function getAngleFromPoint(centerPoint: Point, anglePoint: Point) {
        var distanceFromXCenter = anglePoint.x - centerPoint.x,
            distanceFromYCenter = anglePoint.y - centerPoint.y,
            radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);


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

    function aliasPixel(pixelWidth: number) {
        return (pixelWidth % 2 === 0) ? 0 : 0.5;
    }

    function splineCurve(first: Point, middle: Point, after: Point, t: number): SplineCurve {
        //Props to Rob Spencer at scaled innovation for his post on splining between points
        //http://scaledinnovation.com/analytics/splines/aboutSplines.html
        var d01 = Math.sqrt(Math.pow(middle.x - first.x, 2) + Math.pow(middle.y - first.y, 2)),
            d12 = Math.sqrt(Math.pow(after.x - middle.x, 2) + Math.pow(after.y - middle.y, 2)),
            fa = t * d01 / (d01 + d12),// scaling factor for triangle Ta
            fb = t * d12 / (d01 + d12);
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

    function calculateOrderOfMagnitude(value: number) {
        return Math.floor(Math.log(value) / Math.LN10);
    }

    export class ScaleRange {
        constructor(steps: number, stepValue: number, min: number, max: number) {
            this.steps = steps;
            this.stepValue = stepValue;
            this.min = min;
            this.max = max;
        }
        steps: number;
        stepValue: number;
        min: number;
        max: number;
    }

    function calculateScaleRange(values: number[], drawingSize: number, textSize: number, startFromZero: boolean, integersOnly: boolean): ScaleRange {

        //Set a minimum step of two - a point at the top of the graph, and a point at the base
        var minSteps = 2,
            maxSteps = Math.floor(drawingSize / (textSize * 1.5)),
            skipFitting = (minSteps >= maxSteps);

        var maxValue = max(values),
            minValue = min(values);

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

        var valueRange = Math.abs(maxValue - minValue),
            rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange),
            graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
            graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
            graphRange = graphMax - graphMin,
            stepValue = Math.pow(10, rangeOrderOfMagnitude),
            numberOfSteps = Math.round(graphRange / stepValue);

        //If we have more space on the graph we'll use it to give more definition to the data
        while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
            if (numberOfSteps > maxSteps) {
                stepValue *= 2;
                numberOfSteps = Math.round(graphRange / stepValue);
                // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
                if (numberOfSteps % 1 !== 0) {
                    skipFitting = true;
                }
            }
            //We can fit in double the amount of scale points on the scale
            else {
                //If user has declared ints only, and the step value isn't a decimal
                if (integersOnly && rangeOrderOfMagnitude >= 0) {
                    //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
                    if (stepValue / 2 % 1 === 0) {
                        stepValue /= 2;
                        numberOfSteps = Math.round(graphRange / stepValue);
                    }
                    //If it would make it a float break out of the loop
                    else {
                        break;
                    }
                }
                //If the scale doesn't have to be an int, make the scale more granular anyway.
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

    function template(func: (values: Object) => string, values: Object): string;
    function template(str: string, values: Object): string;

    // Blows up jshint errors based on the new Function constructor
    //Templating methods
    //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
    function template(tmpl: any, values: Object): string {

        // If templateString is function rather than string-template - call the function for valuesObject

        if (tmpl instanceof Function) {
            return tmpl(values);
        }

        var cache = {};
        return ((str, data) => {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ?
                cache[str] = cache[str] :

                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                new Function("obj",
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +

                    // Convert the template into pure JavaScript
                    str
                        .replace(/[\r\t\n]/g, " ")
                        .split("<%").join("\t")
                        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                        .replace(/\t=(.*?)%>/g, "',$1,'")
                        .split("\t").join("');")
                        .split("%>").join("p.push('")
                        .split("\r").join("\\'") +
                    "');}return p.join('');"
                    );

            // Provide some basic currying to the user
            return data ? fn(data) : fn;
        })(tmpl, values);

    }

    function generateLabels(tmpl: string, numberOfSteps: number, graphMin: number, stepValue: number) {
        var labelsArray = new Array(numberOfSteps);
        if (tmpl) {
            each(labelsArray,(val, index) => {
                labelsArray[index] = template(tmpl, { value: (graphMin + (stepValue * (index + 1))) });
            });
        }
        return labelsArray;
    }

    class Statics {
        static easingEffects: IDictionary<(t: number) => number>;
        private static __ctor = (() => {
            Statics.easingEffects = {};
            Statics.easingEffects["linear"] = (t) => t;

            Statics.easingEffects["easeInQuad"] = (t) => t * t;
            Statics.easingEffects["easeOutQuad"] = (t) => -1 * t * (t - 2);
            Statics.easingEffects["easeInOutQuad"] = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
                return -1 / 2 * ((--t) * (t - 2) - 1);
            }

            Statics.easingEffects["easeInCubic"] = (t) => t * t * t;
            Statics.easingEffects["easeOutCubic"] = (t) => 1 * ((t = t / 1 - 1) * t * t + 1);
            Statics.easingEffects["easeInOutCubic"] = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
                return 1 / 2 * ((t -= 2) * t * t + 2);
            };

            Statics.easingEffects["easeInQuart"] = (t) => t * t * t * t;
            Statics.easingEffects["easeOutQuart"] = (t) => -1 * ((t = t / 1 - 1) * t * t * t - 1);
            Statics.easingEffects["easeInOutQuart"] = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
                return -1 / 2 * ((t -= 2) * t * t * t - 2);
            };

            Statics.easingEffects["easeInQuint"] = (t) => 1 * (t /= 1) * t * t * t * t;
            Statics.easingEffects["easeOutQuint"] = (t) => 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
            Statics.easingEffects["easeInOutQuint"] = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
                return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
            };

            Statics.easingEffects["easeInSine"] = (t) => -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
            Statics.easingEffects["easeOutSine"] = (t) => 1 * Math.sin(t / 1 * (Math.PI / 2));
            Statics.easingEffects["easeInOutSine"] = (t) => {
                return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
            };

            Statics.easingEffects["easeInExpo"] = (t) => (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
            Statics.easingEffects["easeOutExpo"] = (t) => (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
            Statics.easingEffects["easeInOutExpo"] = (t) => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
                return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
            };

            Statics.easingEffects["easeInCirc"] = (t) => {
                if (t >= 1) return t;
                return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
            };
            Statics.easingEffects["easeOutCirc"] = (t) => {
                return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
            };
            Statics.easingEffects["easeInOutCirc"] = (t) => {
                if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
                return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
            };

            Statics.easingEffects["easeInElastic"] = (t) => {
                var s = 1.70158;
                var p = 0;
                var a = 1;
                if (t === 0) return 0;
                if ((t /= 1) == 1) return 1;
                if (!p) p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(1 / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            };
            Statics.easingEffects["easeOutElastic"] = (t) => {
                var s = 1.70158;
                var p = 0;
                var a = 1;
                if (t === 0) return 0;
                if ((t /= 1) == 1) return 1;
                if (!p) p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(1 / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
            }
            Statics.easingEffects["easeInOutElastic"] = (t) => {
                var s = 1.70158;
                var p = 0;
                var a = 1;
                if (t === 0) return 0;
                if ((t /= 1 / 2) == 2) return 1;
                if (!p) p = 1 * (0.3 * 1.5);
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(1 / a);
                if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
            };

            Statics.easingEffects["easeInBack"] = (t) => {
                var s = 1.70158;
                return 1 * (t /= 1) * t * ((s + 1) * t - s);
            };
            Statics.easingEffects["easeOutBack"] = (t) => {
                var s = 1.70158;
                return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
            };
            Statics.easingEffects["easeInOutBack"] = (t) => {
                var s = 1.70158;
                if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
                return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
            };

            Statics.easingEffects["easeInBounce"] = (t) => {
                return 1 - Statics.easingEffects["easeOutBounce"](1 - t);
            }
            Statics.easingEffects["easeOutBounce"] = (t) => {
                if ((t /= 1) < (1 / 2.75)) {
                    return 1 * (7.5625 * t * t);
                } else if (t < (2 / 2.75)) {
                    return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
                } else if (t < (2.5 / 2.75)) {
                    return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
                } else {
                    return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
                }
            };
            Statics.easingEffects["easeInOutBounce"] = (t) => {
                if (t < 1 / 2) return Statics.easingEffects["easeInBounce"](t * 2) * 0.5;
                return Statics.easingEffects["easeOutBounce"](t * 2 - 1) * 0.5 + 1 * 0.5;
            };
        })();
    }

    function requestAnimFrame(callback: FrameRequestCallback) {
        return (() => {
            return window.requestAnimationFrame ||
                (<any>window).webkitRequestAnimationFrame ||
                (<any>window).mozRequestAnimationFrame ||
                (<any>window).oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                (cb => window.setTimeout(cb, 1000 / 60));
        })()(callback);
    }

    function cancelAnimFrame(handle: number) {
        (() => {
            return window.cancelAnimationFrame ||
                (<any>window).webkitCancelAnimationFrame ||
                (<any>window).mozCancelAnimationFrame ||
                (<any>window).oCancelAnimationFrame ||
                (<any>window).msCancelAnimationFrame ||
                window.clearTimeout;
        })()(handle);
    }

    function animationLoop(
        callback: (easeDecimal: number, stepDecimal: number, currentStep: number) => void,
        totalSteps: number,
        easingString: string,
        onProgress: (easeDecimal: number, stepDecimal: number) => void,
        onComplete: () => void,
        chartInstance: Chart) {
        var currentStep = 0,
            easingFunction = Statics.easingEffects[easingString] || Statics.easingEffects["linear"];

        var animationFrame = () => {
            currentStep++;
            var stepDecimal = currentStep / totalSteps;
            var easeDecimal = easingFunction(stepDecimal);

            callback.call(chartInstance, easeDecimal, stepDecimal, currentStep);
            onProgress.call(chartInstance, easeDecimal, stepDecimal);
            if (currentStep < totalSteps) {
                chartInstance.animationFrame = requestAnimFrame(animationFrame);
            } else {
                onComplete.apply(chartInstance);
            }
        };
        chartInstance.animationFrame = requestAnimFrame(animationFrame);
    }

    function getRelativePosition(evt: PointerEvent): Point {
	    var mouseX, mouseY;
        var e = (<any>evt).originalEvent || evt;
        var canvas = <HTMLCanvasElement>(evt.currentTarget || evt.srcElement);
	    var boundingRect = canvas.getBoundingClientRect();

		if (e.touches){
			mouseX = e.touches[0].clientX - boundingRect.left;
			mouseY = e.touches[0].clientY - boundingRect.top;

		}
		else{
			mouseX = e.clientX - boundingRect.left;
			mouseY = e.clientY - boundingRect.top;
		}

		return {
			x : mouseX,
			y : mouseY
		};
    }

    function addEvent(node: HTMLElement, eventType: string, handler: EventListener) {
        if (node.addEventListener) {
            node.addEventListener(eventType, handler, false);
        } else if (node.attachEvent) {
            node.attachEvent("on" + eventType, handler);
        } else {
            node["on" + eventType] = handler;
        }
    }

    function removeEvent(node: HTMLElement, eventType: string, handler: EventListener) {
        if (node.removeEventListener) {
            node.removeEventListener(eventType, handler, false);
        } else if (node.detachEvent) {
            node.detachEvent(eventType, handler);
        } else {
            node["on" + eventType] = () => {};
        }
    }

    function bindEvents(chartInstance: Chart, events: string[], handler: EventListener) {
        if (!chartInstance.events) chartInstance.events = {};

        each(events, (eventName) => {
            chartInstance.events[eventName] = () => {
                handler.apply(chartInstance, arguments);
            };
            addEvent(chartInstance.canvas, eventName, chartInstance.events[eventName]);
        });
    }

    function unbindEvents(chartInstance: Chart, events: IDictionary<() => void>) {
        each(events, (handler, eventName) => {
            removeEvent(chartInstance.canvas, eventName, handler);
        });
    }

    function getMaximumWidth(node: HTMLElement) {
        var container = node.parentElement;
        return container.clientWidth;
    }

    function getMaximumHeight(node: HTMLElement) {
        var container = node.parentElement;
        return container.clientHeight;
    }

    function retinaScale(chart: Chart) {
        var ctx = chart.ctx,
            width = chart.canvas.width,
            height = chart.canvas.height;
        if (window.devicePixelRatio) {
            ctx.canvas.style.width = width + "px";
            ctx.canvas.style.height = height + "px";
            ctx.canvas.height = height * window.devicePixelRatio;
            ctx.canvas.width = width * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    }

    function clear(chart: Chart) {
        chart.ctx.clearRect(0, 0, chart.width, chart.height);
    }

    function fontString(pixelSize: number, fontStyle: string, fontFamily: string) {
        return fontStyle + " " + pixelSize + "px " + fontFamily;
    }

    function longestText(ctx: CanvasRenderingContext2D, font: string, strings: string[]) {
        ctx.font = font;
        var longest = 0;
        each(strings, s => {
            var textWidth = ctx.measureText(s).width;
            longest = (textWidth > longest) ? textWidth : longest;
        });
        return longest;
    }

    function drawRoundedRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

    export class ChartSettings {
        // Boolean - Whether to animate the chart
        animation: boolean;

        // Number - Number of animation steps
        animationSteps: number;

        // String - Animation easing effect
        animationEasing: string;

        // Boolean - If we should show the scale at all
        showScale: boolean;

        // Boolean - If we want to override with a hard coded scale
        scaleOverride: boolean;

        // ** Required if scaleOverride is true **
        // Number - The number of steps in a hard coded scale
        scaleSteps: number;
        // Number - The value jump in the hard coded scale
        scaleStepWidth: number;

        // Number - The scale starting value
        scaleStartValue: number;

        // String - Colour of the scale line
        scaleLineColor: string;

        // Number - Pixel width of the scale line
        scaleLineWidth: number;

        // Boolean - Whether to show labels on the scale
        scaleShowLabels: boolean;

        // Interpolated JS string - can access value
        scaleLabel: string;

        // Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
        scaleIntegersOnly: boolean;

        // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero: boolean;

        // String - Scale label font declaration for the scale label
        scaleFontFamily: string;

        // Number - Scale label font size in pixels
        scaleFontSize: number;

        // String - Scale label font weight style
        scaleFontStyle: string;

        // String - Scale label font colour
        scaleFontColor: string;

        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive: boolean;

        // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: boolean;

        // Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
        showTooltips: boolean;

        // Boolean - Determines whether to draw built-in tooltip or call custom tooltip function
        customTooltips: boolean;

        // Array - Array of string names to attach tooltip events
        tooltipEvents: string[];

        // String - Tooltip background colour
        tooltipFillColor: string;

        // String - Tooltip label font declaration for the scale label
        tooltipFontFamily: string;

        // Number - Tooltip label font size in pixels
        tooltipFontSize: number;

        // String - Tooltip font weight style
        tooltipFontStyle: string;

        // String - Tooltip label font colour
        tooltipFontColor: string;

        // String - Tooltip title font declaration for the scale label
        tooltipTitleFontFamily: string;

        // Number - Tooltip title font size in pixels
        tooltipTitleFontSize: number;

        // String - Tooltip title font weight style
        tooltipTitleFontStyle: string;

        // String - Tooltip title font colour
        tooltipTitleFontColor: string;

        // Number - pixel width of padding around tooltip text
        tooltipYPadding: number;

        // Number - pixel width of padding around tooltip text
        tooltipXPadding: number;

        // Number - Size of the caret on the tooltip
        tooltipCaretSize: number;

        // Number - Pixel radius of the tooltip border
        tooltipCornerRadius: number;

        // Number - Pixel offset from point x to tooltip edge
        tooltipXOffset: number;

        // String - Template string for single tooltips
        tooltipTemplate: string;

        // String - Template string for single tooltips
        multiTooltipTemplate: string;

        // String - Colour behind the legend colour block
        multiTooltipKeyBackground: string;

        // Function - Will fire on animation progression.
        onAnimationProgress: () => void;

        // Function - Will fire on animation completion.
        onAnimationComplete: () => void;
    }

    export class Chart {
        ctx: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;
        width: number;
        height: number;
        aspectRatio: number;
        animationFrame: number;

        constructor(context: CanvasRenderingContext2D) {
            this.canvas = context.canvas;
            this.ctx = context;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.aspectRatio = this.width / this.height;
            retinaScale(this);
        }

        public static defaults: IDictionary<ChartSettings> = {}
        events: IDictionary<() => void>;
    }

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
        onAnimationProgress() { },
        onAnimationComplete() { }
    }
}

