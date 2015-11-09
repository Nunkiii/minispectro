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
Converted to JS for WebSpectro, 2015
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

    lvtest : {
	name : "LV TEST",
	elements : {
	    lv : {
		name : "LabVec Test : ",
		type : 'labelled_vector',
		ui_opts : { editable : true, label : true },
		//value_labels : ["x","y","z"],
		label_prefix : 'X'
	    }
	},
	widget_builder : function (uio, lvt){
	    var lv=lvt.get('lv');
	    lv.listen('change', function(){
		lvt.debug("LV changed : " + JSON.stringify(this.value));
	    });

	    lv.set_value([3,4,5]);
	}
	
    },

    
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
	plot_type : 'pixel',
	ui_opts : {
	    fa_icon : "magnet",
	    name_edit : true,
	    //editable : true, edited : false,
	    //name_node : "h4",
	    child_classes : ['container-fluid'],
	    //child_view_type : 'table',
	    
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
		ui_opts : {
		    //item_classes : ["full_width"],
		    editable: true, label : true
		}
	    },
	    pixel : {
		name : "Pixel",
		//subtitle : "Image pixel space position",
		type : "double",
		min : 0, max : 20000, step : 1.0,
		value : 0,
		ui_opts : { editable : true, label : true}
	    }
	},

	widget_builder : function (ui_opts, feature){
	    var deltatext=20;

	    feature.draw=function(context, view){
		var lineg = context.append('g');
		var label_text=feature.name; 

		var lineval=feature.get(feature.plot_type);
			//var sv=this; //spectro_view;
		var r=view.xr;
		var w=view.width;
		//var ar=view.vw/r[1];
		var m=lineval.value===undefined? w/2.0 : // pixel.value/r[1]*w; //(r[1]-r[0])/2.0*w;
		    view.xscale(lineval.value);
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
		    //var last = e.pageX;
		    var last = e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;

		    var svgn=view.svg.node();
		    var cw=svgn.clientWidth || svgn.parentNode.clientWidth;
		    var ar= cw/view.vw ;

		    //console.log("DRAG BEGIN " + last + " xlast " + xlast +  " ar " + ar + " vw " + view.vw + " cw = " + cw );

		    document.documentElement.add_class('dragging');
		    document.documentElement.addEventListener('mousemove', on_move, true);
		    document.documentElement.addEventListener('mouseup', on_up, true);
		    
		    function on_move(e) {
			
			e.preventDefault();
			e.stopPropagation();
			
			var pos= e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			var delta = pos - last;
			//last = pos;
			var newp = xlast*1.0+delta/ar;
			
			//console.log("DELTAPOS : " + delta + " newp " + newp + " AR " + ar);
			//var x1=spectrum_line.attr('x1');
			spectrum_line.attr('x1',newp);
			//var x2=spectrum_line.attr('x2');
			spectrum_line.attr('x2',newp);
			label.attr('x',newp-deltatext);
			
			lineval.set_value(r[0]+newp/w*(r[1]-r[0]));
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
	    toolbar_brand : true,
	    default_child : 'none',
	    //debug : true
	    //root_classes : ['container-fluid'],
	    //toolbar_brand : true
	    //save : "spectrum"
	},
	toolbar : { ui_opts : { toolbar_classes : ["navbar navbar-default"]} },
	
    elements : {

	
	keys : {
		name : "Meta-data",
		ui_opts : {
		    root_classes : ["container-fluid panel panel-default"],
		    child_classes : ["container-fluid"],
		    fa_icon : 'list'
		    //render_name : false
		},
	    elements : {
		// sacha : {
		//     name : "Test Truc Sacha",
		//     type : "action",
		//     widget_builder : function(){
		// 	this.listen('click', function(){
		//     alert("Bouton clické");
		// 	});
		//     }
		// },
		
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
			    label : true,
			    editable : true
			}
		    }
		}
	    },
			
	    lines :  {
		name : "Spectral features",
		intro : "<strong>Emission or absorption line</strong><p>First parameter is the physical wavelength of the feature, in Å. The second parameter, is the pixel space position of the same feature.</p>",
		ui_opts : {
		    fa_icon : "magnet",
		    //root_classes : ["container-fluid"],
		    child_view_type : "tabbed",
		    child_node_type : "form",
		    default_child : 'none'
		},
		toolbar : { ui_opts : { toolbar_classes : ["navbar-default"] }},
		elements : {
		    new_line : {
			name : "Hg line",
			intro : "<p>Add a mercury emission line from the list of strong emission lines :</p>",
			ui_opts : {
			    fa_icon : "plus",
			    root_classes : ["container-fluid col-xs-12"],
			    child_node_type : "form",
			    child_classes : ["form-horizontal col-xs-12 vertical_margin"],
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
			
		    	name : "Custom feature",
			intro : "<ul><li>Edit feature's name.</li><li> Setup the wavelength in Å and eventually the pixel position of the new spectral feature, pixel position can also be changed by dragging the feature line in the spectrum's plot.</li> <li>Click 'Add feature' button to add the feature to the list</li></ul>",
			ui_opts : {
			    //intro_stick : true,
			    fa_icon : "plus",
			    root_classes : ["container-fluid"],
			    child_node_type : "form",
			    child_classes : ["form-inline container-fluid col-md-offset-1 col-md-10"],
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
				type : 'spectrum_feature',
				elements : {
				    add_custom_feature :   {
					name:  "Add feature", type : "action",
					ui_opts:{
					    root_classes : "inline",
					    wrap : true,
					    wrap_classes : ["text-right"],
					    item_classes : ["btn btn-info"],
					    fa_icon : "plus"
					    
					}
				    }
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
			//type : 'container',
			ui_opts : {
			    //name_node : 'h3',
			    child_view_type : "table",
			    fa_icon : "reorder"
			}
		    }
		}
	    },

	    calib : {
		name : "Calibration",
		ui_opts : {
		    root_classes : ["col-xs-12"],
		    child_classes : ["container-fluid"],
		    fa_icon : "dashboard"
		},
		elements : {
		    calib_enable : {
			name : "λ calibration",
			type : 'bool',
			value : false,
			ui_opts : { label : true, type : 'edit', root_classes : "vertical_margin full_padding" }
		    },
		    calib_func : {
			//name : "Enable wavelength calibration",
			type : 'polynomial',
			
			//value : false,
			//name : "No calibration available",
			ui_opts : {
			    save : 'Polynomials',
			    root_classes : 'panel panel-default vertical_margin full_padding'
			    // label : true,
			    // type : "edit"
			},
			widget_builder : function(uio, status){
			    //status.disable();
			}
		    }
		}
	    },
	    
	    view : {
		name : "Spectrum plot",
		type : "vector",
		ui_opts : {
		    in_root : 'append',
		    cursor_shape : 'vertical',
		    //name_node : "h3",
		    //name_node : "strong",
		    show_cursor : true,
		    enable_selection : false,
		    enable_range : false,
		    //sliding : true,
		    //slided : true,
		    render_name : false,
		    root_classes : ["vertical_margin"]
		}
	    }
	},
	
	widget_builder : function(){
	    var  spectrum=this;
	    console.log("spectrum widget_builder : Building spectrum : " + spectrum.name);

	    //    console.log("spectrum ui_builders : Building spectrum : " + spectrum.name);
	    //template_ui_builders.vector(ui_opts, spectrum);
	    var view=spectrum.get('view');
	    var calib_func=spectrum.get('calib_func');
	    var calib_enable=spectrum.get('calib_enable');
	    
	    var select_line=spectrum.get('select_line');
	    var add_line=spectrum.get('add_line');
	    var flist=spectrum.get('feature_list');
	    var new_line=spectrum.get('new_line');
	    var lines=spectrum.get('lines');
	    
	    var add_custom_feature=spectrum.get('add_custom_feature');
	    var calib_params=calib_func.get('params');


	    view.get('btns').add_child(calib_enable, 'calib_enable');
	    calib_enable.ui_root.add_class('inline');

	    view.hide(true);
	   
	    //calib_enable.set_title("λ calibration");

	    // vec.serialize=function(){
	    // 	var v=[];
	    // 	vec.value.forEach(function(p){
	    // 	    v.push({ data : p.data, args: p.args, opts: p.opts}  );
	    // 	});
	    // 	return v;
	    // }
	    
	    spectrum.deserialize=function(v){
	    	//console.log("Spectrum deserialize " + JSON.stringify(v));
		flist.clear_childs();
		spectrum.value=v;
		
	    	spectrum.update_plot(v);
	    }
	    
	    calib_enable.listen('change', function(){
		console.log("Calib enable set to " + calib_enable.value);
		spectrum.update_plot();
	    });

	    
	    
	    spectrum.update_plot=function(spec_data_in){

		if(spec_data_in!==undefined)
		    spectrum.value=spec_data_in;

		var spec_data=spectrum.value;
		if(spec_data===undefined) return;

		view.value=view.plots=[];
		view.get('lines').clear_childs(); //lines.elements={};
		
		view.plots=[];
		var pr,pg,pb,pt;
		view.ylabel="Intensity (ADU)";
		
		if(calib_enable.value===true){

		    for(var f in flist.elements) flist.elements[f].plot_type='wl';
		    
		    pr=view.add_plot(spec_data.r,calib_func.func);
		    pg=view.add_plot(spec_data.g,calib_func.func);
		    pb=view.add_plot(spec_data.b,calib_func.func);
		    pt=view.add_plot(spec_data.t,calib_func.func);

		    view.xlabel="Wavelength (Calibrated, Å)";

		    if(view.ui_opts.show_cursor===true){
			view.cursor.value_labels=['λ (Å)','I (ADU)'];
			view.cursor.rebuild();
		    }
		}else{
		    for(var f in flist.elements) flist.elements[f].plot_type='pixel';
		    
		    pr=view.add_plot_linear(spec_data.r,0,1);
		    pg=view.add_plot_linear(spec_data.g,0,1);
		    pb=view.add_plot_linear(spec_data.b,0,1);
		    pt=view.add_plot_linear(spec_data.t,0,1);

		    view.xlabel="Wavelength (Uncalibrated, pixels)";
		    if(view.ui_opts.show_cursor === true){
			view.cursor.value_labels=['Pixel','I (ADU)'];
			view.cursor.rebuild();
		    }
		}
		//
		pr.set_opts({ stroke : "#ff0000", stroke_width : ".5px", label : "Red"});
		pg.set_opts({ stroke : "#10ee05", stroke_width : ".5px", label : "Green"});
		pb.set_opts({ stroke : "#0202ee", stroke_width : ".5px", label : "Blue"});
		pt.set_opts({ stroke : "#6020cc", stroke_width : "1px", label : "Mean"});

		view.config_range();
		view.hide(false);
	    }
	    
	    
	    calib_params.listen('change', function() { spectrum.update_plot();});

	    
	    select_line.options=[];
	    hg_lines.forEach( function( line, i ){
		
		select_line.options.push( { value : i, label : line[2] + " : " + line[1] + " Å" });
		//line[0]
	    });


	    // console.log("prop in " + select_line.name);
	    // for(var p in select_line)
	    // 	console.log("prop " + p);
	    
	    select_line.set_options();
	    
	    //line_table.value=[];
	    
	    function check_line(l){
		
		for(var f in flist.elements){
		    
		    if(flist.elements[f].val('wl')==l){
			lines.debug("The wavelength " + l + " is already in the table !");
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
		    var fe=create_widget('spectrum_feature', flist);
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
		    
		    var fe=create_widget('spectrum_feature', flist);
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
		var i=0;
		for(var fe in flist.elements ){
		    var feature=flist.elements[fe];
		    feature.draw(context, view);
		}
	    });
	    
	    
	}
    },

    tbase : {
	name : "Tbase",
	elements : {
	    toto : { name : "Xbase1", type : 'string', value : "Toto"},
	    toto2 : { name : "Xbase2", type : 'color', value : "#1213aa"}
	},
	ui_opts : {fa_icon : 'cogs', root_classes : ["container-fluid"]},
	widget_builder : function(){
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
	widget_builder : function(){
	    sspec.debug("Child constructor !");
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
	    root_classes : ['container-fluid'],
	    // name_classes : ['panel-heading'],
	    //name_node : 'div',
	    
	    save : 'Polynomials',
	    child_classes : 'container-fluid',
	    fa_icon : 'superscript',
	    //child_view_type : 'table'
	},
	elements : {
	    pdeg : {
		name : "Polynomial degree",
		type : "double",
		min : 0,
		max : 10,
		step : 1,
		ui_opts : {
		    editable : true,
		    //type : 'edit',
		    label : true,
		    //item_classes : 'inline',
		    root_classes : ["list-group-item"]
		},
		default_value : 1
	    },
	    
	    params : {
		ui_opts:{
		    //child_view_type : '',
		    editable : true,
		    //type : 'edit',
		    label : true,
		    root_classes : ["list-group-item vertical_margin"],
		    child_classes : 'inline'
		},
		value : [0,1],
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

		params.set_value(value);
		//console.log("Reset d="+d + " vl " + value.length );
		
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
	    
	    p.reset();
	}
    },
    
    
    wlc : {
	name : "λ calibration",
	intro : "<p>The webcam CCD records the spectra as a 2D image. The spectrograph should be constructed to assure that the color direction of the spectrum image is projected parallel to a CCD direction to simplify image processing. Along that direction, each pixel correspond to a different physical colour, hence a different light's wavelength.</p><p>To be able to associate a pixel index with a physical wavelength, a <em>calibration spectrum</em> must be used to identify the pixel-space position of a certain number of spectral features whose wavelength is known, and use these points to build a model, in this case a polynomial function, to interpolate the colour for every pixel position.</p>",
	subtitle : "From pixel scale to physical wavelength",
	ui_opts : {
	    intro_title : "Wavelength calibration",
	    //render_name : true,
	    //child_view_type : 'div',
	    //name_node : 'h2',
	    root_classes : ["container-fluid"],
	   // child_classes : ["row"],
	    //intro_stick : true
	},
	elements : {
	    // input : {
	    // 	ui_opts : {
	    // 	    //root_classes : ["col-sm-6 vertical_margin"],
	    // 	    root_classes : ["container-fluid"],
	    // 	    child_classes : ["row"]
	    // 	},
	    // 	elements : {
		    // config_poly : {
		    // 	ui_opts : {
		    // 	    root_classes : ["col-sm-6"],
		    // 	    intro_stick : true
		    // 	},
		    // 	name : "1 - Choose polynomial degree",
			
		    // 	elements : {
		    calib_func : {
			type : 'polynomial',
			name : "Polynomial model",
			intro : "<p><strong class='text-danger big'><it class='fa fa-exclamation-triangle'></it> - Save your fit result</strong><p> When you are satisfied with the fitted parameters, don't forget to save your model by clicking the <it class='fa fa-save text-success'></it> button </p></p>",
			elements : {
			    pdeg : {
				ui_opts : {type: 'edit', intro_title : "Choose the degree of the model polynomial function", intro_stick : true },
				intro : ""
			    } 
			},
			ui_opts : {
			    root_classes : ["col-sm-6"],
			    child_classes : ["container-fluid"],
			    //name_classes : ["panel-heading"],
			    //child_classes : ["panel-content"],
			    intro_stick : true,
			    //name_node : 'div',
			    save : "Polynomials"
			    
			}
			//     }
			
			// }
		    },
		    specsel : {
			name : "Select spectrum and fit",
			type : "object_loader",
			intro : "The selected spectrum should contain at least as many identified features as the polynome degree + 1.",
			collection : "spectra",
			ui_opts : {
			    intro_stick : true,
			    intro_title : "Choose a spectrum",
			    item_classes : ['big_vertical_margin'],
			    root_classes : ['col-sm-6'],
			    child_classes : ['container-fluid vertical_margin']
			},
			elements : {
			    name : {
				
				ui_opts : {
				    root_classes : ["container-fluid big_vertical_margin"],
				    
				},
				
			    },
			    exec :  {
				type : 'action',
				name : 'Fit datapoints',
				ui_opts:{
				    fa_icon : "cogs",
				    wrap: true, wrap_classes : "text-center",
				    root_classes : ["well container-fluid"],
				    item_classes : ["btn btn-primary"]
				}
			    },
			    view : {
				name : "Fit plot",
				type : 'vector',
				ui_opts : {
				    fa_icon : 'trophy',
				    enable_range : false,
				    enable_selection : false,
				    root_classes : [' container-fluid'],
				    child_classes : ['container-fluid'],
				    //root_classes : ['container-fluid col-md-6 col-xs-12'],
				    //item_classes : ['container-fluid']
			    
				},
				elements : {
				    fit_eq : {
					name : "Equation: ",
					type : "string",
					default_value : "No equation",
					ui_opts : {
					    label : true,
					    root_classes : ["col-sm-12"]
					}
					
				    },
				    
				}
			    }
			    
		    // 	}
		    // },
			    
		}
	    },

	    // exec_box : {
	    // 	ui_opts : {
	    // 	    //root_classes : ["col-sm-6 vertical_margin"],
	    // 	    root_classes : ["container-fluid"],
	    // 	    child_classes : ["container-fluid"],
	    // 	    fa_icon : "cogs"
	    // 	},
	    // 	name : "3 - Compute fit",
		
	    // 	elements : {
		    
		    
		    
	    // 	}
	    // },
	    
	    
	    
	},
	widget_builder : function(){

	    var wlc=this;

	    var pdeg=wlc.get('pdeg');
	    var exec=wlc.get('exec');
	    var fit_eq=wlc.get('fit_eq');
	    var fit_params=wlc.get('params');
	    var calib_func=wlc.get('calib_func');
	    var control=wlc.get('control');
	    var view=wlc.get('view');
	    //var exec_box=wlc.get('exec_box');
	    
	    var fit_points=[];

	    function get_fit_points(spectrum){
		fit_points=[];
		
		var fl=spectrum.get('feature_list');
		    
		for (var fi in fl.elements){
		    var f=fl.elements[fi];
		    fit_points.push([f.val('pixel'),f.val('wl')]);
		}
		return fit_points;
	    }
	    
	    exec.disable();
	    view.hide(true);
	    
	    wlc.get('specsel').listen('load_doc', function(doc){
		spectrum=create_widget('spectrum');
		doc.store_deserialize({ object : spectrum });
		get_fit_points(spectrum);
		//this.message("Loaded spectrum [" + spectrum.name + "]", { type : 'success', title : 'Done', last : 2000});
		
		if(pdeg.value<fit_points.length){
		    this.elements.name.message("Spectrum has " + fit_points.length + " features.", { type : 'success', title : "Ok"});
		    
		    exec.disable(false);
		}else{
		    this.elements.name.message("Not enough features,  Need at least " + (pdeg.value*1.0+1) , { type : 'danger', title : fit_points.length + " features", last : 4000});
		    exec.disable();
		}
		
	    });
	    
	    // wlc.set_sv=function(sv){
	    // 	this.sv=sv;
	    // }
	    
	    // //exec_box.disable();
	    // //view.disable();

	    // wlc.calib_func=function(x){
	    // 	return calib_func.func(x);
	    // }
	    
	    exec.listen('click', function(){
		
		exec.parent.message("Fitting pdeg=" + pdeg.value);
		
		var result = regression('polynomial', fit_points, pdeg.value*1.0);
		console.log("Fit result : " + JSON.stringify(result), { wait : true});
		
		exec.parent.message("Fitting done " , { title : 'Done', type : 'success'});
		
		calib_func.elements.params.set_value(result.equation);
		
		fit_eq.set_value(result.string);
		
		// if(fit_params.ui_childs !== undefined){
		//     if(fit_params.ui_childs.div!==undefined)
		// 	fit_params.ui_childs.div.innerHTML="";
		// }
		// fit_params.elements={};
		view.hide(false);
		
		if(view.value===undefined){
		    var pp=view.add_plot_points(fit_points, { stroke : "#ee2020", stroke_width : "1px", label : "Data points"});
		    var pf=view.add_plot_func(calib_func.func ,{ label : "Fit func", stroke : "#3030dd", stroke_width : "1px"});
		}

		view.redraw();
		
		
		// for(var i=0;i<fitp.length;i++){
		//     var fpui=create_widget({ name : 'x<sup>'+i+'</sup>', type : "double", value : fitp[i]} );
		//     fpui.fit_id=i;
		//     fit_params.add_child(fpui);
		//     fpui.listen('change', function(v){ fitp[this.fit_id]=v; pf.redraw(); } )
	// }
		
		
	    });
	    
	    fit_params.listen('change',function(){
		//console.log("FP changed ! " + this.value);
		view.redraw();
	    });
	    
	    // fit.listen("data_loaded", function(){
	    // 	console.log("FIT PLOAD !!! " + this.name) ;
		
	    // });
	}
	//     },
	

	
	// }
    },

    videocap : {
	
	name : "WebSpectro",
	//type : "html",
	url : "/minispectro/intro.html",

	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : [],
	    name_classes : [],
	    hide_item : true,
	    //child_item : 'doc',
	    default_child : 'none',
	    icon : "/minispectro/ico/minispectro_white.svg",
	    child_view_type : 'tabbed',
	    toolbar_brand : true,
	},
	toolbar : {
	    ui_opts : {
		toolbar_classes : ["navbar-fixed-top navbar-inverse"]
	    }
	},
	
	elements : {
	    
	    spectro : {
		name : "Spectro",
		
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
			name : "Video",
			intro : "<p>Click the floppy icon <span class='fa fa-save text-success'> </span> to save the video parameters of your spectrograph in your browser's webstorage.</p> <p>Your configuration will be restored automatically when you visit the page again</p>",
			ui_opts : {
			    intro_title : 'Save your setup',
			    root_classes : ["col-md-5 col-xs-12"],
			    child_classes : ["container-fluid"],
			    //save : "minispectro_setup",
			    child_view_type : 'tabbed',
			    fa_icon : "camera",//fa_icon : 'cogs',
			    default_child : 'none',
			    toolbar_brand : true,
			    save : "Video setup"
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
					    //label : true,
					    name_classes : ["col-xs-6 control-label"],
					    name_node : "strong",
					    wrap : true,wrap_classes : ["col-xs-6 input-group"],
					    root_classes : ["col-xs-12 form-group list-group-item vertical_margin"],
					    //root_classes : ["col-md-6 col-sm-6 col-xs-12"],
					    fa_icon : "camera-retro", type : "edit"
					},
					name : "Camera device",
					type : "combo"
				    },
				    resolution : {
					name : "Resolution",
					ui_opts : {
					    //label : true,
					    name_node : "strong",
					    name_classes : ["col-xs-6 control-label"],
					    wrap : true,wrap_classes : ["col-xs-6 input-group"],
					    root_classes : ["col-xs-12 form-group list-group-item"],
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
					    child_classes : ["row"],
					    //child_view_type : 'table',
					    fa_icon : 'plus'
					},
					intro : "<p>Sum up frames to reduce noise</p>",
					elements : {
					    enable : {
						name : "Enable",
						ui_opts : {
						    name_node : "strong",
						    wrap : true,wrap_classes : ["input-group col-xs-6"],
						    root_classes : ["col-sm-6 col-xs-12"],
						    name_classes : ["col-sm-6 col-xs-6"],
						    type : "edit"
						},
						type : "bool",
						value : false
					    },
					    nframes : {
						type : "double",
						name : "N. images",
						ui_opts : {
						    type : "edit",
						    name_node : "strong",
						    wrap : true,wrap_classes : ["input-group col-xs-6"],
						    root_classes : ["vertical_margin col-sm-6 col-xs-12"],
						    name_classes : ["col-xs-6"],
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
					    wrap : true,
					    name_node : "strong",

					    wrap_classes : ["input-group col-xs-6" ],
					    //label : true,
					    name_classes : ["col-xs-6"],
					    //item_classes : ['col-sm-6'],
					    root_classes : ["list-group-item col-xs-12"],
					    fa_icon : "dashboard", type : "edit"
					}
					
				    }
				}
			    },
			    box : {
				name : "Geometry",
				
				intro : "Setup the orientation and dimensions of the spectrum area within the image",
				ui_opts :  {
				    //render_name: false,
				    
				    fa_icon : 'retweet',
				    name_classes : ["title_margin"],
				    //child_classes : ["list-group"],
				    //child_view_type : 'tabbed',
				    //save : 'Spectrum geometry'
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
					    name_classes : ["col-xs-6"],
					    //item_classes : ["col-xs-4"],
					    root_classes : ["list-group-item col-xs-12"],
					    wrap : true,
					    wrap_classes : ["input-group col-xs-6"],
					    type : "edit",
					    //label : true,
					    fa_icon : "exchange",
					    //intro_stick : true,
					    //render_name : false
					    
					    //name_node : "h4"
					    
					},
					default_value : 0,
				    },
				    region : {
					name : "Spectrum box",
					intro : "<strong>Adjust the spectrum box coordinates</strong><p> (x,y) is the top left pixel corner</p><p>The box can also be resized interactively by resizing the box rectangle overlayed on the camera view window.</p>",
					ui_opts :  {
					    root_classes : ["list-group-item col-xs-12 vertical_margin"],
					    name_classes : ["col-xs-8"],
					    child_classes : ["col-xs-12 form-inline"],
					    fa_icon : 'crop',
					    //intro_stick : true,
					    //render_name : false
					},
					elements : {
					    pos : {
						ui_opts : {
						    root_classes : ["container-fluid"],
						    child_classes : ["row"]
						},
						elements : {
						    x : {
							name: "x",
							type: "double",
							default_value : 300, step : 1, min : 0,
							ui_opts : {
							    type : "edit",
							    name_node : "strong",
							    wrap : true, wrap_classes : ["col-xs-8 input-group"],
							    root_classes : ["col-xs-6 "],
							    name_classes : ["col-xs-4"],
							    item_classes : ["input-sm"]
							}
						    },
						    y : {
							name: "y",
							type: "double",
							default_value : 50, step : 1, min : 0,
							ui_opts : {
							    type : "edit",
							    wrap : true, wrap_classes : ["col-xs-8 input-group"],
							    name_node : "strong",
							    root_classes : ["col-xs-6" ],
							    name_classes : ["col-xs-4"],
							    item_classes : ["input-sm"]
							}
						    }
						}
					    },
					    dims : {
						ui_opts : {
						    root_classes : ["col-sm-12 vertical_margin"],child_classes : ["row"]
						},
						elements : {
						    w : {
							name: "width",
							type: "double",
							default_value : 30, step : 1, min : 1,
							ui_opts : { type : "edit",
								    wrap : true, wrap_classes : ["col-xs-8 input-group"],
								    name_node : "strong",
								    root_classes : ["col-xs-6 "],
								    name_classes : ["col-xs-4"],
								    item_classes : ["input-sm"]
								    
								  }
						    },
						    h : {
							name: "height",
							type: "double",
							default_value : 300, step : 1, min : 1,
							ui_opts : {
							    type : "edit",
							    wrap : true, wrap_classes : ["col-xs-8 input-group"],
							    name_node : "strong",
							    root_classes : ["col-xs-6 "],
							    name_classes : ["col-xs-4"],
							    item_classes : ["input-sm"]
							    
							}
						    }
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
				    
				},
				elements : {
				    
				    butts : {
					name : "Start/Stop capture",
					intro : "<p>You might be prompted to accept webcam capture from your browser</p>",
					ui_opts :  {
					    intro_title : "Start/stop capturing frames from the webcam and computing one-dimensional spectrum",
					    fa_icon : "play",
					    root_classes : ["container-fluid vertical_margin"],
					    child_classes : ["btn-group"],
					    label: true
					    //name_classes : ["col-xs-6 text-right"]
					},
					elements : {
					    start : {
						name : "",
						type : "action",
						ui_opts :  {
						    fa_icon : "play",item_classes : ["btn btn-primary"],
						}
					    },
					    stop : {
						name : "",
						type : "action",
						ui_opts :  {
						    fa_icon : "stop",item_classes : ["btn btn-default"],
						}
					    }
					}
				    },
				    
				    camwindow : {
					ui_opts : {
					    root_classes : ["camwindow "]
					}
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
			name : "Spectrograph",
			type : "spectrum",
			//intro:  "One dimensional raw spectra (R,G,B, Sum/3)",
			y_range : [0, 255],
			ui_opts : {
			    name_edit : false,
			    intro_stick: true,
			    fa_icon : "line-chart",
			    root_classes : ['col-md-7 col-xs-12 container-fluid'],
			    //child_classes : ["container-fluid"],
			    toolbar_brand : true,
			    save : "Spectro view config",
			    default_child : 'none',
			    //item_classes : ["row"],
			    //  label : true,
			    //  enable_range : false,
			    //  enable_selection : false,
			    //root_classes : ['col-md-12'],
			    
			    //render_name : false
			},
			elements : {
			    keys : {
				ui_opts : { create : false}
			    },
			    view : {
				ui_opts : {
				    //root_classes : ["row"]
				}
			    },
			    lines : {
				name : "Display features",
				subtitle : "Add spectral features to be displayed in the live spectrum.",
				ui_opts : { fa_icon : 'magnet'}
			    },
			    
			    fileops : {
				name : "Save spectrum",
				subtitle : "Save visible spectrum on browser's webstorage",
				type : 'object_save',
				collection : "spectra",
				ui_opts : {
				    //label : true,
				    fa_icon : "save",
				    //render_name : false,
				    //intro_stick : true,
				    root_classes : ["col-sm-12 vertical_padding panel"],
				    //child_node_type : "form",
				    child_classes : ["row"]
				    
				},
				widget_builder : function(){
			
				},
				
				elements : {
				    p  : {
					ui_opts : { prep : true},
					elements : {
					    ui_opts : {
						root_classes : ["col-sm-10 col-xs-12"],
						child_classes : ["row"]
					    },
					    specname : {
						type : "string",
						name : "Name :",
						holder_value : "Auto (Date)",
						ui_opts : {
						    root_classes : ["col-xs-12 col-sm-6"],
						    wrap : true,wrap_classes : ["col-xs-8 input-group"],
						    //name_node : "strong",
						    name_classes : ["col-xs-4"],
						    type : "edit"
						}
						
					    },
					    
					    target : {
						type : "string",
						name : "Target :",
						holder_value : "An interesting light source",
						ui_opts : {
						    root_classes : ["col-xs-12 col-sm-6"],
						    wrap : true,
						    wrap_classes : ["col-xs-8 input-group"],
						    //name_node : "strong",
						    name_classes : ["col-xs-4"],
						    type : "edit"
						}
						
					    }
					}
				    },
				}
			    }
			    
			},
			widget_builder : function(ui_opts, sv){
			    //console.log(sv.name + " Specview BUILDER !!");
			    this.deserialize=function(d){
			    }
			    //sv.ui_childs.remove_child(sv.elements.keys);
			}
			
			
		    },
		    
		}
	    },
	    
	    
	    spectra : {
		name : "Saved spectra",
		intro : "Use the <i class='fa fa-download text-info'></i> and  <i class='fa fa-save text-success'></i> buttons on the spectrum widget below to load and save your spectra",
		//type : 'spectrum',
		ui_opts : {
		    intro_title : "Edit your saved spectra",
		    //child_view_type : "tabbed",
		    root_classes : ["container-fluid"],
		    //name_classes : ["well"],
		    //child_classes : ["container-fluid"],
		    fa_icon : "folder",
		    intro_stick : true,
		    
		    //tabs_mode : "left",
		    //reqnder_name : false,
		    
		    // container : {
		    // 	type : 'spectrum',
		    // 	del : true,
		},
		elements : {
		    spec : {
			name : "No spectrum loaded",
			type : 'spectrum',
			ui_opts : {
			    save : "spectra"
			}
		    }
		    
		}
		
	    },
	    
	    calibration : {
		//name : "Wavelength calibration",
		
		type : 'wlc',
		ui_opts : {
		    //child_view_type : "tabbed",
		    //root_classes : ["container-fluid left"],
		    render_name : true,
		    //name_classes : ["title_margin"],
		    fa_icon : "calculator",
		    //intro_stick : true
		},
		//toolbar : { ui_opts : { toolbar_classes : ""} },
		// elements : {
		//     wlc : {
		// 	type : 'wlc'
		//     },
		//     flxc : {
		// 	name : "Flux calibration"
		//     }
		// }
	    },
	    
	    doc : {
		name : "Doc",
		ui_opts : {
		    fa_icon : 'info',
		    render_name : false,
		    child_view_type : "pills",
		    //hide_item : true,
		    //name_after : true,
		    //default_child : 'intro'
		},
		//toolbar : {},
		elements : {
		    // intro : {
		    // 	name : "Welcome",
		    // 	type : "html",
		    // 	url : "/minispectro/intro.html",
		    // 	ui_opts : {
		    // 	    render_name : false,
		    // 	    item_classes : ["container-fluid vertical_margin"],
		    // 	    fa_icon : 'info'
		    // 	}
		    
		    // },
		    start : {
			type : 'getting_started'
		    },
		    soft : {
			type : 'manual'
		    },
		    building : {
			name : "Building a DVD spectrograph",
			type : 'html',
			url : '/minispectro/build.html',
			ui_opts : {
			    fa_icon : 'cut'
			}
		    },
		    dvd_grating : {
		    	name : 'DVD as a diffraction grating',
		    	type : 'html',
		    	url : '/minispectro/doc/dvd_reticolo_inv.svg',
		    	ui_opts : { icon : '/minispectro/doc/dvd.png'}
		    },
		    about : {
			name : "About WebSpectro",
			type : 'html',
			url : '/minispectro/gloria.html',
			ui_opts : {
			    icon : '/sadira/icons/gloria-logo-text-transp-light.svg'
			}
		    }

		}
	    }

	},
	//	template_ui_builders.videocap=function(ui_opts, vc){
	widget_builder : function(ui_opts){

	    var vc=this;
	    console.log("Videocap constructor !");
	    //var main_node=vc.ui=ce("div"); main_node.class_name="container-fluid";
	    //var video=vc.get("video");
	    
	    var camview=vc.get("camview");
	    var camwin=vc.get("camwindow");
	    var spectrum=vc.get("spectro");
	    var doc=vc.get("doc");

	    
	    var specview=vc.get("specview");//spectrum;
	    var spectro_view=specview.elements.view;//spectrum;
	    //var options=vc.get('setup');

	    var spectro_opts=vc.get('box').elements;
	    var controls=vc.get('left');
	    
	    var htmui=vc.ui=ce("div");
	    if(vc.url){
		download_url(vc.url,function(error, html_content){
		    if(error){
			vc.debug("Error downloading html content : "  + error);
		    }else{
			htmui.innerHTML=html_content;
			document.getElementById("goto_app").addEventListener('click', function(){
			    vc.ui_childs.select_frame(spectrum); 
			});

			document.getElementById("goto_doc").addEventListener('click', function(){
			    vc.ui_childs.select_frame(doc); 
			});
		    }
		});
	    }
	    
	    var spectro_box={
		x : vc.get('pos').elements.x,
		y : vc.get('pos').elements.y,
		w : vc.get('dims').elements.w,
		h : vc.get('dims').elements.h
	    };

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

	    //var save_status=spectrum.get("save_status");
	    //var specname=spectrum.get("specname");

	    
	    //var spectra=vc.get("spectra");
	    //var btns=cc("div",video.ui_root); btns.className="btn-group btn-group-lg";    

	    var video_container=cc("div",camwin.ui_root);
	    var spectro_win;

	    //var wlc=vc.get('calibration');
	    
	    //wlc.set_sv(spectro_view);
	    
	    //var have_wlc = wlc.get('calib_func').elements.params.value.length>0;
	    
	    var save_spec=spectrum.get("fileops");

	    save_spec.listen("save_doc",function(doc){

		save_spec.message("Saving spectrum ..",
			    { type : 'info', title : "<span class='fa fa-spinner fa-spin text-warning'></span>"}
			   );
		
		//save_spec.disable();
		
		//save_status.set_title("Saving spectrum ...");

		var date_obs=new Date();
		var sn=save_spec.val('name');
		
		var new_spec=create_widget({
		    type : 'spectrum',
		    name : (sn!==undefined && sn!=="") ? sn : "Spectrum "+date_obs.toLocaleString()
		});


		
		var calib_data=get_template_data(specview.get('calib'));
		
		new_spec.set('target',save_spec.val('target'));
		new_spec.set('date_obs',date_obs);
		new_spec.value=spec_data;
		set_template_data(new_spec.get('calib'), calib_data);
		//new_spec.update_plot(spec_data);
		
		doc.store_serialize(new_spec);
		//storage_serialize(path, doc);
		//saved_doc=doc;

		
		//spectra.add_child(new_spec, new_spec.name);

		//new_spec.elements.keys.elements.target.item_ui.innerHTML="BEN QUOIIII";//.set_value("TOTOTOTOOT");
		//new_spec.elements.keys.elements.target.set_value("TOTOTOTOOT");
		//ui.innerHTML="BEN QUOIIII";//

		//wlc.trigger('update_spectra', spectra.elements);

		setTimeout(function(){
		    save_spec.message("Spectrum saved",
				      { type : 'success', title : "Done", last : 2000 }
			       );
		    
		}, 1000);
		

		
	    });

	    // spectra.listen('load', function(){
	    // 	console.log("Spectra load event !!!!!");
	    // 	wlc.trigger('update_spectra', spectra.elements);
	    // });
	    
	    
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
		camview.debug('Capture error : ' + dump_error(e));
	    };
	    
	    video_node.addEventListener("loadeddata", function(){
		
		var iv=setInterval(function(){
		    if(video_node.videoWidth!==0){
			canvas.width= video_node.videoWidth;
			canvas.height=video_node.videoHeight;
			if(!spectro_win.moving)
			    set_box_size();


			console.log("LOADED ! canvas w = %d video w = %d",canvas.width,video_node.videoWidth);
			clearInterval(iv);
		    }
		    
		}, 100);

	    });

	    //wlc.trigger('update_spectra', spectra.elements);

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
		    video_options.message("This browser does not support MediaStreamTrack. You cannot choose the input device. Try Chrome.",
					  { title : 'Note', type : 'warning' });
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
		    
		    spec_data.r=spec_data.r.slice(0, ddim);
		    spec_data.g=spec_data.g.slice(0, ddim);
		    spec_data.b=spec_data.b.slice(0, ddim);
		    spec_data.t=spec_data.t.slice(0, ddim);

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
		    set_box_size();
		    slice_arrays();
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
	    
	    // function create_plots(){
	    // 	spectro_view.value=[];

	    // 	if(have_wlc){
	    // 	    pr=spectro_view.add_plot(spec_data.r, global_wlc.calib_func);
	    // 	    pg=spectro_view.add_plot(spec_data.g, global_wlc.calib_func);
	    // 	    pb=spectro_view.add_plot(spec_data.b, global_wlc.calib_func);
	    // 	    pt=spectro_view.add_plot(spec_data.t, global_wlc.calib_func);

	    // 	    spectro_view.xlabel="Wavelength (Å)";
	    // 	}else{
    	    // 	    pr=spectro_view.add_plot_linear(spec_data.r,0,1);
	    // 	    pg=spectro_view.add_plot_linear(spec_data.g,0,1);
	    // 	    pb=spectro_view.add_plot_linear(spec_data.b,0,1);
	    // 	    pt=spectro_view.add_plot_linear(spec_data.t,0,1);

	    // 	    spectro_view.xlabel="Wavelength (pixels)";
	    // 	}

	    // 	spectro_view.ylabel="Intensity (ADU)";
		
	    // 	pr.set_opts({ stroke : "#ff0000", stroke_width : ".5px", label : "Red"});
	    // 	pg.set_opts({ stroke : "#10ee08", stroke_width : ".5px", label : "Green"});
	    // 	pb.set_opts({ stroke : "#0000ff", stroke_width : ".5px", label : "Blue"});
	    // 	pt.set_opts({ stroke : "#aa08dd", stroke_width : "1px", label : "Mean"});
		

		
	    // }	

	    specview.update_plot(spec_data);
	    //vc.ui_root.style.position="relative";
	    //slice_arrays();
	    //create_plots();
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

		if(spectro_view.value!==undefined){

		    if(spectro_view.value.length>=4){
			spectro_view.value[0].data=spec_data.r.slice();
			spectro_view.value[1].data=spec_data.g.slice();
			spectro_view.value[2].data=spec_data.b.slice();
			spectro_view.value[3].data=spec_data.t.slice();
		    }
		}

		
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
	}

	
    },


    media : {
	ui_opts : {
	    root_classes : ['media'],
	    child_view_type : 'root'
	},
	elements : {
	    left : {
		ui_opts : {
		    root_classes : ['media-left'],
		    child_view_type : 'root'
		}
	    },
	    content : {
		ui_opts : {
		    root_classes : ['media-content'],
		    child_view_type : 'root'
		}
	    },
	}
	
    },
    getting_started : {
	type : 'html',
	ui_opts : {
	    root_classes : ["container-fluid jumbotron"],
	    child_classes : 'container-fluid',
	    //fa_icon : 'life-ring',
	    icon : "/minispectro/ico/minispectro.svg",
	    child_view_type : 'div',
	    intro_stick : true,
	    name_node : 'h2'
	},
	name : "Getting started",
	intro : "First steps for using the WebSpectro application",
	value :"<ol>\
<li class='list-group-item' style='display : list-item'>Build a webcam based spectrograph and connect it to your computer.</li>\
<li class='list-group-item' style='display : list-item'>Click the play <i class='fa fa-play text.primary'></i> button to start image capture.</li>\
<li class='list-group-item' style='display : list-item'>Point your spectrograph to a light source. A spectrum image should appear on the video monitor. Make sure the dispersion direction is aligned with one of the camera's dimensions. </li>\
<li class='list-group-item' style='display : list-item'>Setup the orientation and size of the capture frame to enclose the spectrum image. One dimensional spectra should appear on the right panel's plot. At this stage, you can save your WebsSpectro's video options in your browser's webstorage by clicking the toolbar's save icon <i class='fa fa-save'></i> of the left Video panel.</li>\
<li class='list-group-item' style='display : list-item'>Save the spectra (to your browser's webstorage) in the <i><i class='fa fa-save'/> Save spectrum section</i> of the Spectro right panel.</li>\
</ol>\
",
	elements : {
	    calib : {
		ui_opts : {intro_stick : true},
		name : "Wavelength calibration",
		type : 'html',
		intro : 'To become a true scientifical instrument, your spectrograph must be able to measure the light colors accurately. Follow these steps to calibrate your instrument.',
		value :"<ol>\
<li class='list-group-item' style='display : list-item'>Save the spectrum of a known light source producing sufficently enough emission lines. Any house light bulb (with mercury vapor) is a good choice. This will be used as the calibration spectrum in the next steps.</li>\
<li class='list-group-item' style='display : list-item'>Open your calibration spectrum on the <i>Saved spectra</i> main panel and open the <i>Spectral features</i> panel.</li>\
<li class='list-group-item' style='display : list-item'>Add spectral features from the list of known features or enter custom features manually. Features can be positionned graphically by dragging them on the spectrum viewer.\
<center>Hg reference spectrum :<img src='/minispectro/doc/hgcalib.gif' alt='Hg reference spectrum' style='width: 100%;'/></center>\
</li>\
<li class='list-group-item' style='display : list-item'>When you are done with inserting and positionning features, save your calibration spectrum again to record the feature's list.</li>\
<li class='list-group-item' style='display : list-item'>Go to the main <i>λ calibration</i> panel (<i class='fa fa-calculator'></i>) and follow the instructions to produce a calibration polynomial.</li>\
<li class='list-group-item' style='display : list-item'>Go to the main <i>Spectrograph </i> <i class='fa fa-line-chart'></i> window and open the calibration's toolbar section <i class='fa fa-dashboard'></i>. Load your calibration polynomial on the <i>Polynomial function</i> widget.</li>\
<li class='list-group-item' style='display : list-item'>Activate the <i>λ calibration</i> switch on the spectrum viewer to switch to calibrated mode.</li>\
<li class='list-group-item' style='display : list-item'>Eventually save the Spectro settings by clicking the <i class='fa fa-save'></i> icon on the <i>Spectro</i> toolbar.</li>\
</ol>"
	    }
	}
	
    },
    manual : {
	ui_opts : {
	    root_classes : ["container-fluid"],
	    fa_icon : 'book',
	    child_view_type : 'tabbed',
	    intro_stick : true
	},
	name : "Webspectro user manual",
	intro : "<i class='fa fa-exclamation-triangle text-danger'></i> WebSpectro should be easy to use and intuitive! ",
	elements : {
	    spectro_win : {
		name : "Spectrograph window", type : 'html',
		ui_opts : { fa_icon : 'line-chart'},
		value : "<p>The spectrograph window is composed of two main panels. The <strong>Video</strong> panel (left) controls the image acquisition and processing while the <strong>Spectro</strong> panel (on the right) is the monodimensional spectrum interface.</p>",
		elements : {
		    video : {
			name : "Video panel",
			intro : "The video panel",
			ui_opts : { fa_icon : 'camera'},
			elements : {
			    device : {
				ui_opts : { fa_icon : 'camera-retro'},
				type : 'media',
				name : "Device configuration",
				elements : {
				    
				}
			    }
			}
		    },
		    spectro : {
			name : "Spectro panel",
			ui_opts : { fa_icon : 'line-chart'}
		    }
		}
	    },
	    editing : {
		name : "Saved spectra window",
		ui_opts : { fa_icon : 'folder'}
	    },

	    calibration : {
		name : "Calibration window",
		ui_opts : { fa_icon : 'calculator'}
	    }
	    
	}
	
    }
    

    
};

template_ui_builders.wlc=function(ui_opts, wlc){
    
};

(function(){
    sadira.listen("ready",function(){
	console.log("adding videocap templates");
	//    window.addEventListener("load",function(){
	tmaster.add_templates(videocap_templates);
	
    });
})();
