/* jshint strict: false */
/* globals $, c3, d3 */
$(function() {
  $('.savePNG').on('click',function(e){
    e.preventDefault();
    createChartImages();
  });
    var maxHours = 5 * 24;
    var avgOutageRange = 4000; // avg diff btw outage max/min
    var maxOutages = 40000; // state of CA for example
    var randomScalingFactor = function() {
      var factor = Math.random() > 0.95 ? maxOutages : avgOutageRange;
      return Math.round(Math.random() * factor);
    };
    var labels = ['x'];
    var values = ['Outages'];
    var items = [];
    for (var i = 0; i < maxHours; i++) {
      var itemDate = new Date(2015, 2, 3, 15);
      var item = {
        datetime: new Date(itemDate.setHours(itemDate.getHours() + i)),
        outages: randomScalingFactor()
      };
      items.push(item);
      // labels.push(item.datetime.toLocaleDateString() + ' ' + item.datetime.toLocaleTimeString());
      labels.push(item.datetime.getFullYear() + '-' + (item.datetime.getMonth() + 1) + '-' + item.datetime.getDate() + ' ' + item.datetime.getHours() + ':00');
      values.push(item.outages);
    }
    console.log(labels);
    console.log(values);

    window.chart = c3.generate({
        data: {
            x: 'x',
            xFormat: '%Y-%m-%d %H:%M',
            columns: [
                labels,
                values
              // ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
              // ['data1', 30, 200, 100, 400, 150, 250]
            ]
        },
        point: {
            show: false
        },
        axis: {
            // this doesnt' work, why?
            // x: {
            //     show: false
            // }
            x: {
                type: 'timeseries',
                tick: {
                    // values: ['2015-3-3 15:00', '2015-3-8 00:00'],
                    // count is better than culling and values
                    count: 3,
                    // padding does not work
                    // padding: {
                    //     right: 86400000 / 4
                    // },
                    // have to rotate so right label is not cut off
                    rotate: 90,
                    multiline: false,
                    // NOTE: this is the same format used in tooltip
                    // unless it's overwritten below
                    format: '%m/%d %Hh'
                },
                // used for rotated axis
                height: 60
            }
        },
        grid: {
          y: {
            show: true
          }
        },
        tooltip: {
            format: {
                // title: function (d) {
                //     TODO: optionally override date format in tooltip title
                // },
                // show thousands comma in outage counts
                value: function (value/*, ratio, id*/) {
                    var format = d3.format(',');
                    return format(value);
                }
            }
        }
    });

   var styles;
   var createChartImages = function() {
       // Zoom! Enhance!
       // $('#chart > svg').attr('transform', 'scale(2)');

       // Remove all defs, which botch PNG output
       $('defs').remove();
       // Copy CSS styles to Canvas
       inlineAllStyles();
       // Create PNG image
       var canvas = $('#canvas').empty()[0];
       canvas.width = $('#chart').width() * 2;
       canvas.height = $('#chart').height() * 2;

       var canvasContext = canvas.getContext('2d');
       var svg = $.trim($('#chart > svg')[0].outerHTML);
       canvasContext.drawSvg(svg, 0, 0);
       $(".savePNG").attr("href", canvas.toDataURL("png"))
           .attr("download", function() {
               return "_llamacharts.png";
           });

   };
   var inlineAllStyles = function() {
       var chartStyle, selector;
       // Get rules from c3.css
       for (var i = 0; i <= document.styleSheets.length - 1; i++) {
           if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf('c3.css') !== -1) {
               if (document.styleSheets[i].rules !== undefined) {
                   chartStyle = document.styleSheets[i].rules;
               } else {
                   chartStyle = document.styleSheets[i].cssRules;
               }
           }

       }
       if (chartStyle !== null && chartStyle !== undefined) {
           // SVG doesn't use CSS visibility and opacity is an attribute, not a style property. Change hidden stuff to "display: none"
           var changeToDisplay = function() {
               if ($(this).css('visibility') === 'hidden' || $(this).css('opacity') === '0') {
                   $(this).css('display', 'none');
               }
           };
           // Inline apply all the CSS rules as inline
           for (i = 0; i < chartStyle.length; i++) {

               if (chartStyle[i].type === 1) {
                   selector = chartStyle[i].selectorText;
                   styles = makeStyleObject(chartStyle[i]);
                   $('svg *').each(changeToDisplay);
                   // $(selector).hide();
                   $(selector).not($('.c3-chart path')).css(styles);
               }
               $('.c3-chart path')
                   .filter(function() {
                       return $(this).css('fill') === 'none';
                   })
                   .attr('fill', 'none');

               $('.c3-chart path')
                   .filter(function() {
                       return !$(this).css('fill') === 'none';
                   })
                   .attr('fill', function() {
                       return $(this).css('fill');
                   });
           }
       }
   };
   // Create an object containing all the CSS styles.
   // TODO move into inlineAllStyles
   var makeStyleObject = function(rule) {
       var styleDec = rule.style;
       var output = {};
       var s;
       for (s = 0; s < styleDec.length; s++) {
           output[styleDec[s]] = styleDec[styleDec[s]];
       }
       return output;
   };

});
