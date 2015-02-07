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
	"use strict";
    export interface ILoopable<T> {
        [index: number]: T;
        length: number;
    }

    export interface ICloneable {
        clone(): any;
    }

	export class Color {
		constructor(fill: string, stroke: string) {
			this.fill = fill;
			this.stroke = stroke;
		}
		fill: string;
		stroke: string;
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

	export function cloneProperties(value: any): any {
		var objClone = {};
		for (var prop in value) {
			if (value.hasOwnProperty(prop))
				objClone[prop] = value[prop];
		}
		return objClone;
	}

	export function merge(options: Object, defaults: Object) {
		for (var prop in defaults) {
			if (!options.hasOwnProperty(prop)) {
				options[prop] = defaults[prop];
			}
		}
		return options;
	}

    export function each<T>(
        dictionary: IDictionary<T>,
        callback: (t: T, key?: string) => void): void;
    export function each<T>(
        loopable: ILoopable<T>,
        callback: (t: T, index?: number) => void): void;
    export function each<T, TParam>(
        loopable: ILoopable<T>,
        callback: (t: T, index?: number, param?: TParam) => void,
		param: TParam): void;

    export function each<T, TParam>(collection: any, callback: (t: T, index?: any, param?: TParam) => void, param?: TParam) {
        if (collection.length) {
            var i;
            for (i = 0; i < collection.length; i++) {
				callback(collection[i], i, param);
            }
        } else {
            for (var item in collection) {
		        if (collection.hasOwnProperty(item)) {
					callback(collection[item], item, param);
		        }
	        }
        }
    }

    export function where<T>(collection: ILoopable<T>, predicate: (value: T) => boolean): T[] {
        var filtered: T[] = [];
        each(collection,(item: T) => {
            if (predicate(item)) {
                filtered.push(item);
            }
        });
        return filtered;
    }

    export function findNextWhere<T>(collection: ILoopable<T>, predicate: (value: T) => boolean, startIndex: number) {
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

    export function findPreviousWhere<T>(collection: ILoopable<T>, predicate: (value: T) => boolean, startIndex: number) {
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

    export function warn(str: string) {
        if (window.console && window.console.warn instanceof Function)
            window.console.warn(str);
    }

    export function isNumber(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    export function max(array: number[]): number {
        return Math.max.apply(Math, array);
    }

    export function min(array: number[]): number {
        return Math.min.apply(Math, array);
    }

    export function clamp(value: number, minValue: number, maxValue: number) {
        return max([min([value, maxValue]), minValue]);
    }

    export function getDecimalPlaces(num: number) {
        if (num % 1 !== 0 && isNumber(num)) {
            return num.toString().split(".")[1].length;
        } else {
            return 0;
        }
    }

    export function toRadians(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    export function getAngleFromPoint(centerPoint: Point, anglePoint: Point) {
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

    export function aliasPixel(pixelWidth: number) {
        return (pixelWidth % 2 === 0) ? 0 : 0.5;
    }

    export function splineCurve(first: Point, middle: Point, after: Point, t: number): SplineCurve {
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

    export function calculateOrderOfMagnitude(value: number) {
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

    export function calculateScaleRange(values: number[], drawingSize: number, textSize: number, startFromZero: boolean, integersOnly: boolean): ScaleRange {

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

    export function template(func: (values: Object) => string, values: Object): string;
    export function template(str: string, values: Object): string;

    //Templating methods
    //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
    export function template(tmpl: any, values: Object): string {

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

    export function generateLabels(tmpl: string, numberOfSteps: number, graphMin: number, stepValue: number) {
        var labelsArray = new Array(numberOfSteps);
        if (tmpl) {
            each(labelsArray,(val, index) => {
                labelsArray[index] = template(tmpl, { value: (graphMin + (stepValue * (index + 1))) });
            });
        }
        return labelsArray;
    }

    export class Statics {
        static easingEffects: IDictionary<(t: number) => number>;
        private static ctor = (() => {
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
                var s: number;
	            var a = 1;
                if (t === 0) return 0;
                if ((t /= 1) === 1) return 1;
                var p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(1 / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            };
            Statics.easingEffects["easeOutElastic"] = (t) => {
                var s: number;
	            var a = 1;
                if (t === 0) return 0;
                if ((t /= 1) === 1) return 1;
                var p = 1 * 0.3;
                if (a < Math.abs(1)) {
                    a = 1;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(1 / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
            }
            Statics.easingEffects["easeInOutElastic"] = (t) => {
                var s: number;
	            var a = 1;
                if (t === 0) return 0;
                if ((t /= 1 / 2) === 2) return 1;
                var p = 1 * (0.3 * 1.5);
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
	        return 0;
        })();
    }

    export function requestAnimFrame(callback: FrameRequestCallback) {
        return (() => {
            return window.requestAnimationFrame ||
                (<any>window).webkitRequestAnimationFrame ||
                (<any>window).mozRequestAnimationFrame ||
                (<any>window).oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                (cb => window.setTimeout(cb, 1000 / 60));
        })()(callback);
    }

    export function cancelAnimFrame(handle: number) {
        (() => {
            return window.cancelAnimationFrame ||
                (<any>window).webkitCancelAnimationFrame ||
                (<any>window).mozCancelAnimationFrame ||
                (<any>window).oCancelAnimationFrame ||
                (<any>window).msCancelAnimationFrame ||
                window.clearTimeout;
        })()(handle);
    }

    export function animationLoop(
        callback: (easeDecimal: number, stepDecimal: number, currentStep: number) => void,
        totalSteps: number,
        easingString: string,
        onProgress: (easeDecimal: number, stepDecimal: number) => void,
        onComplete: () => void,
        chartInstance: ChartBase) {
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

    export function getRelativePosition(evt: PointerEvent): Point {
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

    export function addEvent(node: HTMLElement, eventType: string, handler: EventListener) {
        if (node.addEventListener) {
            node.addEventListener(eventType, handler, false);
        } else if (node.attachEvent) {
            node.attachEvent("on" + eventType, handler);
        } else {
            node["on" + eventType] = handler;
        }
    }

    export function removeEvent(node: HTMLElement, eventType: string, handler: EventListener) {
        if (node.removeEventListener) {
            node.removeEventListener(eventType, handler, false);
        } else if (node.detachEvent) {
            node.detachEvent(eventType, handler);
        } else {
            node["on" + eventType] = () => {};
        }
    }

    export function bindEvents(chartInstance: ChartBase, events: string[], handler: EventListener) {
        if (!chartInstance.events) chartInstance.events = {};

        each(events, (eventName) => {
            chartInstance.events[eventName] = () => {
                handler.apply(chartInstance, arguments);
            };
            addEvent(chartInstance.canvas, eventName, chartInstance.events[eventName]);
        });
    }

    export function unbindEvents(chartInstance: ChartBase, events: IDictionary<() => void>) {
        each(events, (handler, eventName) => {
            removeEvent(chartInstance.canvas, eventName, handler);
        });
    }

    export function getMaximumWidth(node: HTMLElement) {
        var container = node.parentElement;
        return container.clientWidth;
    }

    export function getMaximumHeight(node: HTMLElement) {
        var container = node.parentElement;
        return container.clientHeight;
    }

    export function retinaScale(chart: ChartBase) {
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

    export function clear(chart: ChartBase) {
        chart.ctx.clearRect(0, 0, chart.width, chart.height);
    }

    export function fontString(pixelSize: number, fontStyle: string, fontFamily: string) {
        return fontStyle + " " + pixelSize + "px " + fontFamily;
    }

    export function longestText(ctx: CanvasRenderingContext2D, font: string, strings: string[]) {
        ctx.font = font;
        var longest = 0;
        each(strings, s => {
            var textWidth = ctx.measureText(s).width;
            longest = (textWidth > longest) ? textWidth : longest;
        });
        return longest;
    }

    export function drawRoundedRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

	export class Element implements ICloneable {

		constructor(ctx: CanvasRenderingContext2D, options: any) {
			this.ctx = ctx;
			this.label = options.label;
			this.strokeColor = options.strokeColor;
			this.fillColor = options.fillColor;
			this.initialize.apply(this, arguments);
			this.save();
		}

		initialize() {
			
		}

		restore(props: string[]) {
			if (!props) {
				var dictionary = this._saved;
				for (var prop in dictionary) {
					if (dictionary.hasOwnProperty(prop)) {
						this[prop] = dictionary[prop];
					}
				}
			} else {
				each(props, (key: string) => {
					this[key] = this._saved[key];
				});
			}
			return this;
		}

		save() {
			this._saved = cloneProperties(this);
			delete this._saved._saved;
			return this;
		}

		update(newOptions?: Object) {
			for (var prop in newOptions) {
				if (newOptions.hasOwnProperty(prop)) {
					this._saved[prop] = this[prop];
					this[prop] = newOptions[prop];
				}
			}
			return this;
		}

		transition(props: IDictionary<any>, ease: number) {
			each(props, (value, key) => {
				this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
			});
			return this;
		}

		hasValue(): boolean {
			if (this.value)
				return true;
			return false;
		}

		draw(easingDecimal?: number) {
			
		}

		inRange(chartX: number, chartY: number): boolean {
			return false;
		}

		clone() {
			return <Element>cloneProperties(this);
		}
		label: string;
		_saved: any;
		x: number;
		y: number;
		value: number;
		ctx: CanvasRenderingContext2D;
		strokeColor: string;
		strokeWidth: number;
		fillColor: string;
		showStroke: boolean;
		chart: ChartBase;
		display: boolean;

		tooltipPosition(): Point {
			return {
				x: this.x,
				y: this.y
			}
		}
	}

	export class ChartPoint extends Element {
		constructor(ctx: CanvasRenderingContext2D, options: any) {
			super(ctx, options);
			return;
		}
		inRange(chartX: number, chartY: number) {
			var hitDetectionRange = this.hitDetectionRadius + this.radius;
			return ((Math.pow(chartX - this.x, 2) + Math.pow(chartY - this.y, 2)) < Math.pow(hitDetectionRange, 2));
		}

		draw() {
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
		}

		radius: number;
		hitDetectionRadius: number;
	}

	export class Arc extends Element {
		constructor(ctx: CanvasRenderingContext2D, options: any) {
			super(ctx, options);
		}

		inRange(chartX, chartY) {
			var pointRelativePosition = getAngleFromPoint(this, {
				x: chartX,
				y: chartY
			});

			var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle),
				withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);
			return (betweenAngles && withinRadius);
		}

		tooltipPosition() {
			var centerAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2),
				rangeFromCenter = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
			return {
				x: this.x + (Math.cos(centerAngle) * rangeFromCenter),
				y: this.y + (Math.sin(centerAngle) * rangeFromCenter)
			};
		}

		draw(animationPercent?: number) {
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
		}

		startAngle: number;
		endAngle: number;
		innerRadius: number;
		outerRadius: number;
	}

	export class Rectangle extends Element {
		draw() {
			var ctx = this.ctx,
				halfWidth = this.width / 2,
				leftX = this.x - halfWidth,
				rightX = this.x + halfWidth,
				top = this.y,
				halfStroke = this.strokeWidth / 2;

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
		}

		height() {
			return this.base - this.y;
		}

		inRange(chartX: number, chartY: number): boolean {
			return (chartX >= this.x - this.width / 2 && chartX <= this.x + this.width / 2) && (chartY >= this.y && chartY <= this.base);
		}

		width: number;
		base: number;
	}

	export class TextElement extends Element {
		constructor(ctx: CanvasRenderingContext2D, options: Object) {
			super(ctx, options);
			return;
		}
		fontSize: number;
		fontStyle: string;
		fontFamily: string;
		font: string;
		text: string;
		textColor: string;
	}

	export class Tooltip extends TextElement {
		constructor(ctx: CanvasRenderingContext2D, options: Object) {
			super(ctx, options);
			return;
		}

		initialize() {
			this.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);
		}

		draw() {
			var ctx = this.ctx;

			ctx.font = this.font;

			this.xAlign = "center";
			this.yAlign = "above";

			//Distance between the actual element.y position and the start of the tooltip caret
			var caretPadding = this.caretPadding = 2;

			var tooltipWidth = ctx.measureText(this.text).width + 2*this.xPadding,
				tooltipRectHeight = this.fontSize + 2*this.yPadding,
				tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

			if (this.x + tooltipWidth/2 >this.chart.width){
				this.xAlign = "left";
			} else if (this.x - tooltipWidth/2 < 0){
				this.xAlign = "right";
			}

			if (this.y - tooltipHeight < 0){
				this.yAlign = "below";
			}


			var tooltipX = this.x - tooltipWidth/2,
				tooltipY = this.y - tooltipHeight;

			ctx.fillStyle = this.fillColor;

			// Custom Tooltips
			if(this.custom){
				this.custom(this);
			}
			else{
				switch(this.yAlign)
				{
				case "above":
					//Draw a caret above the x/y
					ctx.beginPath();
					ctx.moveTo(this.x,this.y - caretPadding);
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

				switch(this.xAlign)
				{
				case "left":
					tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
					break;
				case "right":
					tooltipX = this.x - (this.cornerRadius + this.caretHeight);
					break;
				}

				drawRoundedRectangle(ctx,tooltipX,tooltipY,tooltipWidth,tooltipRectHeight,this.cornerRadius);

				ctx.fill();

				ctx.fillStyle = this.textColor;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(this.text, tooltipX + tooltipWidth/2, tooltipY + tooltipRectHeight/2);
			}
		}

		caretPadding: number;
		caretHeight: number;
		cornerRadius: number;
		xAlign: string;
		yAlign: string;
		xPadding: number;
		yPadding: number;
		custom: (tt: Tooltip) => void;
	}

	export class MultiToolTip extends TextElement {
		constructor(ctx: CanvasRenderingContext2D, options: Object) {
			super(ctx, options);
			return;
		}

		initialize() {
			this.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);

			this.titleFont = fontString(this.titleFontSize, this.titleFontStyle, this.titleFontFamily);

			this.height = (this.labels.length * this.fontSize) + ((this.labels.length - 1) * (this.fontSize / 2)) + (this.yPadding * 2) + this.titleFontSize * 1.5;

			this.ctx.font = this.titleFont;

			var titleWidth = this.ctx.measureText(this.title).width,
				//Label has a legend square as well so account for this.
				labelWidth = longestText(this.ctx, this.font, this.labels) + this.fontSize + 3,
				longestTextWidth = max([labelWidth, titleWidth]);

			this.width = longestTextWidth + (this.xPadding * 2);


			var halfHeight = this.height / 2;

			//Check to ensure the height will fit on the canvas
			//The three is to buffer form the very
			if (this.y - halfHeight < 0) {
				this.y = halfHeight;
			} else if (this.y + halfHeight > this.chart.height) {
				this.y = this.chart.height - halfHeight;
			}

			//Decide whether to align left or right based on position on canvas
			if (this.x > this.chart.width / 2) {
				this.x -= this.xOffset + this.width;
			} else {
				this.x += this.xOffset;
			}
		}

		getLineHeight(index: number): number {
			var baseLineHeight = this.y - (this.height / 2) + this.yPadding,
				afterTitleIndex = index - 1;

			if (index === 0) {
				return baseLineHeight + this.titleFontSize / 2;
			} else {
				return baseLineHeight + ((this.fontSize * 1.5 * afterTitleIndex) + this.fontSize / 2) + this.titleFontSize * 1.5;
			}
		}

		draw() {
			if (this.custom) {
				this.custom(this);
			} else {
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
				each(this.labels, (label: string, index: number) => {
					ctx.fillStyle = this.textColor;
					ctx.fillText(label, this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));

					//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
					//ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
					//Instead we'll make a white filled block to put the legendColour palette over.

					ctx.fillStyle = this.legendColorBackground;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize / 2, this.fontSize, this.fontSize);

					ctx.fillStyle = this.legendColors[index].fill;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize / 2, this.fontSize, this.fontSize);


				});
			}
		}

		titleFontSize: number;
		titleFontStyle: string;
		titleFontFamily: string;
		titleFont: string;
		width: number;
		height: number;
		yPadding: number;
		xPadding: number;
		labels: string[];
		title: string;
		titleTextColor: string;
		xOffset: number;
		custom: (tt: MultiToolTip) => void;
		cornerRadius: number;
		legendColorBackground: string;
		legendColors: Color[];
	}

	export interface IScaleOptions {
		templateString: string;
		height: number;
		width: number;
		textColor: string;
		fontSize: number;
		fontStyle: string;
		fontFamily: string;
		valuesCount: number;
		xLabels: string[];
		font: string;
		lineWidth: number;
		lineColor: string;
		showHorizontalLines: boolean;
		showVerticalLines: boolean;
		gridLineWidth: number;
		gridLineColor: string;
		padding: number;
		showLabels: boolean;
		display: boolean;
	}

	export class Scale extends Element {
		constructor(ctx: CanvasRenderingContext2D, options: IScaleOptions) {
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
			super(ctx, options);
		}

		initialize() {
			this.fit();
		}

		buildYLabels() {
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i = 0; i <= this.steps; i++) {
				this.yLabels.push(template(this.templateString, { value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces) }));
			}
			this.yLabelWidth = (this.display && this.showLabels) ? longestText(this.ctx, this.font, this.yLabels) : 0;
		}

		addXLabel(label: string) {
			this.xLabels.push(label);
			this.valuesCount++;
			this.fit();
		}

		removeXLabel() {
			this.xLabels.shift();
			this.valuesCount--;
			this.fit();
		}

		fit() {
			// First we need the width of the yLabels, assuming the xLabels aren't rotated

			// To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
			this.startPoint = (this.display) ? this.fontSize : 0;
			this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

			// Apply padding settings to the start and end point.
			this.startPoint += this.padding;
			this.endPoint -= this.padding;

			// Cache the starting height, so can determine if we need to recalculate the scale yAxis
			var cachedHeight = this.endPoint - this.startPoint,
				cachedYLabelWidth;

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
		}

		calculateXLabelRotation() {
			//Get the width of each grid by calculating the difference
			//between x offsets between 0 and 1.

			this.ctx.font = this.font;

			var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
				lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
				firstRotated,
				lastRotated;


			this.xScalePaddingRight = lastWidth / 2 + 3;
			this.xScalePaddingLeft = (firstWidth / 2 > this.yLabelWidth + 10) ? firstWidth / 2 : this.yLabelWidth + 10;

			this.xLabelRotation = 0;
			if (this.display) {
				var originalLabelWidth = longestText(this.ctx, this.font, this.xLabels),
					cosRotation,
					firstRotatedWidth;
				this.xLabelWidth = originalLabelWidth;
				//Allow 3 pixels x2 padding either side for label readability
				var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;

				//Max label rotate should be 90 - also act as a loop counter
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
		}

		calculateYRange(cachedHeight: number) {
			throw new Error("calculateYRange must be implemented in a derived class.");
		}

		drawingArea() {
			return this.startPoint - this.endPoint;
		}

		calculateY(value: number) {
			var scalingFactor = this.drawingArea() / (this.min - this.max);
			return this.endPoint - (scalingFactor * (value - this.min));
		}

		calculateX(index: number) {
			var isRotated = (this.xLabelRotation > 0),
				// innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
				innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight),
				valueWidth = innerWidth/(this.valuesCount - ((this.offsetGridLines) ? 0 : 1)),
				valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

			if (this.offsetGridLines){
				valueOffset += (valueWidth/2);
			}

			return Math.round(valueOffset);
		}

		update(newOptions?: Object) {
			super.update(newOptions);
			this.fit();
			return this;
		}

		draw(easingDecimal?: number) {
			var ctx = this.ctx,
				yLabelGap = (this.endPoint - this.startPoint) / this.steps,
				xStart = Math.round(this.xScalePaddingLeft);
			if (this.display){
				ctx.fillStyle = this.textColor;
				ctx.font = this.font;
				each(this.yLabels,(labelString: string,index: number) => {
					var yLabelCenter = this.endPoint - (yLabelGap * index),
						linePositionY = Math.round(yLabelCenter),
						drawHorizontalLine = this.showHorizontalLines;

					ctx.textAlign = "right";
					ctx.textBaseline = "middle";
					if (this.showLabels){
						ctx.fillText(labelString,xStart - 10,yLabelCenter);
					}

					// This is X axis, so draw it
					if (index === 0 && !drawHorizontalLine){
						drawHorizontalLine = true;
					}

					if (drawHorizontalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					linePositionY += aliasPixel(ctx.lineWidth);

					if(drawHorizontalLine){
						ctx.moveTo(xStart, linePositionY);
						ctx.lineTo(this.width, linePositionY);
						ctx.stroke();
						ctx.closePath();
					}

					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;
					ctx.beginPath();
					ctx.moveTo(xStart - 5, linePositionY);
					ctx.lineTo(xStart, linePositionY);
					ctx.stroke();
					ctx.closePath();

				});

				each(this.xLabels, (label: string, index: number) => {
					var xPos = this.calculateX(index) + aliasPixel(this.lineWidth),
						// Check to see if line/bar here and decide where to place the line
						linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth),
						isRotated = (this.xLabelRotation > 0),
						drawVerticalLine = this.showVerticalLines;

					// This is Y axis, so draw it
					if (index === 0 && !drawVerticalLine){
						drawVerticalLine = true;
					}

					if (drawVerticalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					if (drawVerticalLine){
						ctx.moveTo(linePos,this.endPoint);
						ctx.lineTo(linePos,this.startPoint - 3);
						ctx.stroke();
						ctx.closePath();
					}


					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;


					// Small lines at the bottom of the base grid line
					ctx.beginPath();
					ctx.moveTo(linePos,this.endPoint);
					ctx.lineTo(linePos,this.endPoint + 5);
					ctx.stroke();
					ctx.closePath();

					ctx.save();
					ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);
					ctx.rotate(toRadians(this.xLabelRotation)*-1);
					ctx.font = this.font;
					ctx.textAlign = (isRotated) ? "right" : "center";
					ctx.textBaseline = (isRotated) ? "middle" : "top";
					ctx.fillText(label, 0, 0);
					ctx.restore();
				});
			}
		}

		fontSize: number;
		fontFamily: string;
		fontStyle: string;
		font: string;
		yLabels: string[];
		yLabelWidth: number;
		xLabels: string[];
		stepValue: number;
		steps: number;
		templateString: string;
		showLabels: boolean;
		valuesCount: number;
		startPoint: number;
		endPoint: number;
		padding: number;
		width: number;	
		height: number;
		xScalePaddingRight: number;
		xScalePaddingLeft: number;
		xLabelWidth: number;
		xLabelRotation: number;
		min: number;
		max: number;
		offsetGridLines: boolean;
		textColor: string;
		showHorizontalLines: boolean;
		gridLineWidth: number;
		gridLineColor: string;
		lineWidth: number;
		lineColor: string;
		showVerticalLines: boolean;
	}

	export class RadialScale extends Element {
		constructor(ctx: CanvasRenderingContext2D, options: Object) {
			super(ctx, options);
		}

		initialize() {
			this.size = min([this.height, this.width]);
			this.drawingArea = (this.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
		}

		calculateCenterOffset(value: number) {
			var scalingFactor = this.drawingArea / (this.max - this.min);
			return (value - this.min) * scalingFactor;
		}

		update(newOptions: Object) {
			super.update(newOptions);
			if (!this.lineArc) {
				this.setScaleSize();
			} else {
				this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
			}
			this.buildYLabels();
			return this;
		}

		buildYLabels() {
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i = 0; i <= this.steps; i++) {
				this.yLabels.push(template(this.templateString, { value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces) }));
			}
		}

		getCircumference() {
			return ((Math.PI * 2) / this.valuesCount);
		}

		setScaleSize() {
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
			var largestPossibleRadius = min([(this.height/2 - this.pointLabelFontSize - 5), this.width/2]),
				pointPosition,
				i,
				textWidth,
				halfTextWidth,
				furthestRight = this.width,
				furthestRightIndex,
				furthestRightAngle,
				furthestLeft = 0,
				furthestLeftIndex,
				furthestLeftAngle,
				xProtrusionLeft,
				xProtrusionRight,
				radiusReductionRight,
				radiusReductionLeft,
				maxWidthRadius;
			this.ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
			for (i=0;i<this.valuesCount;i++){
				// 5px to space the text slightly out - similar to what we do in the draw function.
				pointPosition = this.getPointPosition(i, largestPossibleRadius);
				textWidth = this.ctx.measureText(template(this.templateString, { value: this.labels[i] })).width + 5;
				if (i === 0 || i === this.valuesCount/2){
					// If we're at index zero, or exactly the middle, we're at exactly the top/bottom
					// of the radar chart, so text will be aligned centrally, so we'll half it and compare
					// w/left and right text sizes
					halfTextWidth = textWidth/2;
					if (pointPosition.x + halfTextWidth > furthestRight) {
						furthestRight = pointPosition.x + halfTextWidth;
						furthestRightIndex = i;
					}
					if (pointPosition.x - halfTextWidth < furthestLeft) {
						furthestLeft = pointPosition.x - halfTextWidth;
						furthestLeftIndex = i;
					}
				}
				else if (i < this.valuesCount/2) {
					// Less than half the values means we'll left align the text
					if (pointPosition.x + textWidth > furthestRight) {
						furthestRight = pointPosition.x + textWidth;
						furthestRightIndex = i;
					}
				}
				else if (i > this.valuesCount/2){
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

			radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI/2);

			radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI/2);

			// Ensure we actually need to reduce the size of the chart
			radiusReductionRight = (isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
			radiusReductionLeft = (isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

			this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight)/2;

			//this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
			this.setCenterPoint(radiusReductionLeft, radiusReductionRight);
		}

		setCenterPoint(leftMovement: number, rightMovement: number) {
			var maxRight = this.width - rightMovement - this.drawingArea,
				maxLeft = leftMovement + this.drawingArea;

			this.xCenter = (maxLeft + maxRight) / 2;
			this.yCenter = (this.height / 2);
		}

		getIndexAngle(index: number) {
			var angleMultiplier = (Math.PI * 2) / this.valuesCount;
			return index * angleMultiplier - (Math.PI / 2);
		}

		getPointPosition(index: number, distanceFromCenter: number) {
			var thisAngle = this.getIndexAngle(index);
			return {
				x: (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
				y: (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
			};
		}

		draw() {
			if (this.display){
				var ctx = this.ctx;
				each(this.yLabels,(label: string, index: number) => {
					// Don't draw a center value
					if (index > 0){
						var yCenterOffset = index * (this.drawingArea/this.steps),
							yHeight = this.yCenter - yCenterOffset,
							pointPosition;

						// Draw circular lines around the scale
						if (this.lineWidth > 0){
							ctx.strokeStyle = this.lineColor;
							ctx.lineWidth = this.lineWidth;

							if(this.lineArc){
								ctx.beginPath();
								ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI*2);
								ctx.closePath();
								ctx.stroke();
							} else{
								ctx.beginPath();
								for (var i=0;i<this.valuesCount;i++)
								{
									pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + (index * this.stepValue)));
									if (i === 0){
										ctx.moveTo(pointPosition.x, pointPosition.y);
									} else {
										ctx.lineTo(pointPosition.x, pointPosition.y);
									}
								}
								ctx.closePath();
								ctx.stroke();
							}
						}
						if(this.showLabels){
							ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);
							if (this.showLabelBackdrop){
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = this.backdropColor;
								ctx.fillRect(
									this.xCenter - labelWidth/2 - this.backdropPaddingX,
									yHeight - this.fontSize/2 - this.backdropPaddingY,
									labelWidth + this.backdropPaddingX*2,
									this.fontSize + this.backdropPaddingY*2
								);
							}
							ctx.textAlign = 'center';
							ctx.textBaseline = "middle";
							ctx.fillStyle = this.fontColor;
							ctx.fillText(label, this.xCenter, yHeight);
						}
					}
				});

				if (!this.lineArc){
					ctx.lineWidth = this.angleLineWidth;
					ctx.strokeStyle = this.angleLineColor;
					for (var i = this.valuesCount - 1; i >= 0; i--) {
						if (this.angleLineWidth > 0){
							var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
							ctx.beginPath();
							ctx.moveTo(this.xCenter, this.yCenter);
							ctx.lineTo(outerPosition.x, outerPosition.y);
							ctx.stroke();
							ctx.closePath();
						}
						// Extra 3px out for some label spacing
						var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
						ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
						ctx.fillStyle = this.pointLabelFontColor;

						var labelsCount = this.labels.length,
							halfLabelsCount = this.labels.length/2,
							quarterLabelsCount = halfLabelsCount/2,
							upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
							exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
						if (i === 0){
							ctx.textAlign = 'center';
						} else if(i === halfLabelsCount){
							ctx.textAlign = 'center';
						} else if (i < halfLabelsCount){
							ctx.textAlign = 'left';
						} else {
							ctx.textAlign = 'right';
						}

						// Set the correct text baseline based on outer positioning
						if (exactQuarter){
							ctx.textBaseline = 'middle';
						} else if (upperHalf){
							ctx.textBaseline = 'bottom';
						} else {
							ctx.textBaseline = 'top';
						}

						ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
					}
				}
			}
		}

		fontSize: number;
		size: number;
		drawingArea: number;
		width: number;
		height: number;
		backdropPaddingX: number;
		backdropPaddingY: number;
		min: number;
		max: number;
		lineArc: boolean;
		yLabels: string[];
		stepValue: number;
		steps: number;
		templateString: string;
		valuesCount: number;
		pointLabelFontSize: number;
		pointLabelFontStyle: string;
		pointLabelFontFamily: string;
		labels: string[];
		xCenter: number;
		yCenter: number;
		lineWidth: number;
		lineColor: string;
		showLabels: boolean;
		fontStyle: string;
		fontFamily: string;
		fontColor: string;
		showLabelBackdrop: boolean;
		backdropColor: string;
		angleLineWidth: number;
		angleLineColor: string;
		pointLabelFontColor: string;
	}

	export class Dataset {
		elements: Element[];
		color: Color;
		highlightColor: Color;
	}

	export interface IChartOptions {
        // Boolean - Whether to animate the chart
        animation?: boolean;

        // Number - Number of animation steps
        animationSteps?: number;

        // String - Animation easing effect
        animationEasing?: string;

        // Boolean - If we should show the scale at all
        showScale?: boolean;

        // Boolean - If we want to override with a hard coded scale
        scaleOverride?: boolean;

        // ** Required if scaleOverride is true **
        // Number - The number of steps in a hard coded scale
        scaleSteps?: number;
        // Number - The value jump in the hard coded scale
        scaleStepWidth?: number;

        // Number - The scale starting value
        scaleStartValue?: number;

        // String - Colour of the scale line
        scaleLineColor?: string;

        // Number - Pixel width of the scale line
        scaleLineWidth?: number;

        // Boolean - Whether to show labels on the scale
        scaleShowLabels?: boolean;

        // Interpolated JS string - can access value
        scaleLabel?: string;

        // Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
        scaleIntegersOnly?: boolean;

        // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero?: boolean;

        // String - Scale label font declaration for the scale label
        scaleFontFamily?: string;

        // Number - Scale label font size in pixels
        scaleFontSize?: number;

        // String - Scale label font weight style
        scaleFontStyle?: string;

        // String - Scale label font colour
        scaleFontColor?: string;

        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive?: boolean;

        // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio?: boolean;

        // Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
        showTooltips?: boolean;

        // Array - Array of string names to attach tooltip events
        tooltipEvents?: string[];

        // String - Tooltip background colour
        tooltipFillColor?: string;

        // String - Tooltip label font declaration for the scale label
        tooltipFontFamily?: string;

        // Number - Tooltip label font size in pixels
        tooltipFontSize?: number;

        // String - Tooltip font weight style
        tooltipFontStyle?: string;

        // String - Tooltip label font colour
        tooltipFontColor?: string;

        // String - Tooltip title font declaration for the scale label
        tooltipTitleFontFamily?: string;

        // Number - Tooltip title font size in pixels
        tooltipTitleFontSize?: number;

        // String - Tooltip title font weight style
        tooltipTitleFontStyle?: string;

        // String - Tooltip title font colour
        tooltipTitleFontColor?: string;

        // Number - pixel width of padding around tooltip text
        tooltipYPadding?: number;

        // Number - pixel width of padding around tooltip text
        tooltipXPadding?: number;

        // Number - Size of the caret on the tooltip
        tooltipCaretSize?: number;

        // Number - Pixel radius of the tooltip border
        tooltipCornerRadius?: number;

        // Number - Pixel offset from point x to tooltip edge
        tooltipXOffset?: number;

        // String - Template string for single tooltips
        tooltipTemplate?: string;

        // String - Template string for single tooltips
        multiTooltipTemplate?: string;

        // String - Colour behind the legend colour block
        multiTooltipKeyBackground?: string;

        // Function - Will fire on animation progression.
        onAnimationProgress?: () => void;

        // Function - Will fire on animation completion.
        onAnimationComplete?: () => void;

		//String - A legend template
		legendTemplate?: string;
	}

	export class ChartBase {
	    private data;
	    private id: string;
	    ctx: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;
        width: number;
        height: number;
        aspectRatio: number;
        animationFrame: number;
        events: IDictionary<() => void>;
	    activeElements: Element[];
	    datasets: Dataset[];

        constructor(context: CanvasRenderingContext2D, data: any) {
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

		initialize(data?: any): ChartBase {
			return this;
		}

		clear(): ChartBase {
			clear(this);
			return this;
		}

		stop(): ChartBase {
			cancelAnimFrame(this.animationFrame);
			return this;
		}

		resize(callback?: Function, ...args: any[]): ChartBase {
			this.stop();
			var canvas = this.canvas,
				newWidth = getMaximumWidth(canvas),
				newHeight = this.getChartOptions().maintainAspectRatio ? newWidth / this.aspectRatio : getMaximumHeight(canvas);

			canvas.width = this.width = newWidth;
			canvas.height = this.height = newHeight;

			retinaScale(this);

			callback.apply(this, args);
			return this;
		}

		reflow() {
			
		}

		render(reflow?: boolean) {
			if (reflow) {
				this.reflow();
			}
			var options = this.getChartOptions();
			if (options.animation && !reflow) {
				animationLoop(
					this.draw,
					options.animationSteps,
					options.animationEasing,
					options.onAnimationProgress,
					options.onAnimationComplete,
					this);
			} else {
				this.draw(1);
				options.onAnimationComplete.call(this);
			}
			return this;
		}

		generateLegend() {
			return template(this.getChartOptions().legendTemplate, this);
		}

		destroy() {
			this.clear();
			unbindEvents(this, this.events);
			var canvas = this.canvas;
		
			canvas.width = this.width;
			canvas.height = this.height;

			if (canvas.style.removeProperty) {
				canvas.style.removeProperty('width');
				canvas.style.removeProperty('height');
			} else {
				canvas.style.removeAttribute('width');
				canvas.style.removeAttribute('height');
			}

			delete Chart.instances[this.id];
		}

		showTooltip(chartElements: Element[], forceRedraw?: boolean) {
			if (!this.activeElements) this.activeElements = [];

			var isChanged = ((elements: Element[]) => {
				var changed = false;
				if (elements.length !== this.activeElements.length) {
					return true;
				}

				each(elements, (element, index) => {
					if (element !== this.activeElements[index]) {
						changed = true;
					}
				});
				return changed;
			})(chartElements);

			if (!isChanged && !forceRedraw) {
				return;
			} else {
				this.activeElements = chartElements;
			}
			this.draw(1);
			var options = this.getChartOptions();
			if (chartElements.length > 0) {
				if (this.datasets && this.datasets.length) {
					var dataArray: any[],
						dataIndex = 0;
					for (var i = this.datasets.length - 1; i >= 0; i--) {
						dataArray = this.datasets[i].elements;
						dataIndex = dataArray.indexOf(chartElements[0]);
						if (dataIndex !== -1) {
							break;
						}
					}

					var tooltipLabels = [],
						tooltipColors = [],
						medianPosition = ((index: number) => {
							var elements: Element[] = [],
								dataCollection: Element[],
								xPositions: number[] = [],
								yPositions: number[] = [];
							each(this.datasets, (dataset: Dataset) => {
								dataCollection = dataset.elements;
								if (dataCollection[index] && dataCollection[index].hasValue()) {
									elements.push(dataCollection[index]);
								}
							});

							each(elements, (element: Element) => {
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
								x: (xMin > this.width / 2) ? xMin : xMax,
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
				} else {
					each(chartElements, (element: Element) => {
						var tooltipPosition = element.tooltipPosition();
						new Tooltip(this.ctx, {
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
							chart: this
						}).draw();
					});
				}
			}
			return this;
		}

		draw(ease: number) {
			
		}

		toBase64Image(type?: string, ...args: any[]) {
			if (type) {
				return this.canvas.toDataURL.call(this.canvas, [type].concat(args));
			} else {
				return this.canvas.toDataURL.call(this.canvas, args);
			}
		}

		getChartOptions(): IChartOptions {
			throw new Error("Not Implemented");
		}

        public static globalDefaults: IChartOptions;
		private static instances: IDictionary<ChartBase> = {};
	}

    export class Chart<TOptions extends IChartOptions> extends ChartBase {
	    constructor(context: CanvasRenderingContext2D, data: any, options: TOptions, defaults: any) {
	        this.options = <TOptions>merge(options, merge(defaults, Chart.globalDefaults));
		    super(context, data);
	    }

	    options: TOptions;
		getChartOptions(): IChartOptions {
			return this.options;
		}
    }


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
        onAnimationProgress() { },
        onAnimationComplete() { },
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
    }
}

