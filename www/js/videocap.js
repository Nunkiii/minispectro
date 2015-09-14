navigator.getUserMedia  = (navigator.getUserMedia ||navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia);

var hg_lines = [
    [    400,      2052.828,          "Hg II"], 
    [    400,      2262.223,          "Hg II"], 
    [    1000,     2536.517,          "Hg I" ], 
    [    400,      2847.675,          "Hg II"], 
    [    250,      2967.280,          "Hg I" ], 
    [    600,      3650.153,          "Hg I"], 
    [    1000,     3983.931,          "Hg II"], 
    [    400,      4046.563,          "Hg I" ], 
    [    1000,     4358.328,          "Hg I"], 
    [    500,     5460.735,           "Hg I"], 
    [    200,     5677.105,           "Hg II"], 
    [    250,     6149.475,           "Hg II"], 
    [    250,    7944.555,            "Hg II"], 
    [    200,    10139.76,            "Hg I"]
]; 

/** Taken from Earl F. Glynn's web page:
* <a href="http://www.efg2.com/Lab/ScienceAndEngineering/Spectra.htm">Spectra Lab Report</a>
Converted to JS, 2015
* */

var wl2rgb=function(Gamma, IntensityMax){

    if(Gamma===undefined) Gamma = 0.80;
    if(IntensityMax===undefined) IntensityMax = 255;
    this.Gamma=Gamma;

    this.color=function(Wavelength){

	var factor;
	var Red,Green,Blue;

	if((Wavelength >= 380) && (Wavelength<440)){
	    Red = -(Wavelength - 440) / (440 - 380);
	    Green = 0.0;
	    Blue = 1.0;
	}else if((Wavelength >= 440) && (Wavelength<490)){
	    Red = 0.0;
	    Green = (Wavelength - 440) / (490 - 440);
	    Blue = 1.0;
	}else if((Wavelength >= 490) && (Wavelength<510)){
	    Red = 0.0;
	    Green = 1.0;
	    Blue = -(Wavelength - 510) / (510 - 490);
	}else if((Wavelength >= 510) && (Wavelength<580)){
	    Red = (Wavelength - 510) / (580 - 510);
	    Green = 1.0;
	    Blue = 0.0;
	}else if((Wavelength >= 580) && (Wavelength<645)){
	    Red = 1.0;
	    Green = -(Wavelength - 645) / (645 - 580);
	    Blue = 0.0;
	}else if((Wavelength >= 645) && (Wavelength<781)){
	    Red = 1.0;
	    Green = 0.0;
	    Blue = 0.0;
	}else{
	    Red = 0.0;
	    Green = 0.0;
	    Blue = 0.0;
	};
	
	// Let the intensity fall off near the vision limits
	
	if((Wavelength >= 380) && (Wavelength<420)){
	    factor = 0.3 + 0.7*(Wavelength - 380) / (420 - 380);
	}else if((Wavelength >= 420) && (Wavelength<701)){
	    factor = 1.0;
	}else if((Wavelength >= 701) && (Wavelength<781)){
	    factor = 0.3 + 0.7*(780 - Wavelength) / (780 - 700);
	}else{
	    factor = 0.0;
	};


	var rgb = [];
	
	// Don't want 0^x = 1 for x <> 0
	rgb[0] = Red==0.0 ? 0 : Math.round(IntensityMax * Math.pow(Red * factor, Gamma));
	rgb[1] = Green==0.0 ? 0 : Math.round(IntensityMax * Math.pow(Green * factor, Gamma));
	rgb[2] = Blue==0.0 ? 0 :  Math.round(IntensityMax * Math.pow(Blue * factor, Gamma));
	
	return rgb;
    }
};

