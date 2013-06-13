/*
* Range Slider
* Custom-styled native inputs/buttons.
*
* Copyright (c) 2012 Filament Group, Inc.
* Licensed under the MIT, GPL licenses.
*/

(function( $ ) {
	var pluginName = "range",
		initSelector = "." + pluginName,
		methods = {
			_create: function(){
				return $( initSelector ).each(function() {
					var init = $( this ).data( "init" + pluginName ),
						dual = ( this.getAttribute( "class" ) && this.getAttribute( "class" ).indexOf( "mode-double" ) > -1 ),
						parent = (!!this.getAttribute("data-parent"))? this.getAttribute("data-parent"):false;

					if( init ) {
						return false;
					}
					$.extend( this, {
						dual:dual,
						parentSlider:parent
					});
					$( this )
						.data( "init"+ pluginName, true )
						.trigger( "beforecreate." + pluginName )
						.addClass( pluginName + "-enhanced" )
						[ pluginName ]( "_init" )
						.trigger( "create." + pluginName );
				});
			},
			_init: function(){
				var el = $( this );
					this.title = "Please use a numeric value between " + ( this.min || 0 ) + " and " + ( this.max || 100 );

					el[ pluginName ]( "_createSlider" );

					if( this.dual ){
						el[ pluginName ]( "_createDualSlider" );
					}
					el
						[ pluginName ]( "_bindThumbEvents" )
						[ pluginName ]( "_bindSliderEvents" )
						[ pluginName ]( "_bindInputEvents" );

					if( !!this.parentSlider ){
						el[ pluginName ]( "_bindParentEvents" );
					}
					el
						[ pluginName ]( "_bindTouchEvents" )
						[ pluginName ]( "_bindHighlightEvents" );



			},
			_createDualSlider: function(){
				var parentHighlight,
					thumb2 = document.createElement( "div" ),
					highlight = document.createElement( "div" ),
					firstInput = $( this ).find( "input, select" )[ 0 ],
					secondInput = $( this ).find( "input, select" )[ 1 ],
					isSelect = ( firstInput.tagName === "SELECT" ),
					minSpan = (!!this.getAttribute("data-minSpan"))? parseInt( this.getAttribute("data-minSpan"), 10 ):0;

				thumb2.setAttribute( "tabindex", 1 );
				thumb2.setAttribute( "class", "slider-thumb" );
				highlight.setAttribute( "tabindex", 1 );
				highlight.setAttribute( "class", "slider-highlight" );


				if( this.parentSlider ){
					parentHighlight = document.createElement("div");

					parentHighlight.setAttribute("class","slider-highlight slider-avail");
					this.slider.appendChild( parentHighlight );
				}

				this.slider.appendChild( thumb2 );
				this.slider.appendChild( highlight );

				$.extend( this, {
					thumb2: thumb2,
					highlight: highlight,
					firstInput: firstInput,
					secondInput: secondInput,
					parent: parent,
					minSpan: minSpan * this.step,
					parentHighlight: parentHighlight
				});
				$( this )[ pluginName ]( "_moveHandle", this.thumb, $( firstInput ).val(), true )[ pluginName ]( "_moveHandle", thumb2, $( secondInput ).val() );
				if( this.parentSlider ){
					$( this )[ pluginName ]( "_updateParentHighlight" );
				}
			},
			_createSlider: function(){
				var thumb = document.createElement( "div" ),
					slider = document.createElement( "div" ),
					firstInput = ( this.dual )? $( this ).find( "input, select" )[ 0 ]:this,
					isSelect = ( firstInput.tagName === "SELECT" ),
					min = ( isSelect || !(!!firstInput.min)  )? 0: firstInput.min,
					max = ( isSelect )? ( firstInput.options.length-1 ): (!!firstInput.max)? firstInput.max: 100,
					step = ( isSelect || !(!!firstInput.step) )? 1: firstInput.step,
					span = ( max - min),
					steps =  span / step,
					stepSize = 100 / parseInt( steps, 10);
				if( this.value === "" ){
					$( this ).val( min );
				}
				if( $( this ).attr("type") === "range" ){
					$( this ).attr("type", "number");
				}
				thumb.setAttribute( "tabindex", 1 );
				thumb.setAttribute( "class", "slider-thumb" );

				slider.setAttribute( "class", "slider" );
				slider.appendChild( thumb );

				this.parentNode.insertBefore( slider, this );

				$.extend( this, {
					thumb: thumb,
					slider: slider,
					firstInput: firstInput,
					isSelect: isSelect,
					min: parseInt( min, 10 ),
					max: parseInt( max, 10 ),
					step: parseInt( step, 10 ),
					span: parseInt( span, 10 ),
					steps: parseInt( steps, 10 ),
					stepSize: stepSize
				});
				if( isSelect ){
					$( this )[ pluginName ]( "_buildDict" );
				}
				if( !this.dual ){
					$( this )[ pluginName ]( "_moveHandle", thumb, $( this ).val() );
				}
				this.sCW = this.slider.clientWidth;
				this.cW = this.clientWidth;
			},
			_moveHandle: function( thumb, value, skip ){
				var percent = $( this )[pluginName]( "_valueToPercent", value );
				thumb.style.left = percent + "%";
				thumb.style.marginLeft = "-" + Math.round( thumb.offsetWidth * ( percent * 0.01 ) ) + "px";

				if( this.dual ){
					if( !skip ){
						this.highlight.style.width = ((parseInt( this.thumb2.offsetLeft, 10 ) - parseInt( this.thumb.offsetLeft, 10 ) + parseInt( this.thumb.offsetWidth, 10) ) / this.cW ) * 100  + "%";
					}
					if( thumb === this.thumb ){
						this.highlight.style.left = percent + "%";
						this.highlight.style.marginLeft = "-" + Math.round( thumb.offsetWidth * ( percent * 0.01 ) ) + "px";
					}
				}

			},
			_buildDict: function(){
				var valueMap = {},
					indexMap = {};
				$( ( this.dual )? this.firstInput:this ).find( "option" ).each( function( i ){
					valueMap[ this.value ]  = i,
					indexMap[ i ] = this.value;
				});
				$.extend( this, {
					valueMap:valueMap,
					indexMap:indexMap
				});
			},
			_valueToPercent: function( value ){
				if(this.isSelect){
					value = parseInt(this.valueMap[value], 10 );
				}
				return ( ( value - this.min ) / ( this.span ) ) * 100;
			},
			_percentToValue: function( percent ){
				if( percent < 0){
					percent = 0;
				}
				if(percent > 100){
					percent = 100;
				}
				var value = Math.floor( this.step *  Math.round(percent / (( !this.isSelect && percent === 100 )? Math.round( this.stepSize ):( this.stepSize ) ))+(( !this.isSelect && percent === 100 )? this.step: 0)) + parseInt( this.min, 10 );
				return (this.isSelect)? this.indexMap[ value ]: value;
			},
			_bindTouchEvents: function(){
				var self = this,
					$thumb = $( this.slider ).find( ".slider-thumb" );

				$thumb.add( this.slider ).bind("touchstart touchmove touchend touchcancel", function( e ){
					$( self )[ pluginName ]( "_handleTouch", e );
				});
			},
			_bindThumbEvents: function(){
				var self = this,
					$thumb = $( this.slider ).find( ".slider-thumb" ),
					data = {};

				$thumb.bind( "mousedown", function( e ){
					$(self)[ pluginName ]( "_mouseDown", e, data );
					$(this).focus();
					return false;
				}).bind( "keyup", function( e ){
					$(self)[ pluginName ]( "_handleKeyup", e );
				});
			},
			_bindInputEvents: function(){
				var self = this,
					inp = (this.dual)? ((this.isSelect)? $(this).find('select'): $(this).find('input')): $( this );

				inp.bind( "change", function( ){
					$( self )[ pluginName ]( "_handleChange", this );
				});
			},
			_bindSliderEvents: function(){
				var self = this;
				$( this.slider ).bind( "mousedown", function( e ){
					$(self)[ pluginName ]( "_handleSliderMousedown", e );
				});
			},
			_bindParentEvents: function(){
				var self = this,
					parent = $( "#" + this.parentSlider ),
					inp = (this.dual)? ((this.isSelect)? parent.find('select'): parent.find('input')): parent;

				inp.bind( "change", function( e ){
					$( self )[ pluginName ]( "_updateParentHighlight" );
					$( self )[ pluginName ]( "_handleParentChange", e );
				});
			},
			_handleTouch: function( e ){
				var touches = event.changedTouches,
					first = touches[0],
					type = "",
					simulatedEvent = document.createEvent("MouseEvent");

				switch(event.type) {
					case "touchstart":
						type = "mousedown";
						break;
					case "touchmove":
						type="mousemove";
						break;
					case "touchend":
						type="mouseup";
						break;
					default:
						return;
				}
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
				first.target.dispatchEvent(simulatedEvent);
				event.preventDefault();
			},
			_handleParentChange: function( e ){
				var parent = document.getElementById( this.parentSlider ),
					first = ( parent.firstInput === e.target ),
					input = ( first )? this.firstInput: this.secondInput,
					otherInput = ( first )? this.secondInput: this.firstInput,
					thisVal = parseInt( ( this.isSelect )? this.valueMap[ $( input ).val() ]: $( input ).val(), 10 ),
					otherVal = parseInt( ( this.isSelect )? this.valueMap[ $( otherInput ).val() ]: $( otherInput ).val(), 10 ),
					parentVal = parseInt( ( this.isSelect )? this.valueMap[ $( e.target ).val() ]: $( e.target ).val(), 10 );

					if( ( first && thisVal < parentVal ) || ( !first && thisVal > parentVal ) ){
						if( ( first && thisVal + this.minSpan + this.step > otherVal ) || ( !first && thisVal - this.minSpan - this.step < otherVal )  ){
							$( otherInput ).val( ( this.isSelect )? this.indexMap[ otherVal + ( ( first )? this.step: -this.step ) ]: otherVal + ( ( first )? this.step: -this.step ) ).trigger( "change" );
						}
						$( input ).val( ( this.isSelect )? this.indexMap[ parentVal ]: parentVal ).trigger( "change" );
					}

			},
			_handleChange: function( input ){
				var thumb = ( this.firstInput === input || input === this )? this.thumb: this.thumb2,
					first = ( this.firstInput === input ),
					firstVal = parseInt( ( this.isSelect )? this.valueMap[ $( this.firstInput ).val() ]: $( this.firstInput ).val(), 10 );
					secondVal = parseInt( ( this.isSelect )? this.valueMap[ $( this.secondInput ).val() ]: $( this.secondInput ).val(), 10 );
				if( parseInt( $( this.firstInput ).val(), 10 ) < this.min || parseInt( $( this.secondInput ).val(), 10 ) > this.max || parseInt( $( this ).val(), 10 ) < this.min || parseInt( $( this ).val(), 10 ) > this.max ){	
					$( ( this.dual )? (( first )? this.firstInput: this.secondInput): this ).val( ( first || !this.dual )? this.min: this.max ).trigger( "change" );
				}
				if( this.dual ){
					if( firstVal + this.minSpan >= secondVal ){
						$( input ).val( ( this.isSelect )? this.indexMap[ ( first )? secondVal - this.minSpan: firstVal + this.minSpan ]: ( first )? secondVal - this.minSpan: firstVal + this.minSpan );
					}
					if( this.parentSlider ){
						var parent = document.getElementById( this.parentSlider ),
							parentInput = ( first )? parent.firstInput: parent.secondInput,
							parentVal = parseInt( ( this.isSelect )? this.valueMap[ $( parentInput ).val() ]: $( parentInput ).val(), 10 );
						if( ( first && firstVal < parentVal ) || ( !first && secondVal > parentVal ) ){
							$( parentInput ).val( ( this.isSelect )? this.indexMap[ ( first )? firstVal: secondVal ]: ( first )? firstVal: secondVal ).trigger( "change" );
						}
					}
				}
				$( this )[ pluginName ]( "_moveHandle", thumb, $( input ).val());
				if( this.isSelect ){
					$( ( first )? this.secondInput: this.firstInput ).find( "option" ).attr( "disabled", false );
					$( ( first )? this.secondInput: this.firstInput ).find( "option:eq("+this.valueMap[ $( input ).val() ]+")")[ ( first )? "prevAll": "nextAll" ]().attr( "disabled", true );
				}
			},
			_handleSliderMousedown: function( e ){
				var percent, input, data = {}, curVal;
					e.offsetX = (typeof e.offsetX === "undefined" || isNaN( e.offsetX ) )? e.originalEvent.layerX: e.offsetX;
				if( e.target !== this.slider ){
					e.offsetX = e.offsetX + e.target.offsetLeft;
				}
				percent = ( e.offsetX / this.slider.offsetWidth ) * 100;
				input = ( $( this )[pluginName]( "_moveFirst", e ) )? ( ( this.dual )? this.firstInput: this ): this.secondInput;
				curVal = $( this )[pluginName]( "_percentToValue", percent );
				if( curVal !== $( input ).val() ){
					$( input ).val( curVal ).trigger( "change" );
				}
				data.srcEvent = {};
				e.target = ( $( this )[pluginName]( "_moveFirst", e ) )? this.thumb: this.thumb2;
				data.srcEvent.target = ( $( this )[ pluginName ]( "_moveFirst", e ) )? this.thumb: this.thumb2;
				data.srcEvent.type = "mousedown";
				$( this )[ pluginName ]( "_mouseDown", e, data );
			},
			_handleKeyup: function( e ){
				var first = ( this.dual )? ( this.thumb === e.target ):true,
					input = ( first )? ( ( this.dual )? this.firstInput: this ): this.secondInput;
				if(e.which == 39){
					$( input ).val( ( this.isSelect )? ( ( !!this.indexMap[ this.valueMap[ $( input ).val() ] + 1 ] )? this.indexMap[ this.valueMap[$( input ).val() ] + 1 ]: this.indexMap[ this.valueMap[ $( input ).val() ] ] ): parseInt( $( input ).val(), 10 ) + parseFloat( this.step, 10 ) ).trigger( "change" );
				} else if( e.which == 37 ) {
					$( input ).val( ( this.isSelect )? this.indexMap[this.valueMap[$( input ).val()] - 1]: $( input ).val() - this.step ).trigger( "change" );
				}
			},
			_handleHighlightKeyup: function( e ){
				if(e.which == 39){
					$( this.firstInput ).val( ( this.isSelect )? ( ( !!this.indexMap[ this.valueMap[ $( this.firstInput ).val() ] + 1 ] )? this.indexMap[ this.valueMap[$( this.firstInput ).val() ] + 1 ]: this.indexMap[ this.valueMap[ $( this.firstInput ).val() ] ] ): parseInt( $( this.firstInput ).val(), 10 ) + parseFloat( this.step, 10 ) ).trigger( "change" );
					$( this.secondInput ).val( ( this.isSelect )? ( ( !!this.indexMap[ this.valueMap[ $( this.secondInput ).val() ] + 1 ] )? this.indexMap[ this.valueMap[$( this.secondInput ).val() ] + 1 ]: this.indexMap[ this.valueMap[ $( this.secondInput ).val() ] ] ): parseInt( $( this.secondInput ).val(), 10 ) + parseFloat( this.step, 10 ) ).trigger( "change" );
				} else if( e.which == 37 ) {
					$( this.firstInput ).val( ( this.isSelect )? this.indexMap[this.valueMap[$( this.firstInput ).val()] - 1]: $( this.firstInput ).val() - this.step ).trigger( "change" );
					$( this.secondInput ).val( ( this.isSelect )? this.indexMap[this.valueMap[$( this.secondInput ).val()] - 1]: $( this.secondInput ).val() - this.step ).trigger( "change" );
				}
			},
			_moveFirst: function( e ){
				e.offsetX = (typeof e.offsetX === "undefined" || isNaN( e.offsetX ) )? e.originalEvent.layerX: e.offsetX;
				if( !this.dual || Math.abs( e.offsetX - this.thumb.offsetLeft ) < Math.abs( e.offsetX - this.thumb2.offsetLeft ) ){
					return true;
				} else {
					return false;
				}
			},
			_updateParentHighlight: function(){
				this.parentHighlight.setAttribute( "style" ,document.getElementById( this.parentSlider ).highlight.getAttribute( 'style' ) );
			},
			_dragBehavior: function(data ){
				var first = ( data.target == this.thumb ),
					input = ( first ) ? ( ( this.dual ) ? this.firstInput : this ) : this.secondInput,
					percent, curVal = $( this )[ pluginName ]( "_percentToValue", percent );
				percent = Math.round( ( data.offsetX / this.cW ) * 100 );
				if( curVal !== $( input ).val() ){
					$( input ).val( curVal ).trigger( "change" );
				}
			},
			_mouseDown : function( e, data ) {
				var $oEl = $( this ), self = this;
				function moveSlider( e ) {
					data.offsetX = e.pageX - $( self.slider ).offset().left;
					$oEl[ pluginName ]( "_dragBehavior", data );
					e.stopPropagation();
				}
				data.target = e.target;
				$( this ).siblings().removeClass( "slider-thumb-current" );
				$( this ).addClass( "slider-thumb-current" );
				$( "body" )
					.bind( "mousemove", moveSlider )
					.bind( "mouseup", function( e ) {
						$( this ).unbind( "mousemove", moveSlider );
					});
			},
			_bindHighlightEvents: function(){
				var self = this, value, diff, curVal;
				$( this.highlight ).bind( "mousedown", function( e ){
					$( this ).focus();
					diff = ( !self.isSelect )? ( $( self.secondInput ).val() - $( self.firstInput ).val() ): ( self.valueMap[ $( self.secondInput ).val() ] - self.valueMap[ $( self.firstInput ).val() ]);
					$( 'body' ).bind( "mousemove", function( ev ){
						value = $( self )[ pluginName ]( "_percentToValue", Math.round( ( ( ev.pageX - $( self.slider ).offset().left - e.offsetX ) / self.sCW ) * 100 ));
						if( value + diff <= self.max || ( self.isSelect && self.valueMap[ value ] + diff <= self.max ) ){
							if( self.firstinput.val() !== value ){
								$( self.firstInput ).val(  value ).trigger( "change" );
							}
							curVal = (self.isSelect)? (self.indexMap[ self.valueMap[ $( self.firstInput ).val() ] + diff ]): ( parseInt( $( self.firstInput ).val(), 10 ) + diff);
							if( curVal !=  $( self.secondInput ).val() ){
								$( self.secondInput ).val(  ).trigger( "change" );
							}
						}
					}).bind( "mouseup", function( e ) {
						$( this ).unbind( "mousemove" );
					});
					return false;
				}).bind( "keyup", function( e ){
					$(self)[ pluginName ]( "_handleHighlightKeyup", e );
				});
			}
		};
	// Collection method.
	$.fn[ pluginName ] = function( arrg, a, b, c ) {
		// if it's a method
		if( arrg && typeof( arrg ) === "string" ){
			returnVal = $.fn[ pluginName ].prototype[ arrg ].call( this[0], a, b, c );
			return (typeof returnVal !== "undefined")? returnVal:$(this);
		}
		// check init
		if( !$( this ).data( pluginName + "data" ) ){
			$( this ).data( pluginName + "active", true );
			$.fn[ pluginName ].prototype._create.call( this );
		}
		return $(this);
	};

	// add methods
	$.extend( $.fn[ pluginName ].prototype, methods );

	// Kick it off when `enhance` event is fired.
	$( window ).on( "enhance", function( e ) {
		$( initSelector )[ pluginName ]();
	});

	// DOM-ready auto-init
	$( function(){
		$( window ).trigger( "enhance" );
	});

}( $ ));