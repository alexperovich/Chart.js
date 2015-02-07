/*!
 * Chart.js
 * http://chartjs.org/
 * Version: {{ version }}
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 * 
 * Ported to Typescript by Alex Perovich
 * https://github.com/alexperovich/Chart.js
 */
/// <reference path="Chart.Helpers.ts"/>

"use strict";
module ChartJs {
	export interface IElementOptions {
		x?: number;
		y?: number;
		label?: string;
		color?: Color;
		showStroke?: boolean;
		strokeWidth?: number;
		display?: boolean;
	}

	export class Element<T> {
		constructor(chart: ChartHandle, options: IElementOptions) {
			this.ctx = chart.ctx;
			this.chart = chart;
			this.label = options.label;
			this.color = options.color;
			this.showStroke = options.showStroke;
			this.strokeWidth = options.strokeWidth;
			this.display = options.display;
			this.x = options.x;
			this.y = options.y;
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
			return <Element<T>>cloneProperties(this);
		}

		_saved: any;
		x: number;
		y: number;
		value: T;
		ctx: CanvasRenderingContext2D;
		chart: ChartHandle;
		color: Color;
		strokeWidth: number;
		showStroke: boolean;
		display: boolean;
		label: string;

		tooltipPosition(): Point {
			return {
				x: this.x,
				y: this.y
			}
		}
	}

	export interface IChartPointOptions extends IElementOptions {
		radius?: number;
		hitDetectionRadius?: number;
	}

	export class ChartPoint<T> extends Element<T> {
		constructor(chart: ChartHandle, options: IChartPointOptions) {
			this.radius = options.radius;
			this.hitDetectionRadius = options.hitDetectionRadius;
			super(chart, options);
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

				ctx.strokeStyle = this.color.stroke;
				ctx.lineWidth = this.strokeWidth;

				ctx.fillStyle = this.color.fill;

				ctx.fill();
				ctx.stroke();

			}
		}

