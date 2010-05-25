/*jslint onevar: true, browser: true, nomen: false, white: false, undef: true, eqeqeq: true, plusplus: false, bitwise: false, immed: true */

// emile.js (c) 2009 Thomas Fuchs
// Licensed under the terms of the MIT license.

(function(emile, container){

	var parseEl = document.createElement('div'),
		props = ['backgroundColor','borderBottomColor','borderBottomWidth','borderLeftColor','borderLeftWidth',
			'borderRightColor','borderRightWidth','borderSpacing','borderTopColor','borderTopWidth','bottom','color','fontSize',
			'fontWeight','height','left','letterSpacing','lineHeight','marginBottom','marginLeft','marginRight','marginTop','maxHeight',
			'maxWidth','minHeight','minWidth','opacity','outlineColor','outlineOffset','outlineWidth','paddingBottom','paddingLeft',
			'paddingRight','paddingTop','right','textIndent','top','width','wordSpacing','zIndex'];

	function interpolate(source,target,pos) {
		return (source + (target - source) * pos).toFixed(3);
	}

	function substr(str, pos, len) {
		return str.substr(pos, len || 1);
	}

	function color(source,target,pos) {
		var i = 2,
			j, arg, tmp,
			v = [], r = [];

		//while (i--) {
			//j = 3;
			//arg = arguments[i];

		while (j = 3, arg = arguments[i - 1], i--) {
			if (substr(arg, 0) === 'r') {
				arg = arg.match(/\d+/g);
				while (j--) {
					v.push(~~arg[j]);
				}
			} else {
				if (arg.length === 4) {
					tmp = {
						r : substr(arg, 1),
						g : substr(arg, 2),
						b : substr(arg, 3)
					};
					arg = '#' + tmp.r + tmp.r + tmp.g + tmp.g + tmp.b + tmp.b;
				}
				while (j--) {
					v.push(parseInt(substr(arg, 1 + j * 2, 2), 16));
				}
			}
		}

		while (j--) {
			tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
			r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
		}

		return 'rgb(' + r.join(',') + ')';
	}

	function parse(prop) {
		var p = parseFloat(prop),
			q = prop.replace(/^[\-\d\.]+/,'');
		return isNaN(p) ? { v: q, f: color, u: ''} : { v: p, f: interpolate, u: q };
	}

	function normalize(style) {
		var css, v,
			rules = {},
			i = props.length;

		parseEl.innerHTML = '<div style="' + style + '"></div>';
		css = parseEl.childNodes[0].style;

		while(i--) {
			/*! TODO - LINT: Expected a conditional expression and instead saw an assignment. (char 19) !*/
			if (v = css[props[i]]) { /*! lint !*/
				rules[props[i]] = parse(v);
			}
		}

		return rules;
	}  

	container[emile] = function (el, style, opts, after) {
		el = typeof el === 'string' ? document.getElementById(el) : el;
		opts = opts || {};

		var prop, interval,
			target = normalize(style),
			comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
			easing = opts.easing || function (pos) { return -Math.cos(pos * Math.PI) / 2 + 0.5; },
			current = {},
			start = +new Date(),
			dur = opts.duration || 200,
			finish = start + dur;

		/*! TODO - LINT: The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype. (char 9) !*/
		for (prop in target) { /*! lint !*/
			current[prop] = parse(comp[prop]);
		}

		interval = setInterval(function () {
				var time = +new Date(),
					pos = time > finish ? 1 : (time - start) / dur,
					prop;

				/*! TODO - LINT: The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype. (char 17) !*/
				for (prop in target) { /*! lint !*/
					el.style[prop] = target[prop].f(current[prop].v, target[prop].v, easing(pos)) + target[prop].u;
				}

				if (time > finish) {
					clearInterval(interval);
					if (opts.after) {
						opts.after();
					}
					if (after) {
						setTimeout(after, 1);
					}
				}
			}, 10);
	};

}('emile', this));
