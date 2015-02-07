/// <reference path="Chart.Core.ts"/>

module ChartJs {
	var defaultConfig = {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero: true,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines: true,

		//String - Colour of the grid lines
		scaleGridLineColor: "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth: 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - If there is a stroke on each bar
		barShowStroke: true,

		//Number - Pixel width of the bar stroke
		barStrokeWidth: 2,

		//Number - Spacing between each of the X value sets
		barValueSpacing: 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing: 1,

		//String - A legend template
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	};

	export interface IBarScaleOptions extends IScaleOptions {
		barDatasetSpacing: number;
		barValueSpacing: number;
		scaleOverride: boolean;
		steps: number;
		stepValue: number;
		min: number;
		max: number;
		beginAtZero: boolean;
		integersOnly: boolean;
		dataTotal: () => any[];
	}

	export class BarScale extends Scale {
		constructor(ctx: CanvasRenderingContext2D, options: IBarScaleOptions) {
			this.offsetGridLines = true;
			this.barDatasetSpacing = options.barDatasetSpacing;
			this.barValueSpacing = options.barValueSpacing;
			this.scaleOverride = options.scaleOverride;
			if (options.scaleOverride) {
				this.steps = options.steps;
				this.stepValue = options.stepValue;
				this.min = options.min;
				this.max = options.max;
			}

			this.beginAtZero = options.beginAtZero;
			this.integersOnly = options.integersOnly;
			this.dataTotal = options.dataTotal;
			super(ctx, options);
		}

		calculateBarX(datasetCount: number, datasetIndex: number, barIndex: number) {
			//Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
			var xWidth = this.calculateBaseWidth(),
				xAbsolute = this.calculateX(barIndex) - (xWidth / 2),
				barWidth = this.calculateBarWidth(datasetCount);

			return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * this.barDatasetSpacing) + barWidth / 2;
		}

		calculateBaseWidth() {
			return (this.calculateX(1) - this.calculateX(0)) - (2 * this.barValueSpacing);
		}

		calculateBarWidth(datasetCount: number) {
			//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
			var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * this.barDatasetSpacing);