var videocap_templates = {


    data_table : {

	widget_builder : function(ui_opts, dt){

	    
	    var ui=dt.ui=ce('table');

	    dt.redraw=function(){
		ui.innerHTML="";
		var thead=cc("thead",ui);
		var tbody=cc("tbody",ui);
		
		ui.className="table table-hover";

		if(dt.header===undefined)
		    return;
		var ncol=dt.header.length;
		var tr=cc("tr",thead);
		
		for(var c=0;c<ncol;c++){
		    var th=cc("th",tr);
		    th.innerHTML=dt.header[c];
		}
		
		if(dt.value===undefined) return;
		var dl = dt.value.length;
		console.log(dt.name + " : Drawing " + dl + " lines");
		for(var l=0;l<dl;l++){
		    var tr=cc("tr",tbody);
		    var line=dt.value[l];
		    for(var c=0;c<ncol && c<line.length;c++){
			var th=cc("td",tr);
			th.innerHTML=""+line[c];
		    }
		}
	    }
	    
	    dt.redraw();
	    return dt.ui;
	}
	
    },

    spectrum_feature : {
	name : "Spectrum feature",
	//subtitle : "Emission or absorption line",
	intro : "<strong>Emission or absorption line</strong><p>First parameter is the physical wavelength of the feature, in Å. The second parameter, is the pixel space position of the same feature.</p>",
	ui_opts : {
	    fa_icon : "magnet",
	    name_edit : true,
	    //editable : true, edited : false,
	    //name_node : "h4",
	    child_classes : ['container-fluid'],
	    child_view_type : 'table',
	    
	    //sliding : true, slided : false
	},
	elements : {
	    // name : {
	    // 	name : "Name",
	    // 	type : "string",
	    // 	ui_opts : { editable : true, label : true}
	    // },
	    wl : {
		name : "Wavelength",
	//	subtitle : "Physical wavelength, Å",
		type : "double",
		min : 0,
		max : 30000,
		value : 0,
		ui_opts : { editable: true, label : true}
	    },
	    pixel : {
		name : "Pixel",
	//	subtitle : "Image pixel space position",
		type : "double",
		min : 0, max : 20000, step : 1.0,
		value : 0,
		ui_opts : { editable : true, label : true}
	    }
	},

	widget_builder : function (ui_opts, feature){
	    var pixel=feature.get('pixel');
	    var deltatext=20;
	    feature.draw=function(context, view){
		var lineg = context.append('g');
		var label_text=feature.name; 

			//var sv=this; //spectro_view;
		var r=view.xr;
		var w=view.width;
		//var ar=view.vw/r[1];
		var m=pixel.value===undefined? w/2.0 : // pixel.value/r[1]*w; //(r[1]-r[0])/2.0*w;
		    view.xscale(pixel.value);
		//console.log("Range is " + r[0] + ", " + r[1] + " pos is " + m );
		var y1=5;//view.ui_opts.margin.bottom;
		var y2=view.height;
		
		//console.log("Draw feature...." + label_text + " y1 " + y1 + " y2 " + y2) ;
		//pixel.set_value(m);
		
		var spectrum_line=lineg.append('line')
		    .attr('x1',m)
		    .attr('y1',y1)
		    .attr('x2',m)
		    .attr('y2',y2)
		    .attr('stroke','rgba(100,150,150,.5)')
		    .attr('fill','purple')
		    .attr('stroke-width','3')
		    .attr('stroke-linecap','round');	

		var g = context.append('g');
		
		var label= g.append('text')
		    .attr('x',m-deltatext)
		    .attr('y',-3)
		    .attr("font-family", "sans-serif")
	            .attr("font-size", "8px")
	            .attr("fill", "purple")
		    .text(label_text);
		    //.attr('transform',' rotate(90,'+ (m-deltatext) +','+ (-3) + ')');
		
		
		
		
		
		spectrum_line.node().addEventListener('mousedown', function(e) {
		    
		    e.preventDefault();
		    var xlast=spectrum_line.attr('x1');
		    var last = e.pageX;
		    //console.log("DRAG BEGIN " + last + " xlast " + xlast);
		    var ar= view.svg.node().clientWidth/view.vw;
		    
		    document.documentElement.add_class('dragging');
		    document.documentElement.addEventListener('mousemove', on_move, true);
		    document.documentElement.addEventListener('mouseup', on_up, true);
		    
		    function on_move(e) {
			
			e.preventDefault();
			e.stopPropagation();
			
			var pos= e.pageX;
			var delta = pos - last;
			//last = pos;
			var newp = xlast*1.0+delta/ar;
			
			//console.log("DELTAPOS : " + delta + " newp " + newp + " AR " + ar);
			//var x1=spectrum_line.attr('x1');
			spectrum_line.attr('x1',newp);
			//var x2=spectrum_line.attr('x2');
			spectrum_line.attr('x2',newp);
			label.attr('x',newp-deltatext);
			
			pixel.set_value(r[0]+newp/w*(r[1]-r[0]));
			//delta -= last;
			
		    }
		    
		    function on_up(e) {
			e.preventDefault();
			e.stopPropagation();
			document.documentElement.remove_class('dragging');
			//document.documentElement.className = document.documentElement.className.replace(/\bdragging\b/, '');
			document.documentElement.removeEventListener('mousemove', on_move, true);
			document.documentElement.removeEventListener('mouseup', on_up, true);
			//console.log("Done move..."); 
			//div.trigger("drag_end");
		    }
		    
		}, false);
	    }
	    
	}
    },
    
    spectrum : {

	name : "Spectrum",
	ui_opts : {
	    icon : "/minispectro/ico/minispectro.svg",
	    //name_node :"h2",
	    show_cursor : true,
	    name_edit : true,
	    child_view_type : 'tabbed',
	    //root_classes : ['container-fluid'],
	    //toolbar_brand : true
	    //save : "spectrum"
	},
	toolbar : { ui_opts : { toolbar_classes : ["navbar navbar-default"]} },
	
	elements : {
	    keys : {
		name : "Meta-data",
		ui_opts : {
		    child_view_type : "div",
		    //name_node : "h3"
		},
		elements : {
		    target : {
			type : "string",
			name : "Target",
			holder_value : "Spectrum light source",
			ui_opts : {
			    label : true,
			    editable : true,
			    edited : false
			}
		    },
		    date_obs : {
			name : "Observation time",
			type : "date",
			ui_opts : {
			    label : true
			}
		    }
		}
	    },
			
	    lines :  {
		name : "Spectral features",

		ui_opts : {
		    //fa_icon : "save",
		    //root_classes : ["container-fluid"],
		    child_view_type : "tabbed",
		    child_node_type : "form",
		},
		toolbar : { ui_opts : { toolbar_classes : ["navbar-default"] }},
		elements : {
		    new_line : {
			name : "Add a new Hg spectral feature",
			intro : "<p>Add a mercury emission line from the list of strong emission lines :</p>",
			ui_opts : {
			    fa_icon : "plus",
			    root_classes : ["container-fluid col-xs-12"],
			    child_node_type : "form",
			    child_classes : ["form-horizontal col-md-offset-2 col-md-8 vertical_margin"],
			    //name_node : "strong",
			    //intro_stick : true
			    //	    sliding : true,
			    //	    slided : false
			},
			
			elements : {
			    select_line : {
				
				ui_opts : {
				    root_classes : ["input-group"],
				    name_classes : ["input-group-addon"],
				    name_node : "div",
				    type : "edit"
				},
				
				
				name : 'Select emission line',
				type : 'combo'
			    },
			    
			    add_line :   {
				name:  "Add feature", type : "action",
				ui_opts:{
				    root_element : "select_line",
				    wrap : true,
				    wrap_classes : ["input-group-btn"],
				    item_classes : ["btn btn-info"],
				    fa_icon : "plus"
				    
				}
			    }
			}
			
		    },
		    new_custom_line : {
			
		    	name : "Add a custom spectral feature",
			intro : "<ul><li>Edit feature's name.</li><li> Setup the wavelength in Å and eventually the pixel position of the new spectral feature, pixel position can also be changed by dragging the feature line in the spectrum's plot.</li> <li>Click 'Add feature' button to add the feature to the list</li></ul>",
			ui_opts : {
			    //intro_stick : true,
			    fa_icon : "plus",
			    root_classes : ["container-fluid"],
			    child_node_type : "form",
			    child_classes : ["form-inline container-fluid col-md-offset-3 col-md-6 list-group-item"],
			    //name_node : "strong",
			    //	    sliding : true,
			    //	    slided : false
			},
			
			elements : {
			    custom_feature : {
				ui_opts : {
				    //root_classes : ["input-group"],
				    name_classes : ["text-left"],
				    //name_node : "div",
				    //root_classes : "container-fluid",
				    //render_name : true,
				    type : "edit",
				    name_edit : true,
				    //slided : true
				    //intro_stick : true
				},
				name : 'A spectrum feature ...',
				type : 'spectrum_feature'
			    },
			    
			    add_custom_feature :   {
				name:  "Add feature", type : "action",
				ui_opts:{
				    //root_element : "select_line",
				    wrap : true,
				    wrap_classes : ["input-group-btn text-right"],
				    item_classes : ["btn btn-info"],
				    fa_icon : "plus"
				    
				}
			    }
			}
			
		    },
		    /*
		    new_custom_line : {
			
			name : "Add a custom spectral feature",
			
			ui_opts : {
			    fa_icon : "plus",
			    //root_classes : ["container-fluid inline"],
			    //child_node_type : "form",
			    //child_classes : ["inline form-inline"],
			    label : true,
			    // name_node : "strong",
		//	    sliding : true,
		//	    slided : false
			},
			
			elements : {
			    feature_edit : {
				name : "New feature",
				type : "spectrum_feature",
				ui_opts : {
				    type : "edit",
				    edited : true
				}
			    },
			    add_line :   {
				name:  "Add feature", type : "action",
				ui_opts:{
				    //root_element : "select_line",
				    //wrap : true,
				    //wrap_classes : ["input-group-btn"],
				    item_classes : ["btn btn-info"],
				    fa_icon : "plus"
				    
				}
			    }
			    }
			    },
		    */
		    feature_list : {
			name : "Spectral features list", 
			
			ui_opts : {
			    //name_node : 'h3',
			    child_view_type : "table",
			    fa_icon : "reorder"
			}
		    }
		}
	    },
	    
	    view : {
		name : "Spectrum plot",
		type : "vector",
		ui_opts : {
		    in_root : 'append',
		    //name_node : "h3",
		    //name_node : "strong",
		    show_cursor : true,
		    enable_selection : false,
		    enable_range : false,
		    //sliding : true,
		    //slided : true,
		    render_name : false,
		    root_classes : ["list-group-item vertical_margin"]
		}
	    }
	},

	widget_builder : function(ui_opts, spectrum){
	    console.log("spectrum widget_builder : Building spectrum : " + spectrum.name);
	}
    },

    tbase : {
	name : "Tbase",
	elements : {
	    toto : { name : "Xbase1", type : 'string', value : "Toto"},
	    toto2 : { name : "Xbase2", type : 'color', value : "#1213aa"}
	},
	ui_opts : {fa_icon : 'cogs', root_classes : ["container-fluid"]},
	widget_builder : function(ui_opts, sspec){
	    sspec.debug("Base constructor !");
	}
    },
    tchild : {
	name : "Tchild",
	type : 'tbase',
	elements : {
	    //totochild : { name : "Xchild", type : 'double', value : 333, min : 330, max: 338, ui_opts : {type : 'edit', label : true}},
	    lv : {name : "lvtest", type : "labelled_vector", label_prefix : "P", ui_opts : { } }
	},
	widget_builder : function(ui_opts, sspec){
	    sspec.debug("Child constructor !");
	    //sspec.set('totochild', 334);
	    sspec.set('lv', [1,2,3,4,5]);
	}
    },
    tschild : {
	name : "Child of child", ui_opts : {fa_icon : 'leaf'},
	type : 'tchild',
	elements : {
	    subtotochild : { name : "XSubchild", type : 'string', value : "Toto3"},
	    act : {
		name : "Change lv", type : 'action', ui_opts : { item_classes : ['btn btn-xs btn-warning'] },
		widget_builder : function(ui_opts, act){
		    act.listen('click', function(){ this.lv.set_value([7,8,9,10,11]) });
		}
	    }
	    
	},
	widget_builder : function(ui_opts, sspec){
	    sspec.debug("Sub-Child constructor !");
	    sspec.get('act').lv=sspec.get('lv');
	}
    },
    sspec : {
	type : 'spectrum',
	name : 'stest',
	widget_builder : function(ui_opts, sspec){
	    console.log("stest widget_builder : Hellooo stest");
	}
    },
    
    polynomial : {
	name : "Polynomial function",
	ui_opts:{
	    root_classes : ['panel panel-success'],
	    name_classes : ['panel-heading'],
	    //name_node : 'div',
	    child_classes : ['container-fluid panel-content'],
	    fa_icon : 'superscript',
	    child_view_type : 'table'
	},
	elements : {
	    pdeg : {
		name : "Polynomial degree",
		type : "double",
		min : 0,
		max : 10,
		step : 1,
		ui_opts : {
		    editable : true
		    
		    //type : 'edit',
		    //label : true,
		    //root_classes : ["col-xs-6"]
		},
		default_value : 2
	    },
	    
	    params : {
		ui_opts:{
		    //child_view_type : '',
		    editable : true,
		    //child_classes : ['container-fluid']
		},
		
		name : 'Parameters',
		type : 'labelled_vector',
		label_prefix : 'x'
		
	    }
	},
	widget_builder : function(ui_opts, p){
	    var params=p.get('params');
	    var pdeg=p.get('pdeg');
	    pdeg.listen('change',function(){ p.reset(); });

	    p.reset=function(value){
		
		var d=pdeg.value*1.0+1.0;
		
				    
		if(value===undefined) value=params.value;

		if(value.length<d)
		    for(var i=value.length;i<d;i++)
			value[i]=0;
		else
		    if(d<value.length){
			value=value.slice(0,d);
			
		    }

		console.log("Reset d="+d + " vl " + value.length );
		/*
		  params.value_labels=[];
		  for(var di=0;di<d;di++){
		    params.value_labels.push('x<sup>'+(di)+'</sup>');
		    }
		    params.rebuild();
		*/
		params.set_value(value);
		
		return;
		
		if(params.value===undefined)
		    params.value=[];
		if(params.value_labels===undefined)
		    params.value_labels=[];
		var pvl=params.value.length;
		if(pvl < d){
		    for(var di=pvl;di<d;di++){
			params.value.push(0);
			params.value_labels.push('x<sup>'+(di+1.0)+'</sup>');
			params.rebuild();
		    }
		}
		else if(d<pvl){
		    params.value.slice(0,d);
		    params.value_labels.slice(0,d);
		    params.rebuild();
		}
		if(value!==undefined)
		    for(var i=0;i<value.length && i<params.value.length; i++)
			params.inputs[i].set_value(value[i]);
		
	    };
	    p.func=function(x){
		var pp=params.value;
		if(pp===undefined) return undefined;
		if(pp.length==0) return undefined;

		var r=0;xx=1.0;
		for(var i=0;i<pp.length;i++){
		    r+=xx*pp[i];
		    xx*=x;
		}
		//console.log("calc pfunc("+x+")="+r + "P="+ JSON.stringify(pp));
		return r;
	    };
	    
	    //p.reset();
	}
    },
    
    
    wlc : {
	name : "Wavelength calibration",
	intro : "<strong>Introduction</strong> <p> The webcam CCD records the spectra as a 2D image. The spectrograph should be setup to assure that the color direction of the spectrum image is projected parallel to a CCD direction to simplify image processing. Along that direction, each pixel correspond to a different physical colour, hence a different light's wavelength.</p> <strong>Calibration</strong> <p>To be able to associate a pixel index with a physical wavelength, a <em>calibration spectrum</em> must be used to identify the pixel-space position of a certain number of spectral features whose wavelength is known, and use these points to build a model, in this case a polynomial function, to interpolate the colour for every pixel position.</p>",
	ui_opts : {
	    render_name : true, child_view_type : 'div', name_node : 'h2',
	    root_classes : ["container-fluid"],
	    child_classes : ["row"],
	    //intro_stick : true
	},
	elements : {
	    fit : {
		name : "Polynomial calibration model",
		intro : "Explain what we do here ...",
		ui_opts : {
		    //name_node : 'h3',
		    root_classes : ['col-md-6 col-xs-12'],
		    child_classes : ['container-fluid'],
		},
		elements : {
		    calib_func : {
			type : 'polynomial',
			name : "Calibration polynomial function",
			ui_opts : {
			    name_node : 'div',
			    save : "wlc"
			}
		    },

		    
		    control : {
			name : "Fit computation",
			ui_opts : {
			    root_classes : ['panel panel-default'],
			    name_classes : ['panel-heading'],
			    name_node : 'div',
			    child_classes : ['panel-content container-fluid'],
			    fa_icon : 'cogs'
			},
			elements : {
			    specsel : {
				name : "Select spectrum",
				type : "combo",
				//intro : "<p>Choose a spectrum to use for wavelength calibration fit</p>",
				ui_opts : {
				    label : true,
				    type : 'edit',
				    root_classes : ['col-sm-6'],
				    item_classes : []
				}
			    },
			    // pdeg : {
			    // 	name : "Polynomial degree",
			    // 	type : "double",
			    // 	min : 0, max : 10, step : 1,
			    // 	ui_opts : {
			    // 	    type : 'edit',
			    // 	    label : true,
			    // 	    root_classes : ["col-xs-6"]},
			    // 	default_value : 2
			    // },
			    exec :  {
				type : 'action',
				name : 'Fit datapoints',
				ui_opts:{
				    //item_root : false,
				    //wrap : true,
				    root_classes : ["container-fluid "],
				    fa_icon : "cogs",
				    item_classes : ["col-sm-6  btn btn-warning vertical_margin"]
				}
			    },
			    fit_eq : {
				name : "Equation",
				type : "string",
				default_value : "No equation",
				ui_opts : {
				    label : true,
				    root_classes : ["col-sm-12"]
				}
				
			    },
			    // fit_params : {
			    // 	name : "Fit parameters",
			    // 	ui_opts:{
			    // 	    label : true,
			    // 	    root_classes : ["col-xs-12"],
			    // 	    child_view_type : 'table',
			    // 	    editable : true
			    // 	},
			    // 	elements : {
				    
			    // 	}


			    // }
			    
			}
		    }
		    
		},
		widget_builder : function(ui_opts, fit){
		    fit.listen("data_loaded", function(){
			console.log("FIT PLOAD !!! " + this.name) ;
			
		    });
		}
	    },

	    view : {
		name : "Fit result",
		type : 'vector',
		ui_opts : {
		    fa_icon : 'trophy',
		    enable_range : false,
		    enable_selection : false,
		    //root_classes : ['container-fluid'],
		    child_classes : ['container-fluid'],
		    root_classes : ['container-fluid col-md-6 col-xs-12'],
		    //item_classes : ['container-fluid']
		    
		}
	    }


	}
    },

    videocap : {
	
	name : "WebSpectro",
	
	//intro : "<h1>A web/home experiment to discover spectroscopy</h1><p>Instructions to build the inexpensive spectrograph can not be found <a href=''>here</a> yet, sorry!</p>",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : [],
	    name_classes : [],
	    icon : "/minispectro/ico/minispectro_white.svg",
	    //child_toolbar : true,
	    child_view_type : 'tabbed',
	    toolbar_brand : true,
	    //name_node : "h4"
	},

	// type : 'html',
	// url : '/minispectro/',
	//value : "Helloooo !",

	toolbar : {
	    ui_opts : {
		toolbar_classes : ["navbar-fixed-top navbar-inverse"]
	    }
	},
	
	elements : {

	    intro : {
		type : 'html',
		name : "WebSpectro",
		subtitle : "<strong>A javascript application to discover spectroscopy at home or at school !</strong>",
		value : '<p>Test main page ui...</p>',

		ui_opts : {
		    root_classes : ["container-fluid"],
		    child_classes : [],
		    name_classes : [],
		    icon : "/minispectro/ico/minispectro.svg",
		    intro_stick : true
		},
		elements : {
		    soft_manual : {
			type : 'html',
			name : 'Spectro application'
		    },
		    building : {
			type : 'html',
			name : 'Construction',
			value : "<p>Instructions to build the inexpensive spectrograph can not be found <a href=''>here</a> yet, sorry!</p>"
		    }
		}
	    },
	    
	    spectro : {
		name : "Spectrograph",
		
		ui_opts : {
		    fa_icon : "line-chart",
		    //root_classes : ["row"],
		    //child_classes : ['row'],
		    item_classes : [],
		    render_name : false,
		    //child_view_type : 'divider',

		    //childs_pos : "below",
		},


		elements : {
		    left: {
			name : "2D Capture",
			ui_opts : {
			    root_classes : ["col-md-4 col-xs-12 vlimit"],
			    child_classes : ["container-fluid"],
			    //save : "minispectro_setup",
			    child_view_type : 'tabbed',
			    fa_icon : "camera",//fa_icon : 'cogs',
			    default_child : 'none'
			    // sliding : true,
			    // slided : true
			},
			toolbar : { ui_opts : { toolbar_classes : ['navbar navbar-default']} },
			
			elements : {

					    video : {
						name : "Device",
						subtitle : "Setup your webcam device",
						intro : "<strong>Warning</strong><ul><li>On some browser this function is not available and the choice of device can only be made interactively at browser prompt when starting capture.</li><li>Resolution selection is only available on few browsers</li></ul>",
						ui_opts : {
						    root_classes : [""],
						    child_classes : ["col-sm-offset-3 col-sm-6 list-group col-md-12 col-md-offset-0"],
						    fa_icon : 'camera-retro',
						    //render_name : false,
						    //intro_stick : true
						},
						elements : {
						    device : {
							ui_opts : {
							    label : true,
							    name_classes : ["col-sm-6 control-label"],
							    //wrap : true,
							    //wrap_classes : ["col-sm-4"],
							    root_classes : ["form-group list-group-item vertical_margin"],
							    //root_classes : ["col-md-6 col-sm-6 col-xs-12"],
							    fa_icon : "camera-retro", type : "edit"
							},
							name : "Camera device",
							type : "combo"
						    },
						    resolution : {
							name : "Resolution",
							ui_opts : {
							    label : true,
							    name_classes : ["col-sm-6 control-label"],
							    //wrap : true,
							    //wrap_classes : ["col-sm-4"],
							    root_classes : ["form-group list-group-item"],
							    //root_classes : ["col-md-6 col-sm-6 col-xs-12"],
							    fa_icon : "qrcode", type : "edit"
							},
							type : "combo",
							options : ["VGA", "HD"]
						    }
						}
					    },
					    processing : {
						name : "Processing",
						subtitle : "Set the image processing pipeline options",
						ui_opts : {
						    root_classes : [""],
						    child_classes : ["list-group"],
						    fa_icon : "th",
						    //render_name : false,
						   // close : true,
						    intro_stick : true,
						    //child_node_type  : 'ul',
						    child_view_type : 'div'
						},
						
						elements : {
						    integrate : {
							name  : "Average frames",
 							ui_opts : {
							    //name_classes : ["col-sm-3"],
							    root_classes : ["list-group-item vertical_margin col-xs-12"],
							    child_classes : ["col-sm-12 container-fluid"],
							    //child_view_type : 'table',
							    fa_icon : 'plus'
							},
							intro : "<p>Sum up frames to reduce noise</p>",
							elements : {
							    enable : {
								name : "Enable",
								ui_opts : {
								    label : true,
								    //root_classes : ["col-sm-6 col-xs-6"],
								    //name_classes : ["col-sm-6 col-xs-6"],
								    //item_classes : ["col-sm-6 col-xs-6"],
								    type : "edit" },
								type : "bool",
								value : false
							    },
							    nframes : {
								type : "double",
								name : "Number of images",
								ui_opts : {
								    type : "edit",
								    label : true,
								    //root_classes : ["col-sm-6 col-xs-6"],
								    //name_classes : ["col-xs-6"],
								    //item_classes : ["col-xs-6"]
								    //root_classes : ["list-group-item"]
								},
								step : 1,
								value : 5,
								min : 2,
								max : 100
							    }
							}
						    },
						    sampling : {
							name : "Sampling",
							name : "Buffer sampling rate (Hz)", intro : "<p>Setting this to a value higher than the actual camera sampling rate is not usefull and consumes CPU.</p>",
							type : "double", min : .1, max : 50, step : 1, default_value : 2,
							ui_opts : {
							    //label : true,
							    name_classes : ["col-xs-6"],
							    item_classes : ['col-xs-6'],
							    root_classes : ["list-group-item col-xs-12"],
							    fa_icon : "dashboard", type : "edit"
							}
							
						    }
						}
					    },
					    box : {
						name : "Region",
						subtitle : "Setup the orientation and dimensions of the spectrum area within the image",
						ui_opts :  {
						    //render_name: false,
						    fa_icon : 'retweet',
						    name_classes : ["title_margin"],
						    //child_classes : ["list-group"],
						    child_view_type : 'tabbed',
						    //name_node : "h3"
						    //intro_stick : true
						},
						
						elements : {
						    dir : {
							name : "Wavelength direction",
							intro : "<p>Set the wavelength direction depending on your spectro design. Default is vertical, along the Y direction.</p>",
							type : "combo",
							
							options : [{ label : "Vertical", value : 0},{ label :  "Horizontal", value : 1}],
							ui_opts : {
							    //root_classes : ["vertical_margin"],
							    wrap_classes : ["col-xs-12"],
							    type : "edit",
							    //label : true,
							    fa_icon : "exchange",
							    intro_stick : true,
							    render_name : false
							    
							    //name_node : "h4"
							    
							},
							default_value : 0,
						    },
						    region : {
							name : "Spectrum box",
							intro : "<strong>Adjust the spectrum box coordinates</strong><p> (x,y) is the top left pixel corner</p><p>The box can also be resized interactively by resizing the box rectangle overlayed on the camera view window.</p>",
							ui_opts :  {
							    //root_classes : ["vertical_margin"],
							    child_classes : ["form-inline container-fluid"],
							    fa_icon : 'crop',
							    intro_stick : true,
							    render_name : false
							},
							elements : {
							    x : {
								name: "x",
								type: "double",
								default_value : 300, step : 1, min : 0,
								ui_opts : {
								    type : "edit",
								    //label : true,
								    root_classes : ["col-sm-6 col-xs-12"],
								    name_classes : ["col-sm-3 col-xs-6"],
								    item_classes : ["col-sm-3 col-xs-6"]
								    //root_classes : ["form-group"]
								}
							    },
							    y : {
								name: "y",
								type: "double",
								default_value : 50, step : 1, min : 0,
								ui_opts : {
								    type : "edit",
								    //label : true,

								    root_classes : ["col-sm-6 col-xs-12 vertical_margin"],
								    name_classes : ["col-sm-3 col-xs-6"],
								    item_classes : ["col-sm-3 col-xs-6"]
								}
							    },
							    w : {
								name: "width",
								type: "double",
								default_value : 30, step : 1, min : 1,
								ui_opts : { type : "edit", //label : true,
									    root_classes : ["col-sm-6 vertical_margin col-xs-12"],
									    name_classes : ["col-sm-3 col-xs-6"],
									    item_classes : ["col-sm-3 col-xs-6"]

									  }
							    },
							    h : {
								name: "height",
								type: "double",
								default_value : 300, step : 1, min : 1,
								ui_opts : { type : "edit", //label : true,
									    root_classes : ["col-sm-6 col-xs-12 vertical_margin"],
									    name_classes : ["col-sm-3 col-xs-6"],
									    item_classes : ["col-sm-3 col-xs-6"]
									    
									  }
							    }
							}
						    }
							
						    
						    
						}
					    },

			    
			    // setup : {
			    // 	name : "Setup",
			    // 	//intro : "<p>Configure camera and spectrum sampling</p>",
			    // 	ui_opts : {
			    // 	    //root_classes : ["col-xs-12"],
			    // 	    fa_icon : "cogs",

				    
			    // 	    //name_classes : ["well"]
			    // 	    //name_node : 'h2',
			    // 	    //render_name : false

				    
			    // 	},
			    // 	toolbar : { ui_opts : { toolbar_classes : ['navbar navbar-default']} },
			    // 	elements : {
				    camview : {
					//name : "Video monitor", 
					ui_opts : {
					    in_root : true, //'prepend',
					    //root_classes : ["row"],
					    fa_icon : 'play'
					    //root_classes : ["container-fluid"]
					},
					elements : {
					    
					    butts : {
						name : "Start/Stop capture :",
						intro : "<p>Start/stop capturing frames from the webcam and computing one-dimensional spectrum</p><p>You might be prompted to accept webcam capture from your browser</p>",
						ui_opts :  {
						    fa_icon : "play",
						    child_classes : ["btn-group text-center"],
						    root_classes : ["container-fluid"],
						    label : true
						},
						elements : {
						    start : {
							name : "",
							type : "action",
							ui_opts :  {
							    fa_icon : "play",item_classes : ["btn btn-primary btn-sm"],
							}
						    },
						    stop : {
							name : "",
							type : "action",
							ui_opts :  {
							    fa_icon : "stop",item_classes : ["btn btn-default btn-sm"],
							}
						    }
						}
					    },
					    
					    camwindow : {
						
					    }
					},
					widget_builder : function(ui_opts, camview){
					}
				    },
			    
			}
			
		    },
		    // right : {
		    // 	name : "Right !",
		    // 	ui_opts : {
			    
		    // 	    //child_view_type : 'tabbed',
		    // 	    render_name : false
		    // 	},
		    // 	elements : {
			    // view_main : {

			    // 	name : "Real-time spectrum",
			    // 	subtitle : "One dimensional raw spectra (R,G,B, Sum/3)",
			    // 	ui_opts : {
			    // 	    fa_icon : "line-chart",
			    // 	    //name_node : "h3",
			    // 	    render_name : false
			    // 	},

			    // 	elements : {
				    specview : {
					name : "Live 1D spectra",
					type : "spectrum",
					//intro:  "One dimensional raw spectra (R,G,B, Sum/3)",
					y_range : [0, 255],
					ui_opts : {
					    name_edit : false,
					    intro_stick: true,
					    fa_icon : "line-chart",
					    root_classes : ['col-md-8 col-xs-12 container-fluid vlimit'],
					    child_classes : ["container-fluid"],
					    //item_classes : ["row"],
					    //  label : true,
					  //  enable_range : false,
					    //  enable_selection : false,
					    //root_classes : ['col-md-12'],
					    
					    //render_name : false
					},
					elements : {
					    view : {
						ui_opts : {
						    //root_classes : ["row"]
						}
					    },
					    lines : {
						name : "Spectral features",
						intro : "<p>Add the spectral features you want to appear in the live spectrum display.</p>",
						ui_opts : { fa_icon : 'magnet'}
					    },
					    
					    fileops : {
						name : "Save spectrum",
						intro : "<p>Save visible spectrum on browser's webstorage</p>",
						ui_opts : {
						    //label : true,
						    fa_icon : "save",
						    //render_name : false,
						    //intro_stick : true,
						    root_classes : ["col-sm-12 panel panel-default vertical_padding"],
						    //child_node_type : "form",
						    //child_classes : ["vertical_padding"]
						    
						},
						
						
						elements : {
						    specname : {
							type : "string",
							name : "Name :",
							holder_value : "Auto (Date)",
							ui_opts : {
							    root_classes : ["col-sm-5"],
							    label : true,
							    //wrap : true,
							    //wrap_classes : ["col-sm-4 nopadding"],
							    //name_classes : ["input-group-addon"],
							    //name_node : "div",
							    type : "edit"
							}
							
						    },
						    
						    target : {
							type : "string",
							name : "Target :",
							holder_value : "An interesting light source",
							ui_opts : {
							    
							    //root_element : "specname",
							    root_classes : ["col-sm-5"],
							    label : true,
							    //wrap_classes : ["col-sm-4 nopadding"],
							    //name_classes : ["input-group-addon"],
							    //name_node : "div",
							    type : "edit"
							}
							
						    },
						    save :   {
							name:  "Save",
							type : "action",
							ui_opts:{
							    //root_element : "specname",
							    fa_icon : "save",
							    root_classes : ["col-sm-2 vertical_margin"],
							    wrap : true,
							    wrap_classes : ["input-group-btn text-left"],
							    item_classes : ["btn btn-primary"]
							    
							}
						    }
						}
					    }
					    
					},
					widget_builder : function(ui_opts, sv){
					    console.log(sv.name + " Specview BUILDER !!");
					    sv.ui_childs.remove_child(sv.elements.keys);
					}
					
					
				    },
			    
		}
	    },
	    
	    
	    spectra : {
		name : "Saved spectra",
		ui_opts : {
		    child_view_type : "tabbed",
		    root_classes : ["container-fluid"],
		    name_classes : ["well"],
		    child_classes : ["container-fluid"],
		    fa_icon : "folder",
		    tabs_mode : "left",
		    //render_name : false,
		    save : "spectra",
		    container : {
			type : 'spectrum',
			del : true,
		    }
		}

	    },
	    
	    options : {
		name : "Calibration",
		subtitle : "Setup wavelength and flux calibration",
		ui_opts : {
		    child_view_type : "tabbed",
		    root_classes : ["container-fluid left"],
		    render_name : true,
		    name_classes : ["title_margin"],
		    fa_icon : "calculator",
		    intro_stick : true
		},
		//toolbar : { ui_opts : { toolbar_classes : ""} },
		elements : {
		    wlc : {
			type : 'wlc'
		    },
		    flxc : {
			name : "Flux calibration"
		    }
		}
	    }
	}
    }
    
};



