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

export module ChartJs {
	interface ILoopable<T> {
		[index: number]: T;
		length: number;
	}

	interface ICloneable {
		clone(): any;
	}

	export interface IDictionary<T> {
		[key: string]: T;
	}

	function clone<T extends ICloneable>(value: T): T {
		return value.clone();
	}

	function each<T, TThis>(loopable: ILoopable<T>, callback: (t: T) => void, self?: TThis) {
		if (loopable) {
			var i;
			for (i = 0; i < loopable.length; i++) {
				callback.apply(self, [loopable[i], i]);
			}
		}
	}

	function where<T>(collection: ILoopable<T>, predicate: (value: T) => boolean): T[] {
		var filtered: T[] = [];
		each(collection, (item: T) => {
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

	function max(...array: number[]): number {
		return Math.max.apply(Math, array);
	}

	function min(...array: number[]): number {
		return Math.min.apply(Math, array);
	}

	function clamp(value: number, minValue: number, maxValue: number) {
		return max(min(value, maxValue), minValue);
	}

	function getDecimalPlaces(num: number) {
		if (num % 1 !== 0 && isNumber(num)) {
			return num.toString().split(".")[1].length;
		} else {
			return 0;
		}
	}
	
	function retinaScale(chart: Chart) {

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

		constructor(context: CanvasRenderingContext2D) {
			this.canvas = context.canvas;
			this.ctx = context;
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.aspectRatio = this.width / this.height;
			retinaScale(this);
		}

		public static defaults: IDictionary<ChartSettings> = {}
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
		onAnimationProgress() {},
		onAnimationComplete() {}
	}
}