			return (baseWidth / datasetCount);
		}

		calculateYRange(currentHeight: number) {
			if (!this.scaleOverride) {
				var updatedRanges = calculateScaleRange(
					this.dataTotal(),
					currentHeight,
					this.fontSize,
					this.beginAtZero,
					this.integersOnly
				);
				this.min = updatedRanges.min;
				this.max = updatedRanges.max;
				this.stepValue = updatedRanges.stepValue;
				this.steps = updatedRanges.steps;
			}
		}

		dataTotal: () => any[];
		barDatasetSpacing: number;
		barValueSpacing: number;
		beginAtZero: boolean;
		integersOnly: boolean;
		scaleOverride: boolean;
	}

	export interface IBarElementOptions {
		strokeWidth: number;
		showStroke: boolean;
		highlightFill: string;
		highlightStroke: string;
	}

	export class BarElement extends Rectangle {
		constructor(ctx: CanvasRenderingContext2D, barChart: BarChart, options: IBarElementOptions) {
			super(ctx, options);
			this.strokeWidth = options.strokeWidth;
			this.showStroke = options.showStroke;
			this.highlightFill = options.highlightFill;
			this.highlightStroke = options.highlightStroke;
		}

		datasetLabel: string;
		highlightFill: string;
		highlightStroke: string;
	}

	export interface IBarChartOptions extends IChartOptions {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero: boolean;

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines: boolean;

		//String - Colour of the grid lines
		scaleGridLineColor: string;

		//Number - Width of the grid lines
		scaleGridLineWidth: number;

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: boolean;

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: boolean;

		//Boolean - If there is a stroke on each bar
		barShowStroke: boolean;

		//Number - Pixel width of the bar stroke
		barStrokeWidth: number;

		//Number - Spacing between each of the X value sets
		barValueSpacing: number;

		//Number - Spacing between data sets within X values
		barDatasetSpacing: number;
	}

	export class BarChart extends Chart<IBarChartOptions> {
		constructor(context: CanvasRenderingContext2D, data: any, options: IBarChartOptions) {
			super(context, data, options, defaultConfig);
		}

		initialize(data?: any): Chart<IBarChartOptions> {
			this.datasets = [];

			if (this.options.showTooltips) {
				bindEvents(this, this.options.tooltipEvents, (evt) => {
					var activeBars = (evt.type !== "mouseout") ? this.getBarsAtEvent(evt) : [];
					this.eachBars((bar: Element) => {
						bar.restore(["fillColor", "strokeColor"]);
					});
					each(<BarElement[]>activeBars, (activeBar: BarElement) => {
						activeBar.fillColor = activeBar.highlightFill;
						activeBar.strokeColor = activeBar.highlightStroke;
					});
					this.showTooltip(activeBars);
				});
			}

			each(data.datasets, (dataset: any, index: number) => {
				var datasetObject: Dataset = {
					label: dataset.label || null,
					color: {
						fill: dataset.fillColor,
						stroke: dataset.strokeColor
					},
					highlightColor: {
						fill: dataset.highlightFill,
						stroke: dataset.highlightStroke
					},
					elements: []
				};

				this.datasets.push(datasetObject);

				each(dataset.data, (dataPoint, index: number) => {
					var element = new BarElement(this.ctx, this, {
						strokeColor: dataset.strokeColor,
						fillColor: dataset.fillColor,
						highlightFill: dataset.highlightFill || dataset.fillColor,
						highlightStroke: dataset.highlightStroke || dataset.strokeColor,
						strokeWidth: this.options.barStrokeWidth,
						showStroke: this.options.barShowStroke
					});
					element.value = dataPoint;
					element.label = data.labels[index];
					element.datasetLabel = dataset.label;
					datasetObject.elements.push(element);
				});
			});

			this.buildScale(data.labels);

			this.eachBars((bar, index, datasetIndex) => {
				bar.width = this.scale.calculateBarWidth(this.datasets.length);
				bar.x = this.scale.calculateBarX(this.datasets.length, datasetIndex, index);
				bar.y = this.scale.endPoint;
				bar.save();
			});

			this.render();
			return this;
		}

		update() {
			this.scale.update();

			each(this.activeElements, (activeElement: Element) => {
				activeElement.restore(["fillColor", "strokeColor"]);
			});

			this.eachBars((bar) => {
				bar.save();
			});
			this.render();
		}

		eachBars(callback) {
			each(this.datasets, (dataset, index) => {
				each(dataset.elements, callback, index);
			});
		}

		getBarsAtEvent(evt): Element[] {
			var barIndex;
			var barsArray = [],
				eventPosition = getRelativePosition(evt),
				datasetIterator = (dataset) => {
					barsArray.push(dataset.bars[barIndex]);
				};

			for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
				for (barIndex = 0; barIndex < this.datasets[datasetIndex].elements.length; barIndex++) {
					if (this.datasets[datasetIndex].elements[barIndex].inRange(eventPosition.x,eventPosition.y)){
						each(this.datasets, datasetIterator);
						return barsArray;
					}
				}
			}

			return barsArray;
		}

		buildScale(labels: string[]) {

			var dataTotal =() => {
				var values = [];
				this.eachBars((bar) => {
					values.push(bar.value);
				});
				return values;
			};

			var scaleOptions: IBarScaleOptions = {
				barDatasetSpacing: this.options.barDatasetSpacing,
				barValueSpacing: this.options.barValueSpacing,
				templateString: this.options.scaleLabel,
				height: this.height,
				width: this.width,
				textColor: this.options.scaleFontColor,
				fontSize: this.options.scaleFontSize,
				fontStyle: this.options.scaleFontStyle,
				fontFamily: this.options.scaleFontFamily,
				valuesCount: labels.length,
				beginAtZero: this.options.scaleBeginAtZero,
				integersOnly: this.options.scaleIntegersOnly,
				dataTotal: dataTotal,
				xLabels : labels,
				font : fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding : (this.options.showScale) ? 0 : (this.options.barShowStroke) ? this.options.barStrokeWidth : 0,
				showLabels : this.options.scaleShowLabels,
				display: this.options.showScale,
				scaleOverride: this.options.scaleOverride,
				steps: this.options.scaleSteps,
				stepValue: this.options.scaleStepWidth,
				min: this.options.scaleStartValue,
				max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
			};

			this.scale = new BarScale(this.ctx, scaleOptions);
		}

		addData(values: any[], label: string) {
			//Map the values array for each of the datasets
			each(values, (value,index) => {
				//Add a new point for each piece of data, passing any required data to draw.
				var element = new BarElement(this.ctx, this, {
					strokeColor: this.datasets[index].color.stroke,
					fillColor: this.datasets[index].color.fill,
					highlightFill: this.datasets[index].highlightColor.fill,
					highlightStroke: this.datasets[index].highlightColor.stroke,
					strokeWidth: this.options.barStrokeWidth,
					showStroke: this.options.barShowStroke
				});
				element.value = value;
				element.label = label;
				element.x = this.scale.calculateBarX(this.datasets.length, index, this.scale.valuesCount + 1);
				element.y = this.scale.endPoint;
				element.width = this.scale.calculateBarWidth(this.datasets.length);
				this.datasets[index].elements.push(element);
			});

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		}

		removeData() {
			this.scale.removeXLabel();
			each(this.datasets, (dataset: Dataset) => {
				dataset.elements.shift();
			});
			this.update();
		}

		reflow() {
			var newScaleProps = {
				height: this.height,
				width: this.width
			};
			this.scale.update(newScaleProps);
		}

		draw(ease: number) {
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.ctx;

			this.scale.draw(easingDecimal);

			//Draw all the bars for each dataset
			each(this.datasets,(dataset: Dataset, index: number) => {
				each(dataset.elements, (element: BarElement, elementIndex: number) => {
					if (element.hasValue()){
						element.base = this.scale.endPoint;
						//Transition then draw
						element.transition({
							x : this.scale.calculateBarX(this.datasets.length, index, elementIndex),
							y : this.scale.calculateY(element.value),
							width : this.scale.calculateBarWidth(this.datasets.length)
						}, easingDecimal).draw();
					}
				});

			});
		}

		scale: BarScale;
	}
}