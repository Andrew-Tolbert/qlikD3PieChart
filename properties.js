define(["./libraries/contents"], function () {
    'use strict';
      var lblFont = {
    ref: "props.label.size",
    label: "Label Font Size (px)",
    type: "integer",
    defaultValue: 14,
    expression: "optional",
  };

  var lblFontColor = {
    type: "items",
    label: "Label Font Color",
    items: {
        barColours: {
            ref: "props.label.fontColor",
            label: "Colors",
            component: "color-picker",
            type: "object",
            defaultValue: {
                index: 4,
                color: "#4477aa"
            }
            }
        }
    };
  
  var strokeWidth = {
    ref: "props.donut.strokeSize",
    label: "Outline Size (px)",
    type: "string",
    defaultValue: "1",
    expression: "optional",
  };

  var strokeColor = {
    type: "items",
    label: "Outline Color",
    items: {
        barColours: {
            ref: "props.donut.strokeColor",
            label: "Colors",
            component: "color-picker",
            type: "object",
            defaultValue: {
                index: 4,
                color: "#4477aa"
            }
            }
        }
    };
  
var chartSize = {
    type: "number",
    component: "slider",
    label: "Donut Size",
    ref: "props.donut.size",
    min: 1,
    max: 100,
    step: 1,
    defaultValue: 100,
  };

  var innerRadius = {
    type: "number",
    label: "Inner Radius (0 - 100)",
    ref: "props.donut.innerRadius",
    defaultValue: "66.7",
    min: 0,
    max: 99,
  };

  var colorPicker = {
        type: "string",
        component: "dropdown",
        label: "Colors",
        ref: "colors",
        options: content_options,
        defaultValue: 1
};

    return {
        type: "items",
        component: "accordion",
        items: {
            dimensions: {
                uses: "dimensions",
                min: 1,
                max: 1
            },
            measures: {
                uses: "measures",
                min: 1,
                max: 1
            },
            sorting: {
                uses: "sorting"
            },
            appearance: {
                uses: "settings",
                items: {
                  lblFont: lblFont,
                  lblFontColor: lblFontColor,
                  chartSize: chartSize,
                  ChartDropDown: colorPicker,
                  strokeWidth: strokeWidth,
                  strokeColor: strokeColor,
                  innerRadius: innerRadius,
                },
            },
        }
    };
});