template_ui_builders.spectrum=function(ui_opts, spectrum){

    console.log("spectrum ui_builders : Building spectrum : " + spectrum.name);
    //template_ui_builders.vector(ui_opts, spectrum);
    var view=spectrum.get('view');
    
    
    spectrum.update_plot=function(spec_data){
	//var spec_data=spectrum.value;
	if(spec_data===undefined) return;
	
	view.plots=[];
	var pr,pg,pb,pt;

	pr=view.add_plot_linear(spec_data.r,0,1);
	pg=view.add_plot_linear(spec_data.g,0,1);
	pb=view.add_plot_linear(spec_data.b,0,1);
	pt=view.add_plot_linear(spec_data.t,0,1);
	
	//
	pr.set_opts({ stroke : "#ff0000", stroke_width : ".5px", label : "Red"});
	pg.set_opts({ stroke : "#10ee05", stroke_width : ".5px", label : "Green"});
	pb.set_opts({ stroke : "#0202ee", stroke_width : ".5px", label : "Blue"});
	pt.set_opts({ stroke : "#6020cc", stroke_width : "1px", label : "Mean"});

	view.redraw();	
    }


    var select_line=spectrum.get('select_line');
    var add_line=spectrum.get('add_line');
    
    var flist=spectrum.get('feature_list');
    var new_line=spectrum.get('new_line');
    
    var add_custom_feature=spectrum.get('add_custom_feature');
    
    
    select_line.options=[];
    hg_lines.forEach( function( line, i ){
	
	select_line.options.push( { value : i, label : line[2] + " : " + line[1] + " Å" });
	//line[0]
    });

    select_line.set_options();

    //line_table.value=[];
    
    function check_line(l){
	
	for(var f in flist.elements){
	    
	    if(flist.elements[f].val('wl')==l){
		spectrum.debug("The wavelength " + l + " is already in the table !");
		return false;
	    }
	}
	return true;
    }
    
    add_line.listen('click', function(){
	var sel_line=select_line.ui.value;

	var ion=hg_lines[sel_line][2];
	var lambda=hg_lines[sel_line][1];
	
	console.log("Selected line : " + JSON.stringify(sel_line));
	
	if(check_line(lambda)){
	    var fe=create_widget('spectrum_feature');
	    fe.set('wl',lambda);
	    fe.set_title(ion + ", "+lambda+ 'Å');
	    flist.add_child(fe);
	    
	    //line_table.value.push([ion, lambda, 0.0] );
	    //line_table.redraw();
	    view.redraw();
	}
    });

    add_custom_feature.listen('click', function(){
	var specfec=spectrum.get('custom_feature');

	var lambda=specfec.val('wl');
	
	if(check_line(lambda)){
	    
	    var fe=create_widget('spectrum_feature');
	    fe.set('wl',lambda);
	    fe.set('pixel',specfec.val('pixel'));
	    fe.set_title(specfec.name);
	    flist.add_child(fe);
	    
	    //line_table.value.push([ion, lambda, 0.0] );
	    //line_table.redraw();
	    view.redraw();
	}
    });
    
    
    
    view.listen('redraw',function(context){
	//console.log("Spec redraw !!! context " + context);
	
	
	//var line_table=wlc.get('feature_list').value;
	
	//if( line_table===undefined) return;
	
	//console.log("Spectro redraw !" + r + ", " + w + ", " + m + " Number of lines : " + line_table.length);
	var i=0;
	for(var fe in flist.elements ){
	    //console.log("Draw specfeat " + fe + " i=" + (i++));
	    var feature=flist.elements[fe];
	    feature.draw(context, view);
	}
    });

    
    
    //spectrum.update_plot();
}