		radius: number;
		hitDetectionRadius: number;
	}

	export interface IArcOptions extends IElementOptions {
		startAngle?: number;
		endAngle?: number;
		innerRadius?: number;
		outerRadius?: number;
	}

	export class Arc<T> extends Element<T> {
		constructor(chart: ChartHandle, options: IArcOptions) {
			this.startAngle = options.startAngle;
			this.endAngle = options.endAngle;
			this.innerRadius = options.innerRadius;
			this.outerRadius = options.outerRadius;
			super(chart, options);
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
			ctx.strokeStyle = this.color.stroke;
			ctx.lineWidth = this.strokeWidth;

			ctx.fillStyle = this.color.fill;

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

	export interface IRectangleOptions extends IElementOptions {
		width?: number;
		base?: number;
	}

	export class Rectangle<T> extends Element<T> {
		constructor(chart: ChartHandle, options: IRectangleOptions) {
			this.width = options.width;
			this.base = options.base;
			super(chart, options);
		}

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

			ctx.fillStyle = this.color.fill;
			ctx.strokeStyle = this.color.stroke;
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

	export interface ITextElementOptions extends IElementOptions {
		font?: Font;
		text?: string;
		textColor?: string;
	}

	export class TextElement<T> extends Element<T> {
		constructor(chart: ChartHandle, options: ITextElementOptions) {
			this.font = options.font;
			this.text = options.text;
			this.textColor = options.textColor;
			super(chart, options);
			return;
		}
		font: Font;
		text: string;
		textColor: string;
	}

	export interface IToolTipOptions extends ITextElementOptions {
		caretPadding?: number;
		caretHeight?: number;
		cornerRadius?: number;
		xAlign?: string;
		yAlign?: string;
		xPadding?: number;
		yPadding?: number;
	}

	export class ToolTip<T> extends TextElement<T> {
		constructor(chart: ChartHandle, options: IToolTipOptions) {
			this.caretPadding = options.caretPadding;
			this.caretHeight = options.caretHeight;
			this.cornerRadius = options.cornerRadius;
			this.xAlign = options.xAlign;
			this.yAlign = options.yAlign;
			this.xPadding = options.xPadding;
			this.yPadding = options.yPadding;
			super(chart, options);
			return;
		}

		initialize() {
		}

		draw() {
			var ctx = this.ctx;

			ctx.font = this.font.toString();

			this.xAlign = "center";
			this.yAlign = "above";

			//Distance between the actual element.y position and the start of the tooltip caret
			var caretPadding = this.caretPadding = 2;

			var tooltipWidth = ctx.measureText(this.text).width + 2*this.xPadding,
				tooltipRectHeight = this.font.size + 2*this.yPadding,
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

			ctx.fillStyle = this.color.fill;

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
		custom: (tt: ToolTip<T>) => void;
	}

	export interface IMultiToolTipOptions<T> extends ITextElementOptions {
		titleFont?: Font;
		width?: number;
		height?: number;
		yPadding?: number;
		xPadding?: number;
		labels?: string[];
		title?: string;
		titleTextColor?: string;
		xOffset?: number;
		custom?: (tt: MultiToolTip<T>) => void;
		cornerRadius?: number;
		legendColorBackground?: string;
		legendColors?: Color[];
	}

	export class MultiToolTip<T> extends TextElement<T> {
		constructor(chart: ChartHandle, options: IMultiToolTipOptions<T>) {
			this.titleFont = options.titleFont;
			this.width = options.width;
			this.height = options.height;
			this.yPadding = options.yPadding;
			this.xPadding = options.xPadding;
			this.labels = options.labels;
			this.title = options.title;
			this.titleTextColor = options.titleTextColor;
			this.xOffset = options.xOffset;
			this.custom = options.custom;
			this.cornerRadius = options.cornerRadius;
			this.legendColorBackground = options.legendColorBackground;
			this.legendColors = options.legendColors;
			super(chart, options);
			return;
		}

		initialize() {
			this.height = (this.labels.length * this.font.size) + ((this.labels.length - 1) * (this.font.size / 2)) + (this.yPadding * 2) + this.titleFont.size * 1.5;

			this.ctx.font = this.titleFont.toString();

			var titleWidth = this.ctx.measureText(this.title).width,
				//Label has a legend square as well so account for this.
				labelWidth = longestText(this.ctx, this.font, this.labels) + this.font.size + 3,
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
				return baseLineHeight + this.titleFont.size / 2;
			} else {
				return baseLineHeight + ((this.font.size * 1.5 * afterTitleIndex) + this.font.size / 2) + this.titleFont.size * 1.5;
			}
		}

		draw() {
			if (this.custom) {
				this.custom(this);
			} else {
				var ctx = this.ctx;
				drawRoundedRectangle(ctx, this.x, this.y - this.height / 2, this.width, this.height, this.cornerRadius);
				ctx.fillStyle = this.color.fill;
				ctx.fill();
				ctx.closePath();

				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillStyle = this.titleTextColor;
				ctx.font = this.titleFont.toString();

				ctx.fillText(this.title, this.x + this.xPadding, this.getLineHeight(0));

				ctx.font = this.font.toString();
				each(this.labels, (label: string, index: number) => {
					ctx.fillStyle = this.textColor;
					ctx.fillText(label, this.x + this.xPadding + this.font.size + 3, this.getLineHeight(index + 1));

					//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
					//ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
					//Instead we'll make a white filled block to put the legendColour palette over.

					ctx.fillStyle = this.legendColorBackground;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.font.size / 2, this.font.size, this.font.size);

					ctx.fillStyle = this.legendColors[index].fill;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.font.size / 2, this.font.size, this.font.size);


				});
			}
		}

		titleFont: Font;
		width: number;
		height: number;
		yPadding: number;
		xPadding: number;
		labels: string[];
		title: string;
		titleTextColor: string;
		xOffset: number;
		custom: (tt: MultiToolTip<T>) => void;
		cornerRadius: number;
		legendColorBackground: string;
		legendColors: Color[];
	}

	export interface IScaleOptions {
		templateString: string;
		height: number;
		width: number;
		textColor: string;
		valuesCount: number;
		xLabels: string[];
		font: Font;
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

	export class Scale extends Element<void> {
		constructor(chart: ChartHandle, options: IScaleOptions) {
			this.templateString = options.templateString;
			this.height = options.height;
			this.width = options.width;
			this.textColor = options.textColor;
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
			super(chart, options);
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
			this.startPoint = (this.display) ? this.font.size : 0;
			this.endPoint = (this.display) ? this.height - (this.font.size * 1.5) - 5 : this.height; // -5 to pad labels

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

			this.ctx.font = this.font.toString();

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
					if (firstRotated + this.font.size / 2 > this.yLabelWidth + 8) {
						this.xScalePaddingLeft = firstRotated + this.font.size / 2;
					}
					this.xScalePaddingRight = this.font.size / 2;


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
				ctx.font = this.font.toString();
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
					ctx.font = this.font.toString();
					ctx.textAlign = (isRotated) ? "right" : "center";
					ctx.textBaseline = (isRotated) ? "middle" : "top";
					ctx.fillText(label, 0, 0);
					ctx.restore();
				});
			}
		}

		font: Font;
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

	export interface IRadialScaleOptions extends IElementOptions {
		font?: Font;
		fontColor?: string;
		pointLabelFont?: Font;
		pointLabelFontColor?: string;
		width?: number;
		height?: number;
		backdropPaddingX?: number;
		backdropPaddingY?: number;
		backdropColor?: string;
		showLabels?: boolean;
		showLabelBackdrop?: boolean;
		min?: number;
		max?: number;
		stepValue?: number;
		steps?: number;
		lineArc?: boolean;
		yLabels?: string[];
		templateString?: string;
		valuesCount?: number;
		labels?: string[];
		lineWidth?: number;
		lineColor?: string;
		angleLineWidth?: number;
		angleLineColor?: string;
	}

	export class RadialScale extends Element<void> {
		constructor(chart: ChartHandle, options: IRadialScaleOptions) {
			this.font = options.font;
			this.fontColor = options.fontColor;
			this.pointLabelFont = options.pointLabelFont;
			this.pointLabelFontColor = options.pointLabelFontColor;
			this.width = options.width;
			this.height = options.height;
			this.backdropPaddingX = options.backdropPaddingX;
			this.backdropPaddingY = options.backdropPaddingY;
			this.backdropColor = options.backdropColor;
			this.showLabels = options.showLabels;
			this.showLabelBackdrop = options.showLabelBackdrop;
			this.min = options.min;
			this.max = options.max;
			this.stepValue = options.stepValue;
			this.steps = options.steps;
			this.lineArc = options.lineArc;
			this.yLabels = options.yLabels;
			this.templateString = options.templateString;
			this.valuesCount = options.valuesCount;
			this.labels = options.labels;
			this.lineWidth = options.lineWidth;
			this.lineColor = options.lineColor;
			this.angleLineWidth = options.angleLineWidth;
			this.angleLineColor = options.angleLineColor;
			super(chart, options);
		}

		initialize() {
			this.size = min([this.height, this.width]);
			this.drawingArea = (this.display) ? (this.size / 2) - (this.font.size / 2 + this.backdropPaddingY) : (this.size / 2);
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
				this.drawingArea = (this.display) ? (this.size/2) - (this.font.size/2 + this.backdropPaddingY) : (this.size/2);
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
			var largestPossibleRadius = min([(this.height/2 - this.pointLabelFont.size - 5), this.width/2]),
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
			this.ctx.font = this.pointLabelFont.toString();
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
						if(this.showLabels) {
							ctx.font = this.font.toString();
							if (this.showLabelBackdrop){
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = this.backdropColor;
								ctx.fillRect(
									this.xCenter - labelWidth/2 - this.backdropPaddingX,
									yHeight - this.font.size/2 - this.backdropPaddingY,
									labelWidth + this.backdropPaddingX*2,
									this.font.size + this.backdropPaddingY*2
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
						ctx.font = this.pointLabelFont.toString();
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

		font: Font;
		fontColor: string;
		pointLabelFont: Font;
		pointLabelFontColor: string;
		width: number;
		height: number;
		backdropPaddingX: number;
		backdropPaddingY: number;
		backdropColor: string;
		showLabels: boolean;
		showLabelBackdrop: boolean;
		min: number;
		max: number;
		stepValue: number;
		steps: number;
		lineArc: boolean;
		yLabels: string[];
		templateString: string;
		valuesCount: number;
		labels: string[];
		lineWidth: number;
		lineColor: string;
		angleLineWidth: number;
		angleLineColor: string;
		private xCenter: number;
		private yCenter: number;
		private size: number;
		private drawingArea: number;
	}

	export class Dataset<T> {
		elements: Element<T>[];
		color: Color;
		highlightColor: Color;
	}

	export interface IChartDataSet<T> {
		label?: string;
		color: Color;
		highlightColor: Color;
		data: T[];
	}

	export interface IChartData<T> {
		datasets: IChartDataSet<T>[];
		labels: string[];
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

		//Font - The font used for the scale
		scaleFont?: Font;

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

		tooltipColor?: Color;

		tooltipFont?: Font;

        // String - Tooltip label font colour
        tooltipFontColor?: string;

		tooltipTitleFont: Font;

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

	export class ChartHandle {
		constructor(context: CanvasRenderingContext2D) {
			this.ctx = context;
			this.canvas = this.ctx.canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.aspectRatio = this.width / this.height;
	        this.id = uid();
	        ChartHandle.instances[this.id] = this;
		}

		clear(): ChartHandle {
			clear(this);
			return this;
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

	    private id: string;
		ctx: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;
        width: number;
        height: number;
        aspectRatio: number;
		private static instances: IDictionary<ChartHandle> = {};
        events: IDictionary<() => void>;
	}

	export class ChartBase<T> extends ChartHandle {
	    private data: IChartData<T>;
        animationFrame: number;
	    activeElements: Element<T>[];
	    datasets: Dataset<T>[];

        constructor(context: CanvasRenderingContext2D, data: IChartData<T>) {
	        super(context);

	        this.data = data;



			if (this.getChartOptions().responsive) {
				this.resize();
			}
	        this.initialize(data);
            retinaScale(this);
        }

		initialize(data?: IChartData<T>): ChartBase<T> {
			return this;
		}

		stop(): ChartBase<T> {
			cancelAnimFrame(this.animationFrame);
			return this;
		}

		resize(callback?: Function, ...args: any[]): ChartBase<T> {
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

		showTooltip(chartElements: Element<T>[], forceRedraw?: boolean) {
			if (!this.activeElements) this.activeElements = [];

			var isChanged = ((elements: Element<T>[]) => {
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
							var elements: Element<T>[] = [],
								dataCollection: Element<T>[],
								xPositions: number[] = [],
								yPositions: number[] = [];
							each(this.datasets, (dataset: Dataset<T>) => {
								dataCollection = dataset.elements;
								if (dataCollection[index] && dataCollection[index].hasValue()) {
									elements.push(dataCollection[index]);
								}
							});

							each(elements, (element: Element<T>) => {
								xPositions.push(element.x);
								yPositions.push(element.y);

								tooltipLabels.push(template(options.multiTooltipTemplate, element));
								tooltipColors.push({
									fill: element.color.fill,
									stroke: element.color.stroke
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
					new MultiToolTip(this, {
						x: medianPosition.x,
						y: medianPosition.y,
						xPadding: options.tooltipXPadding,
						yPadding: options.tooltipYPadding,
						xOffset: options.tooltipXOffset,
						color: options.tooltipColor,
						textColor: options.tooltipFontColor,
						font: options.tooltipFont,
						titleTextColor: options.tooltipTitleFontColor,
						titleFont: options.tooltipTitleFont,
						cornerRadius: options.tooltipCornerRadius,
						labels: tooltipLabels,
						legendColors: tooltipColors,
						legendColorBackground: options.multiTooltipKeyBackground,
						title: chartElements[0].label,
						chart: this
					}).draw();
				} else {
					each(chartElements, (element: Element<T>) => {
						var tooltipPosition = element.tooltipPosition();
						new ToolTip(this, {
							x: Math.round(tooltipPosition.x),
							y: Math.round(tooltipPosition.y),
							xPadding: options.tooltipXPadding,
							yPadding: options.tooltipYPadding,
							color: options.tooltipColor,
							textColor: options.tooltipFontColor,
							font: options.tooltipFont,
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

	}

    export class Chart<TValue, TOptions extends IChartOptions> extends ChartBase<TValue> {
	    constructor(context: CanvasRenderingContext2D, data: IChartData<TValue>, options: TOptions, defaults: any) {
	        this.options = <TOptions>merge(options, merge(defaults, Chart.globalDefaults));
		    super(context, data);
	    }

	    options: TOptions;
		getChartOptions(): IChartOptions {
			return this.options;
		}
        public static globalDefaults: IChartOptions;
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
		scaleFont: {
			family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			size: 12,
			style: "normal"
		},
        scaleFontColor: "#666",
        responsive: false,
        maintainAspectRatio: true,
        showTooltips: true,
        customTooltips: false,
        tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],
        tooltipFillColor: "rgba(0,0,0,0.8)",
		tooltipColor: {
			fill: "rgba(0,0,0,0.8)",
			stroke: "rgba(0,0,0,1)"
		},
		tooltipFont: {
			family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			size: 14,
			style: "normal"
		},
        tooltipFontColor: "#fff",
		tooltipTitleFont: {
			family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			size: 14,
			style: "bold",
		},
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

