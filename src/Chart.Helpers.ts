/// <reference path="rgbcolor.ts"/>

"use strict";
module ChartJs {
    export interface ILoopable<T> {
        [index: number]: T;
        length: number;
    }

	export class Color {
		constructor(fill: string, stroke: string) {
			this.fill = fill;
			this.stroke = stroke;
		}
		fill: string;
		stroke: string;
	}

    function getRgbFromColor(color: string): number[] {
    	return new RgbColor(color).toArray();
    }

    function calcGradient(position: number, begin: string, end: string) {
    	var beginColor = getRgbFromColor(begin);
    	var endColor = getRgbFromColor(end);
    	return getStepColor(beginColor, endColor, position);
    }

    function rgbToString(rgb: number[]): string {
    	return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    }

    function getStepColor(colorA: number[], colorB: number[], value: number) {
    	return rgbToString(colorA.map((color, i) => (color + value * (colorB[i] - color)) & 255));
    }

    export class ColorGradient {
        constructor(begin: string, end: string) {
            this.begin = begin;
            this.end = end;
        }

        getPositionValue(position: number): string {
            return calcGradient(position, this.begin, this.end);
        }

        begin: string;
        end: string;
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
    export function uid() {
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

	export interface IEasingEffect {
		(t: number): number;
	}

	export class EasingEffects {
		static linear: IEasingEffect = (t) => t;
            static easeInQuad: IEasingEffect = (t) => t * t;
            static easeOutQuad: IEasingEffect = (t) => -1 * t * (t - 2);
            static easeInOutQuad: IEasingEffect = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
                return -1 / 2 * ((--t) * (t - 2) - 1);
            }

            static easeInCubic: IEasingEffect = (t) => t * t * t;
            static easeOutCubic: IEasingEffect = (t) => 1 * ((t = t / 1 - 1) * t * t + 1);
            static easeInOutCubic: IEasingEffect = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
                return 1 / 2 * ((t -= 2) * t * t + 2);
            };

            static easeInQuart: IEasingEffect = (t) => t * t * t * t;
            static easeOutQuart: IEasingEffect = (t) => -1 * ((t = t / 1 - 1) * t * t * t - 1);
            static easeInOutQuart: IEasingEffect = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
                return -1 / 2 * ((t -= 2) * t * t * t - 2);
            };

            static easeInQuint: IEasingEffect = (t) => 1 * (t /= 1) * t * t * t * t;
            static easeOutQuint: IEasingEffect = (t) => 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
            static easeInOutQuint: IEasingEffect = (t) => {
                if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
                return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
            };

            static easeInSine: IEasingEffect = (t) => -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
            static easeOutSine: IEasingEffect = (t) => 1 * Math.sin(t / 1 * (Math.PI / 2));
            static easeInOutSine: IEasingEffect = (t) => {
                return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
            };

            static easeInExpo: IEasingEffect = (t) => (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
            static easeOutExpo: IEasingEffect = (t) => (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
            static easeInOutExpo: IEasingEffect = (t) => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
                return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
            };

            static easeInCirc: IEasingEffect = (t) => {
                if (t >= 1) return t;
                return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
            };
            static easeOutCirc: IEasingEffect = (t) => {
                return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
            };
            static easeInOutCirc: IEasingEffect = (t) => {
                if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
                return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
            };

            static easeInElastic: IEasingEffect = (t) => {
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
            static easeOutElastic: IEasingEffect = (t) => {
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
            static easeInOutElastic: IEasingEffect = (t) => {
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

            static easeInBack: IEasingEffect = (t) => {
                var s = 1.70158;
                return 1 * (t /= 1) * t * ((s + 1) * t - s);
            };
            static easeOutBack: IEasingEffect = (t) => {
                var s = 1.70158;
                return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
            };
            static easeInOutBack: IEasingEffect = (t) => {
                var s = 1.70158;
                if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
                return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
            };

            static easeInBounce: IEasingEffect = (t) => {
                return 1 - EasingEffects.easeOutBounce(1 - t);
            }
            static easeOutBounce: IEasingEffect = (t) => {
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
            static easeInOutBounce: IEasingEffect = (t) => {
                if (t < 1 / 2) return EasingEffects.easeInBounce(t * 2) * 0.5;
                return EasingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
            };
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

    export function animationLoop<T>(
        callback: (easeDecimal: number, stepDecimal: number, currentStep: number) => void,
        totalSteps: number,
        easingString: string,
        onProgress: (easeDecimal: number, stepDecimal: number) => void,
        onComplete: () => void,
        chartInstance: ChartBase<T>) {
        var currentStep = 0,
            easingFunction = EasingEffects[easingString] || EasingEffects["linear"];

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

    export function bindEvents(chartInstance: ChartHandle, events: string[], handler: EventListener) {
        if (!chartInstance.events) chartInstance.events = {};

        each(events, (eventName) => {
            chartInstance.events[eventName] = () => {
                handler.apply(chartInstance, arguments);
            };
            addEvent(chartInstance.canvas, eventName, chartInstance.events[eventName]);
        });
    }

    export function unbindEvents(chartInstance: ChartHandle, events: IDictionary<() => void>) {
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

    export function retinaScale(chart: ChartHandle) {
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

    export function clear(chart: ChartHandle) {
        chart.ctx.clearRect(0, 0, chart.width, chart.height);
    }

	export class Font {
		family: string;
		style: string;
		size: number;

		constructor(size: number, style: string, family: string) {
			this.family = family;
			this.style = style;
			this.size = size;
		}

		toString() {
			return this.style + " " + this.size + "px " + this.family;
		}
	}

    export function longestText(ctx: CanvasRenderingContext2D, font: Font, strings: string[]) {
        ctx.font = font.toString();
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
}