var global_wlc;

template_ui_builders.wlc=function(ui_opts, wlc){

    global_wlc=wlc;
    console.log("Building wlc : " + wlc.name);
    
    var specsel=wlc.get('specsel');
    //var specview=wlc.get('specview');
//    var color=wlc.get('color');
    
    
    new_event(wlc,"update_spectra");

    wlc.listen('update_spectra', function(spectra){
	specsel.options=[];
	wlc.spectra=spectra;
	
	for (var s in spectra){
	    //console.log(specsel.name + " : adding option   " + s );
	    specsel.options.push({ label : s, value : spectra[s].name} );
	}

	specsel.set_options();
    });


    
    // function setup_selspec(){
	
	

    // 	//console.log("Length ====================== color " + color.value + " label " + color.options[color.value].label );
    // 	// console.log("Setup selspec ... " );
    // 	// var sd=get_template_data(s);
    // 	// set_template_data(specview, sd);
	
    // 	// if(specview.value.length>0){
    // 	//     specview.value[0].data=s.elements.view.value[color.value].data;
    // 	// }else
    // 	//     specview.add_plot_linear(s.elements.view.value[color.value].data,0,1);
	
    // 	// if(color.value<3)
    // 	//     specview.value[0].set_opts({ stroke : color.options[color.value].label, stroke_width : ".5px", label : color.options[color.value].label});
    // 	// else
    // 	//     specview.value[0].set_opts({ stroke : 'black', stroke_width : ".5px", label : "Average"});
	
    // 	//specview.config_range();
    // }

    //var ss;
    specsel.listen('change', function(sin){
	
	if(sin!=this.ss){
	    console.log("specsel changed !!! " + this.ss + " sin= " + sin );
	    if(wlc.spectra!==undefined)
		wlc.selspec=wlc.spectra[specsel.value];
	    //setup_selspec();
	}
	this.ss=sin;
	//specview.redraw();
    });
    
    // color.listen('change', function(selspec){
    // 	setup_selspec();
    // 	//specview.redraw();
    // });



    

    wlc.set_sv=function(sv){
	this.sv=sv;
    }

    var pdeg=wlc.get('pdeg');
    var exec=wlc.get('exec');
    var view=wlc.get('view');
    var fit_eq=wlc.get('fit_eq');
    var calib_func=wlc.get('calib_func');
    var control=wlc.get('control');
    
    // var fitp=wlc.fitp=[];

    // wlc.read_fitp=function(){
    // 	for(var fpe in fit_params.elements){
    // 	    fitp.push(fit_params.elements[fpe].value);
    // 	}
    // 	console.log("FP deserialize !" + JSON.stringify(fitp));
    // }
    
    // wlc.read_fitp();
    
    wlc.calib_func=function(x){
	return calib_func.func(x);
    }

    exec.listen('click', function(){

	var fit_points=[];

	if(wlc.selspec===undefined){
	    if(wlc.spectra!==undefined)
		wlc.selspec=wlc.spectra[specsel.value];
	}

	if(wlc.selspec!==undefined){
	    var fl=wlc.selspec.get('feature_list');
	    
	    for (var fi in fl.elements){
		var f=fl.elements[fi];
		fit_points.push([f.val('pixel'),f.val('wl')]);
	    }
	}

	
	
	console.log("Fitting pdeg=" + pdeg.value);

	var result = regression('polynomial', fit_points, pdeg.value*1.0);
	console.log("Fit result : " + JSON.stringify(result));

	calib_func.elements.params.set_value(result.equation);
	
	fit_eq.set_value(result.string);

	// if(fit_params.ui_childs !== undefined){
	//     if(fit_params.ui_childs.div!==undefined)
	// 	fit_params.ui_childs.div.innerHTML="";
	// }
	// fit_params.elements={};

	if(view.value===undefined){
	    var pp=view.add_plot_points(fit_points, 'Data points',{ stroke : "purple", stroke_width : "1px", label : "Data points"});
	    var pf=view.add_plot_func(calib_func.func ,{ label : "Fit func", stroke : "springgreen", stroke_width : "1px"});
	}else view.redraw();
	

	// for(var i=0;i<fitp.length;i++){
	//     var fpui=create_widget({ name : 'x<sup>'+i+'</sup>', type : "double", value : fitp[i]} );
	//     fpui.fit_id=i;
	//     fit_params.add_child(fpui);
	//     fpui.listen('change', function(v){ fitp[this.fit_id]=v; pf.redraw(); } )
	// }
	

    });
    
}


template_ui_builders.videocap=function(ui_opts, vc){

    console.log("Videocap constructor !");
    //var main_node=vc.ui=ce("div"); main_node.class_name="container-fluid";
    //var video=vc.get("video");

    var camview=vc.get("camview");
    var camwin=vc.get("camwindow");
    var spectrum=vc.get("spectro");
    var spectro_view=vc.get("specview").elements.view;//spectrum;

    //var options=vc.get('setup');

    var spectro_opts=vc.get('box').elements;
    var controls=vc.get('left');
    var spectro_box=vc.get('region').elements;

    var dir=vc.get("dir");

    var butts=vc.get('butts').elements;
    var start=butts.start;
    var stop=butts.stop;

    var video_options=vc.get('video');
    var processing_options=vc.get('processing').elements;
    var device=video_options.get('device');

    var resolution=video_options.elements.resolution;
    var sampling=processing_options.sampling;

    var integ=processing_options.integrate.elements.enable;
    var integ_nf=processing_options.integrate.elements.nframes;

    var save_spec=spectrum.get("save");
    var specname=spectrum.get("specname");

    
    var spectra=vc.get("spectra");
    //var btns=cc("div",video.ui_root); btns.className="btn-group btn-group-lg";    

    var video_container=cc("div",camwin.ui_root);
    var spectro_win;

    var wlc=vc.get('wlc');
    
    //wlc.set_sv(spectro_view);
    
    var have_wlc = wlc.get('calib_func').elements.params.value.length>0;
    
    save_spec.listen("click",function(){
	var new_spec=tmaster.build_template('spectrum');
	var date_obs=new Date();
	
	
	if(specname.value && specname.value!==""){
	    new_spec.name=specname.value;
	}else
	    new_spec.name="Spectrum @ "+date_obs.toLocaleString();
	
	//console.log("Specname is " +  new_spec.name + " DATE " + date_obs );
	new_spec.parent=spectra;

	specname.set_value("");
	create_ui({},new_spec);

	var view=new_spec.get('view');

	new_spec.set('target',spectrum.val('target'));
	new_spec.set('date_obs',date_obs);

	
	new_spec.update_plot(spec_data);
	spectra.add_child(new_spec, new_spec.name);

	//new_spec.elements.keys.elements.target.item_ui.innerHTML="BEN QUOIIII";//.set_value("TOTOTOTOOT");
	//new_spec.elements.keys.elements.target.set_value("TOTOTOTOOT");
	    //ui.innerHTML="BEN QUOIIII";//

	wlc.trigger('update_spectra', spectra.elements);
	
	
    });

    spectra.listen('load', function(){
	console.log("Spectra load event !!!!!");
	wlc.trigger('update_spectra', spectra.elements);
    });
    
    
    video_container.style.position="relative";
    video_container.style.marginTop="1em";

    video_container.className="panel panel-default";

    var video_node=cc("video",camview.ui_root);
    video_node.setAttribute("autoplay",true);
    video_node.style.display="none";
    var canvas=cc("canvas",video_container);

    
    var stream = null;

    var ctx = canvas.getContext('2d');

    var per=null;

    function video_error(title,msg){
	if(!per) per=ce("p");controls.ui_root.appendChild(per);
	per.innerHTML='<p class="alert alert-danger"> <strong>'+title+'</strong>'+msg+'</p>';
	
    }
    
    
    var errorCallback = function(e) {
	camview.debug('Capture error : ' + e);
    };
    
    video_node.addEventListener("loadeddata", function(){
	
	var iv=setInterval(function(){
	    if(video_node.videoWidth!==0){
		canvas.width= video_node.videoWidth;
		canvas.height=video_node.videoHeight;
		if(!spectro_win.moving)
		    set_box_size();


		//console.log("LOADED ! canvas w = %d video w = %d",canvas.width,video_node.videoWidth);
		clearInterval(iv);
	    }
	    
	}, 100);

    });

    wlc.trigger('update_spectra', spectra.elements);

    var videoSource = null;
    var iv_cap;
    var iv_video;

    stop.disable(true);
    start.disable(true);

    
    stop.listen("click",function(){
	
	if(iv_cap){
	    clearInterval(iv_cap);
	    clearInterval(iv_video);
	}
	
	if (stream) {
	    stream.stop();
	    stream=null;
	}
	//camview.hide(true);
	video_options.disable(false);

	start.disable(false);
	stop.disable(true);

	// var types={};
	// for(var b in template_ui_builders){
	//     if(ù(tmaster.templates[b])){
	// 	types[b]={}
	//     }
	// }
	//console.log(JSON.stringify(types));

    });

    
    if (!navigator.getUserMedia) {
	controls.debug("Oh No! It seems your browser doesn't support HTML5 getUserMedia.");
	video_options.disable();
    }else{

	if (typeof MediaStreamTrack === 'undefined' ||
	    typeof MediaStreamTrack.getSources === 'undefined') {
	    controls.debug("This browser does not support MediaStreamTrack. You cannot choose the input device. Try Chrome.");
	    video_options.disable();
	    start.disable(false);
	} else {
	    start.disable(false);
	    
	    MediaStreamTrack.getSources(function(sourceInfos) {
		var audioSource = null;
		

		var source_options=[];
		var vi=0;
		for (var i = 0; i != sourceInfos.length; ++i) {
		    var sourceInfo = sourceInfos[i];
		    if (sourceInfo.kind === 'audio') {
			//console.log(sourceInfo.id, sourceInfo.label || 'microphone');
			//audioSource = sourceInfo.id;
		    } else if (sourceInfo.kind === 'video') {
			vi++;
			//console.log("VIDEO : " + JSON.stringify(sourceInfo));
			//console.log(sourceInfo.id, sourceInfo.label || 'camera');
			source_options.push({ label : sourceInfo.label || ('Camera ' +vi) , value : sourceInfo.id});
			if(vi===1)videoSource = sourceInfo.id;
			
		    } else {
			console.log('Some other kind of source: ', sourceInfo);
		    }
		}
		//console.log("Set dev options   "  + JSON.stringify(source_options));
		device.set_options(source_options);
		//sourceSelected(audioSource, videoSource);

		device.listen("change", function(id){
		    videoSource=device.value;
		});
		
	    });
	}
    }




	
	// var svgns = "http://www.w3.org/2000/svg";
	// var svgt= //ce("svg");
	//     document.createElementNS(svgns, "svg"); //
	// svgt.setAttribute("width","120");
	// svgt.setAttribute("height","120");
	// svgt.setAttribute("viewPort","0 0 120 120");
	// //svgt.setAttribute("version","1.1");
	// //svgt.setAttribute("xmlns","http://www.w3.org/2000/svg");
	
	// var spec_svgroot=    spectro_view.svg_node;
	
	// //svgt.innerHTML='<line x1="20" y1="100" x2="100" y2="20" stroke="black"  stroke-width="2"/>' ;//'<circle r="50" cx="50" cy="50" fill="green"/>';
	
	// var spectrum_line= document.createElementNS(svgns, "line"); //ce("line");
	
	// spec_svgroot.style.border="2px solid purple";
	
	// spectrum_line.setAttribute('x1',0);
	// spectrum_line.setAttribute('y1',0);
	// spectrum_line.setAttribute('x2',0);
	// spectrum_line.setAttribute('y2',100);
	
	// spectrum_line.setAttribute('stroke','black');
	// //spectrum_line.setAttribute('fill','black');
	// spectrum_line.setAttribute('stroke-width','2');
	
	// context.appendChild(spectrum_line);
	// //    window.addEventListener("load", function(){
	// //    vc.ui_root.appendChild(svgt);
	// //  });
	
	
	// spectrum_line.addEventListener('click', function(){
	//     alert("Coucou !");
	// });
	
	
	
	function iv_freq(f, freq){
	console.log("Setting frame iv to : " + 1000.0/freq + " ms");
	return setInterval(f, 1000.0/freq);
    }
    
    function setup_buffer_loop(){
	if(è(iv_cap))clearInterval(iv_cap);
	iv_cap=iv_freq(function(){
	    process_frame();
	}, sampling.value );
    }
    
    sampling.listen("change", function(v){
	if(stream!=null)
	    setup_buffer_loop();
    });
    
    start.listen("click",function(){
	
	//camview.hide(false);
	var hd_constraints = {
	    audio: false,
	    video: {
		optional: [{
		    sourceId: videoSource
		}],
		mandatory: {
		    minWidth: 1280,
		    minHeight: 720,
		}
	    }
	};

	var vga_constraints = {
	    audio: false,
	    video: {
		optional: [{
		    sourceId: videoSource
		}],
		mandatory: {
		    minWidth: 640,
		    minHeight: 480,
		}
	    }
	};

	var constraints = resolution.value==="HD" ? hd_constraints : vga_constraints;
	
	console.log("Start video source... ("+resolution.value+")" + JSON.stringify(constraints));

	
	navigator.getUserMedia(constraints, function(stream_in) {
	    video_node.src = window.URL.createObjectURL(stream_in);
	    stream=stream_in;
	    
	    //console.log("cavas w = %d video w = %d",canvas.width,video_node.innerWidth);
	    var iv_delay=200; //integ.value? 100 : 100;

	    if (stream) {
		setup_buffer_loop();
	    }
	    video_options.disable(true);
	    start.disable(true);
	    stop.disable(false);
		
	}, errorCallback);
    });
    
    function get_box(){
	return [
	    spectro_box.x.value,
	    spectro_box.y.value,
	    spectro_box.w.value,
	    spectro_box.h.value
	];
    }
    
    function slice_arrays(){
	var box=get_box();
	
	var ddim= dir.value==0 ? box[3] : box[2];
	//console.log("Slicing [" + bx + ","+ by+ "," + bw+ "," + bh + "]to ddim="+ddim + " dir = " + dir.value);
	if(ddim < spec_data.r.length){
	    pr.data=spec_data.r=spec_data.r.slice(0, ddim);
	    pg.data=spec_data.g=spec_data.g.slice(0, ddim);
	    pb.data=spec_data.b=spec_data.b.slice(0, ddim);
	    pt.data=spec_data.t=spec_data.t.slice(0, ddim);

	    //spectro_view.config_range(true, true);
	    //console.log("Resized !! ddim=" + ddim + " SL " + spec_data.r.length + " bh " + bh );
	}
	if(seq==0)
	    set_box_size();
	
	process_spectrum();
	spectro_view.config_range(true, true);
	
    }
    
    function set_box_size(){
	var scale=[canvas.clientWidth/canvas.width,canvas.clientHeight/canvas.height];
	var box=get_box();
	//console.log("Canvas  " + canvas.clientWidth);

	//w.widget_div.style.transform="scale("+scale[0]+","+scale[1]+")";

	spectro_win.widget_div.style.left=scale[0]*box[0]+"px";
	spectro_win.widget_div.style.top=scale[1]*box[1]+"px";
	spectro_win.widget_div.style.width=scale[0]*box[2]+"px";
	spectro_win.widget_div.style.height=scale[1]*box[3]+"px";
	
    }

    
    for(var be in spectro_box){
	spectro_box[be].listen("change",function(){
	    //draw_spectrum_box();
	    set_box_size();
	    slice_arrays();
	    //process_spectrum();
	    spectro_view.config_range();	    
	});
    };
    
    // function draw_spectrum_box(){
	

    // 	if(ù(w)){
    var c5=canvas.width/5.0;
    spectro_win=new widget({ x: 2*c5, y: 5, w : c5, h : canvas.height-5});
    spectro_win.widget_div.style.position="absolute";
    video_container.appendChild(spectro_win.widget_div);
    set_box_size();
    
    dir.listen("change",function(){
	//console.log("Dir changed !");

	var b=get_box();
	
	spectro_box.w.set_value(b[3]);
	spectro_box.h.set_value(b[2]);
	
	slice_arrays();
    });
    
    spectro_win.listen("resize", function(sz){
	//console.log("Resize [" +dir.value+"] !! " + JSON.stringify(sz) + " SL " + spec_data.r.length + " bh " + bh);
	
	//buf_data=[];
	//spec_data={r : [], g: [], b : [], t : [] };
	var scale=[canvas.clientWidth/canvas.width,canvas.clientHeight/canvas.height];
	
	spectro_box.x.set_value(Math.ceil(sz.x/scale[0]));
	spectro_box.y.set_value(Math.ceil(sz.y/scale[1]));
	spectro_box.w.set_value(Math.ceil(sz.w/scale[0]));
	spectro_box.h.set_value(Math.ceil(sz.h/scale[1]));
	
	slice_arrays();
	//create_plots();
	
    });
    //	}

	//console.log("Spectrum box %d %d %d %d",bx,by,bw,bh );

	/*
	ctx.beginPath();
	ctx.strokeStyle="orange";
	ctx.rect(bx,by,bw,bh);
	ctx.stroke();
	ctx.closePath();
*/

//    }

    var spec_data={r : [], g: [], b : [], t : [] };
    var pr,pg,pb,pt;
    
    function create_plots(){
	spectro_view.value=[];

	if(have_wlc){
	    pr=spectro_view.add_plot(spec_data.r, global_wlc.calib_func);
	    pg=spectro_view.add_plot(spec_data.g, global_wlc.calib_func);
	    pb=spectro_view.add_plot(spec_data.b, global_wlc.calib_func);
	    pt=spectro_view.add_plot(spec_data.t, global_wlc.calib_func);

	    spectro_view.xlabel="Wavelength (Å)";
	}else{
    	    pr=spectro_view.add_plot_linear(spec_data.r,0,1);
	    pg=spectro_view.add_plot_linear(spec_data.g,0,1);
	    pb=spectro_view.add_plot_linear(spec_data.b,0,1);
	    pt=spectro_view.add_plot_linear(spec_data.t,0,1);

	    spectro_view.xlabel="Wavelength (pixels)";
	}

	spectro_view.ylabel="Intensity (ADU)";
	
	pr.set_opts({ stroke : "#ff0000", stroke_width : ".5px", label : "Red"});
	pg.set_opts({ stroke : "#10ee08", stroke_width : ".5px", label : "Green"});
	pb.set_opts({ stroke : "#0000ff", stroke_width : ".5px", label : "Blue"});
	pt.set_opts({ stroke : "#aa08dd", stroke_width : "1px", label : "Mean"});
	

	
    }	
    //vc.ui_root.style.position="relative";
    //slice_arrays();
    create_plots();
    //set_box_size();    
    
    var frid=0;
    var buf_data=[];
    var seq=0;

    function process_spectrum(){

//	draw_spectrum_box();
	
	var box=get_box();
	var bx=box[0]*1.0,by=box[1]*1.0,bw=box[2]*1.0,bh=box[3]*1.0;

	var ddir=dir.value==0 ? false : true; //dir.ui.selectedIndex;
	//console.log("process spectrum ddir = " + ddir + " dv = " + dir.value);
	if(ddir){
	    for(var i=0;i<bw;i++){
		spec_data.r[i]=0;
		spec_data.g[i]=0;
		spec_data.b[i]=0;
		for(var j=0;j<bh;j++){
		    var idx=((j+by)*canvas.width + (i+bx))*4;
		    spec_data.r[i]+= buf_data[ idx ];
		    spec_data.g[i]+= buf_data[ idx+1 ];
		    spec_data.b[i]+= buf_data[ idx+2 ];
		    // if(i===0 && j===0)
		    //     console.log(buf_data[ idx ] + ", " + buf_data[ idx+1 ]+ ", " +buf_data[ idx+2 ]);
		}
		spec_data.r[i]/=bh*1.0;
		spec_data.g[i]/=bh*1.0;
		spec_data.b[i]/=bh*1.0;
		
		spec_data.t[i]=(spec_data.r[i]+spec_data.g[i]+spec_data.b[i])/3.0;
	    }
	}else{
	    for(var i=0;i<bh;i++){
		spec_data.r[i]=0;
		spec_data.g[i]=0;
		spec_data.b[i]=0;

		for(var j=0;j<bw;j++){
		    var idx=Math.floor(((i+by)*canvas.width + (j+bx))*4);
		    spec_data.r[i]+= buf_data[idx];
		    spec_data.g[i]+= buf_data[idx+1];
		    spec_data.b[i]+= buf_data[idx+2];
		    // if(i===0 && j===0)
		    //     console.log(buf_data[ idx ] + ", " + buf_data[ idx+1 ]+ ", " +buf_data[ idx+2 ]);
		}
		spec_data.r[i]/=bw*1.0;
		spec_data.g[i]/=bw*1.0;
		spec_data.b[i]/=bw*1.0;
		
		spec_data.t[i]=(spec_data.r[i]+spec_data.g[i]+spec_data.b[i])/3.0;
	    }
	    
	    //console.log("SPEC["+JSON.stringify(spec_data.r)+"]");
	    
	}

	spectro_view.value[0].data=spec_data.r.slice();
	spectro_view.value[1].data=spec_data.g.slice();
	spectro_view.value[2].data=spec_data.b.slice();
	spectro_view.value[3].data=spec_data.t.slice();

	
	if(frid===0)
	    spectro_view.config_range(true, true);
	else{
	    spectro_view.config_range(false, true);
	    //spectro_view.redraw();
	}
	
	frid++;
    }
    
    function process_frame(){
	//console.log("draw spectrum Canvas w,h %d %d bufferL=%d" ,canvas.width,canvas.height,buf_data.length);

	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	ctx.drawImage(video_node, 0, 0);
	
	var buf = ctx.getImageData(0,0,canvas.width,canvas.height);
	var inf=integ_nf.value*1.0;
	//console.log("process frame in " + JSON.stringify(box));
	
	if(integ.value>0){
	    
	    if(seq>=inf){
		for(var i=0;i<buf_data.length;i++) buf_data[i]/=inf;
		seq=0;
	    }else{
		if(seq===0){
		    buf_data=[];
		    for(var i=0;i<buf.data.length;i++) buf_data[i]=buf.data[i];
		}else
		    for(var i=0;i<buf.data.length;i++) buf_data[i]+=buf.data[i];
		//console.log("Integ " + seq + "/" + integ_nf.value);
		seq++;
		//draw_spectrum_box();
		return;
	    }
	}else{
	    buf_data=buf.data;
	}
	
	process_spectrum();
    }

    
    return vc.ui;
};

(function(){
    sadira.listen("ready",function(){
	console.log("adding videocap templates");
	//    window.addEventListener("load",function(){
	tmaster.add_templates(videocap_templates);

    });
})();
