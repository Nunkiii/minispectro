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
	ui_opts : {
	    //editable : true, edited : false,
	    name_node : "h5",
	    child_classes : ['container-fluid'],
	    child_view_type : 'table'
	    //sliding : true, slided : false
	},
	elements : {
	    // name : {
	    // 	name : "Name",
	    // 	type : "string",
	    // 	ui_opts : { editable : true, label : true}
	    // },
	    wl : {
		name : "Wavelength (Å)",
		intro : "Physical wavelength",
		type : "double",
		min : 0,
		max : 30000,
		ui_opts : { editable: true, label : true}
	    },
	    pixel : {
		name : "Pixel",
		intro : "Pixel space position",
		type : "double",
		min : 0, max : 20000, step : 1.0,
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
		var m=pixel.value===undefined? w/2.0 : pixel.value/r[1]*w; //(r[1]-r[0])/2.0*w;
		
		//console.log("Range is " + r[0] + ", " + r[1] + " pos is " + m );
		
		//console.log("Draw feature...." + label_text);
		//pixel.set_value(m);
		
		var spectrum_line=lineg.append('line')
		    .attr('x1',m)
		    .attr('y1',5)
		    .attr('x2',m)
		    .attr('y2',160)
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
		    .text(label_text)
		    .attr('transform',' rotate(0,'+ (m-deltatext) +','+ (-3) + ')');
		
		
		
		
		
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
			
			pixel.set_value(newp/w*r[1]);
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
	    name_node :"h3",
	    show_cursor : true
	    //save : "spectrum"
	},
	elements : {
	    keys : {
		//name : "Meta-data",
		ui_opts : {
		    child_view_type : "div",
		    name_node : "h3"
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
		
		name : "Features",
		ui_opts : {
		    //fa_icon : "save",
		    //root_classes : ["container-fluid inline"],
		    child_node_type : "form",
		    child_classes : ["inline form-inline"],
		    name_node : "strong",
		    sliding : true,
		    slided : false
		},
		
		elements : {

		    new_line : {
			
			name : "Add a new specral feature",
			
			ui_opts : {
			    //fa_icon : "save",
			    //root_classes : ["container-fluid inline"],
			    child_node_type : "form",
			    child_classes : ["inline form-inline"],
			    name_node : "strong",
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
				name:  "Add line", type : "action",
				ui_opts:{
				    item_root : true,
				    
				    fa_icon : "plus", item_classes : ["btn btn-warning"]
				}
			    }
			}
		    },

		    feature_list : {
			name : "Feature list",
			
			ui_opts : {
			    name_node : 'strong',
			    child_view_type : "table"
			}
		    }
		}
	    },
	    
	    view : {
		name : "View",
		type : "vector",
		ui_opts : {
		    name_node : "strong",
		    enable_selection : false,
		    enable_range : false}
	    }
	},

	widget_builder : function(ui_opts, spectrum){

	    console.log("Building spectrum : " + spectrum.name);
	}
    },
    
    wlc : {
	name : "Wavelength calibration",
	//	intro : " This is the calibration !!!",
	ui_opts : {
	    render_name : true, child_view_type : 'div', name_node : 'h2',
	    root_classes : ["container-fluid"],
	    child_classes : ["row"],
	},
	elements : {
	    fit : {
		name : "Polynomial fit",
		intro : "Explain what we do here ...",
		ui_opts : {
		    name_node : 'h4',
		    root_classes : ['col-md-6 col-xs-12'],
		    child_classes : ['container-fluid']
		},
		elements : {
		    control : {
			ui_opts : {
			    root_classes : ['container-fluid'],
			    child_classes : ['row'],
			    save : "wlc"
			},
			elements : {
			    specsel : {
				name : "Select spectrum",
				type : "combo",
				//intro : "<p>Choose a spectrum to use for wavelength calibration fit</p>",
				ui_opts : {
				    label : true,
				    type : 'edit',
				    root_classes : ['col-md-6 col-xs-12'],
				    item_classes : []
				}
			    },
			    pdeg : {
				name : "Polynomial degree",
				type : "double",
				min : 0, max : 10, step : 1,
				ui_opts : {
				    type : 'edit',
				    label : true,
				    root_classes : ["col-md-6 col-xs-12"]},
				default_value : 2
			    },
			    exec :  {
				type : 'action',
				name : 'Fit datapoints',
				ui_opts:{
				    item_root : true,
				    fa_icon : "cogs",
				    item_classes : ["btn btn-warning col-xs-12 col-md-6"],
				    //root_classes : ['container']
				}
			    },
			    fit_eq : {
				name : "Equation",
				type : "string",
				default_value : "No equation",
				ui_opts : {
				    label : true,
				    root_classes : ["col-xs-12 col-md-6"]
				}
				
			    },
			    fit_params : {
				name : "Fit parameters",
				ui_opts:{
				    label : true,
				    root_classes : ["col-xs-12"],
				    child_view_type : 'table',
				    editable : true
				},
				elements : {
				    
				}


			    }
			    
			}
		    }
		    
		}
	    },

	    view : {
		name : "Fit result",
		type : 'vector',
		ui_opts : {
		    fa_icon : 'trophy',
		    enable_range : false,
		    enable_selection : false,
		    root_classes : ['col-md-6 col-xs-12'],
		    //item_classes : ['container-fluid']
		    
		}
	    }


	}
    },
    
    
    
    
    videocap : {
	name : "<font color='white'>MiniSpectro</font>",
	subtitle : "A web/home experiment to discover spectroscopy",
	intro : "<p>Instructions to build the inexpensive spectrograph can not be found <a href=''>here</a> yet, sorry!</p>",
	ui_opts : {
	    root_classes : [],  child_classes : [], name_classes : [],
	    icon : "/minispectro/ico/minispectro_white.svg",
	    //child_toolbar : true,
	    child_view_type : 'tabbed',
	    name_node : "h3"
	    
	},

	toolbar : {},
	
	elements : {
	    spectrum : {
		name : "Spectro Control",
		
		ui_opts : {
		    fa_icon : "line-chart",
		    //root_classes : ["container-fluid"],
		    //child_classes : ['container-fluid'],
		    item_classes : [],
		    render_name : false,
		    //childs_pos : "below",
		},
		elements : {
		    
		    camview : {
			name : "Video monitor", 
			ui_opts : {
			    
			    root_classes : ["col-md-4 col-xs-12"],
			    fa_icon : "camera"
			    

			    //child_classes : ["container-fluid"]
			},
			elements : {
			    
			    butts : {
				name : "Start/Stop capture :",
				ui_opts :  {
				    //fa_icon : "camera",
				    child_classes : ["btn-group"],
				    root_classes : ["inline"],
				    label : true
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
					    fa_icon : "stop",item_classes : ["btn btn-primary"],
					}
				    }
				}
			    },
			    
			    camwindow : {

			    },
			    
			    fileops : {
				name : "Save current spectrum",
				ui_opts : {
				    label : true,
				    fa_icon : "save",
				    root_classes : ["col-xs-12"],
				    child_node_type : "form",
				    child_classes : ["inline form-inline"]
				},
				
				
				elements : {
				    specname : {
					type : "string",
					name : "Name :",
					holder_value : "Auto (Date)",
					ui_opts : {
					    root_classes : ["input-group"],
					    //wrap : true,
					    //wrap_classes : ["col-sm-4 nopadding"],
					    name_classes : ["input-group-addon"],
					    name_node : "div",
						    type : "edit"
					}
					
				    },
				    
				    target : {
					type : "string",
					name : "Target :",
					holder_value : "An interesting light source",
					ui_opts : {
					    root_classes : ["input-group"],
					    //wrap : true,
					    //wrap_classes : ["col-sm-4 nopadding"],
					    name_classes : ["input-group-addon"],
					    name_node : "div",
					    type : "edit"
					}
						
				    },
				    save :   {
					name:  "Save", type : "action", ui_opts:{
					    item_root : true,
					    fa_icon : "save", item_classes : ["btn btn-warning"]}
				    }
				}
			    }
			    
			}
		    },
		    
		    
		    

		    right : {
			ui_opts : {
			    root_classes : ['col-md-8'],
			    child_view_type : 'tabbed',
			    render_name : false
			},
			elements : {

			    view_main : {

				name : "Live spectro",
				subtitle : "One dimensional spectra (R,G,B)",
				ui_opts : {
				    fa_icon : "line-chart",
				    name_node : "h3"
				},

				elements : {
				    specview : {
					//name : "Live spectra",
					type : "vector",
					y_range : [0, 255],
					ui_opts : {
					    label : true,
					    enable_range : false,
					    enable_selection : false,
					    root_classes : ['col-md-12'],
					    show_cursor : true,
					    render_name : false
					}
				    },
				}
			    },

			    setup : {

				name : "Acquisition setup",
				subtitle : "Configure camera and spectrum sampling",
				ui_opts : {
				    fa_icon : "cogs",
				    child_view_type : 'tabbed',
				    save : "minispectro_setup",
				    name_node : 'h2'
				},
				elements : {

				    controls : {
					name : "Video control",
					ui_opts :  {
					    fa_icon : "camera",
					    root_classes : ["container-fluid"],
					    child_classes : ["row"],
					    render_name : false
					},
					elements : {
					    options : {
						name : "Video device options :",
						ui_opts : {
						    root_classes : ["container-fluid"],
						    child_classes : ["row"]
						},
						elements : {
						    device : {
							ui_opts : {
							    label : true, item_classes : ["inline"], root_classes : ["col-md-6 col-sm-6 col-xs-12"],
							    fa_icon : "camera-retro", type : "edit"
							},
							name : "Device",
							type : "combo"
						    },
						    resolution : {
							name : "Resolution",
							ui_opts : {
							    label : true, item_classes : ["inline"], root_classes : ["col-md-6 col-sm-6 col-xs-12"],
							    fa_icon : "qrcode", type : "edit"
							},
							type : "combo",
							options : ["VGA", "HD"]
						    }
						}
					    },
					    processing : {
						name : "Processing options",
						ui_opts : { root_classes : ["container-fluid"], child_classes : ["row"], fa_icon : "th"},
						
						elements : {
						    integrate : {
							name  : "Average frames",
 							ui_opts : {root_classes : ["col-sm-6"], child_classes : ["row"]},
							subtitle : "Sum up frames to reduce noise",
							elements : {
							    enable : {
								name : "Enable",
								ui_opts : { label : true, root_classes : ["col-md-3 col-sm-6"], type : "edit" },
								type : "bool",
								value : false
							    },
							    nframes : {
								type : "double",
								name : "Number of images",
								ui_opts : { type : "edit", label : true, root_classes : ["col-md-6 col-sm-6"] },
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
							type : "double", min : .1, max : 50, step : 1, default_value : 20,
							ui_opts : {
							    label : true, item_classes : [], root_classes : ["col-md-6 col-sm-6 col-xs-12"],
							    fa_icon : "dashboard", type : "edit"
							}
							
						    }
						}
					    }
					    
					    
					}
				    },
				    box : {
					name : "Spectrum region",
					subtitle : "Setup the orientation and dimensions of the spectrum area within the image.",
					ui_opts :  {
					    //render_name: false,
					    fa_icon : 'crop',
					    root_classes : ["container-fluid"],
					    child_classes : ["row"],
					    name_node : "h3"
					    //intro_stick : true
					},
					
					elements : {
					    dir : {
						name : "Wavelength direction",
						intro : "Set the wavelength direction depending on your spectro design. Default is vertical, along the Y direction.",
						type : "combo",
						
						options : [{ label : "Vertical", value : 0},{ label :  "Horizontal", value : 1}],
						ui_opts : {
						    root_classes : ["col-md-12 col-sm-12 col-xs-12 form form-inline"],
						    item_classes : ["col-xs-12 text-center"],
						    type : "edit",
						    label : true,
						    fa_icon : "exchange",
						    //name_node : "h4"
						    
						},
						default_value : 0,
					    },
					    region : {
						name : "Spectrum box",
						subtitle : "Adjust the spectrum area within image",
						ui_opts :  {
						    root_classes : ["col-xs-12"],child_classes : ["form-inline"],
						    name_node : "strong",
						    //label : true,
						    intro_stick : true
						},
						elements : {
						    x : {
							name: "x",
							type: "double",
							default_value : 300, step : 1, min : 0,
							ui_opts : {
							    type : "edit", label : true,
							    root_classes : ["form-inline col-xs-6 col-md-3"]
							    //root_classes : ["form-group"]
							}
						    },
						    y : {
							name: "y",
							type: "double",
							default_value : 50, step : 1, min : 0,
							ui_opts : { type : "edit", label : true,
								    root_classes : ["form-group col-xs-6 col-md-3"]
								    //root_classes : ["form-group"]
								  }
						    },
						    w : {
							name: "width",
							type: "double",
							default_value : 30, step : 1, min : 1,
							ui_opts : { type : "edit", label : true,
								    root_classes : ["form-group col-xs-6 col-md-3"]
								    //root_classes : ["form-group"]
								  }
						    },
						    h : {
							name: "height",
							type: "double",
							default_value : 300, step : 1, min : 1,
							ui_opts : { type : "edit", label : true,
								    root_classes : ["form-group col-xs-6 col-md-3"]
								    //root_classes : ["form-group"]
								  }
						    }
						}
					    }
					}
				    }
				}
			    }
			    
			}
		    }
		}
	    },
	    
		    
	    spectra : {
		name : "Saved spectra",
		ui_opts : {
		    child_view_type : "tabbed",
		    root_classes : ["container-fluid"],
		    render_name : true,
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
		subtitle : "Setup wavelength and flux calibration.",
		ui_opts : {
		    child_view_type : "tabbed",
		    root_classes : ["container-fluid left"],
		    render_name : true,
		    child_classes : ["container-fluid"],
		    fa_icon : "reorder"
		},
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
	pr.set_opts({ stroke : "red", stroke_width : ".5px", label : "Red"});
	pg.set_opts({ stroke : "green", stroke_width : ".5px", label : "Green"});
	pb.set_opts({ stroke : "blue", stroke_width : ".5px", label : "Blue"});
	pt.set_opts({ stroke : "purple", stroke_width : "1px", label : "(R+G+B)/3"});

	view.redraw();	
    }


    var select_line=spectrum.get('select_line');
    var add_line=spectrum.get('add_line');
    
    var flist=spectrum.get('feature_list');

    select_line.options=[];
    hg_lines.forEach( function( line, i ){
	
	select_line.options.push( { value : i, label : line[2] + " : " + line[1] + " Å" });
	//line[0]
    });

    select_line.set_options();

    //line_table.value=[];

    add_line.listen('click', function(){
	var sel_line=select_line.ui.value;

	var ion=hg_lines[sel_line][2];
	var lambda=hg_lines[sel_line][1];
	
	console.log("Selected line : " + JSON.stringify(sel_line));
	function check_line(){
	
	    for(var f in flist.elements){
		
		if(flist.elements[f].val('wl')==lambda){
		    flist.debug("The wavelength " + lambda + " is already in the table !");
		    return false;
		}
	    }
	    return true;
	}
	
	if(check_line()){
	    var fe=create_widget('spectrum_feature');
	    fe.set('wl',lambda);
	    fe.set_title(ion + ", "+lambda+ 'Å');
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

template_ui_builders.wlc=function(ui_opts, wlc){


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
    var fit_params=wlc.get('fit_params');
    var control=wlc.get('control');
    
    var fitp=wlc.fitp=[];

    wlc.read_fitp=function(){
	for(var fpe in fit_params.elements){
	    fitp.push(fit_params.elements[fpe].value);
	}
	console.log("FP deserialize !" + JSON.stringify(fitp));
    }
    
    wlc.read_fitp();
    
    wlc.calib_func=function(x){
	var r=0;xx=1.0;
	for(var i=0;i<fitp.length;i++){
	    r+=xx*fitp[i];
	    xx*=x;
	}
	return r;
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
	fitp=result.equation;

	fit_eq.set_value(result.string);

	if(fit_params.ui_childs !== undefined){
	    if(fit_params.ui_childs.div!==undefined)
		fit_params.ui_childs.div.innerHTML="";
	}
	fit_params.elements={};

	
	var pp=view.add_plot_points(fit_points, 'Data points',{ stroke : "purple", stroke_width : "1px", label : "Data points"});
	var pf=view.add_plot_func( wlc.calib_func ,{ label : "Fit func", stroke : "springgreen", stroke_width : "1px"});


	for(var i=0;i<fitp.length;i++){
	    var fpui=create_widget({ name : 'x<sup>'+i+'</sup>', type : "double", value : fitp[i]} );
	    fpui.fit_id=i;
	    fit_params.add_child(fpui);
	    fpui.listen('change', function(v){ fitp[this.fit_id]=v; pf.redraw(); } )
	}
	

    });
    
}


template_ui_builders.videocap=function(ui_opts, vc){

    console.log("Videocap constructor !");
    //var main_node=vc.ui=ce("div"); main_node.class_name="container-fluid";
    //var video=vc.get("video");

    var camview=vc.get("camview");
    var camwin=vc.get("camwindow");
    var spectrum=vc.get("spectrum");
    var spectro_view=vc.get("specview");//spectrum;

    //var options=vc.get('setup');

    var spectro_opts=vc.get('box').elements;
    var controls=vc.get('controls');
    var spectro_box=vc.get('region').elements;

    var dir=vc.get("dir");

    var butts=vc.get('butts').elements;
    var start=butts.start;
    var stop=butts.stop;

    var video_options=controls.get('options');
    var processing_options=controls.get('processing').elements;

    var device=video_options.elements.device;

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

    var have_wlc = wlc.fitp.length>0;


    
    save_spec.listen("click",function(){
	var new_spec=tmaster.build_template('spectrum');
	var date_obs=new Date();
	
	
	if(specname.value && specname.value!==""){
	    new_spec.name=specname.value;
	}else
	    new_spec.name=date_obs.toLocaleString();

	console.log("Specname is " +  new_spec.name + " DATE " + date_obs );
	
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

	var types={};
	for(var b in template_ui_builders){
	    if(ù(tmaster.templates[b])){
		types[b]={}
	    }
	}
	console.log(JSON.stringify(types));

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
    
    var bx,by,bw,bh;

    function slice_arrays(){
	bx=spectro_box.x.value;
	by=spectro_box.y.value;
	bw=spectro_box.w.value;
	bh=spectro_box.h.value;

	var ddir=dir.value;
	var ddim= ddir? bw:bh;
	
	if(ddim < spec_data.r.length){
	    pr.data=spec_data.r=spec_data.r.slice(0, ddim);
	    pg.data=spec_data.g=spec_data.g.slice(0, ddim);
	    pb.data=spec_data.b=spec_data.b.slice(0, ddim);
	    pt.data=spec_data.t=spec_data.t.slice(0, ddim);
	    
	    //console.log("Resized !!" + JSON.stringify(sz) + " SL " + spec_data.r.length + " bh " + bh);
	}
	if(seq==0)set_box_size();
    }
    
    function set_box_size(){
	var scale=[canvas.clientWidth/canvas.width,canvas.clientHeight/canvas.height];
	
	//console.log("Canvas  " + canvas.clientWidth);

	//w.widget_div.style.transform="scale("+scale[0]+","+scale[1]+")";

	spectro_win.widget_div.style.left=scale[0]*bx+"px";
	spectro_win.widget_div.style.top=scale[1]*by+"px";
	spectro_win.widget_div.style.width=scale[0]*bw+"px";
	spectro_win.widget_div.style.height=scale[1]*bh+"px";

	
	
    }

    
    for(var be in spectro_box){
	spectro_box[be].listen("change",function(){
	    //draw_spectrum_box();
	    slice_arrays();
	    set_box_size();
	    //spectro_view.redraw();	    
	});
    };
    
    // function draw_spectrum_box(){
	

    // 	if(ù(w)){
    var c5=canvas.width/5.0;
    spectro_win=new widget({ x: 2*c5, y: 5, w : c5, h : canvas.height-5});
    spectro_win.widget_div.style.position="absolute";
    video_container.appendChild(spectro_win.widget_div);
    set_box_size();
    
    dir.listen("change",function(){slice_arrays();});
    
    spectro_win.listen("resize", function(sz){
	console.log("Resize [" +dir.value+"] !! " + JSON.stringify(sz) + " SL " + spec_data.r.length + " bh " + bh);
	
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
	    pr=spectro_view.add_plot(spec_data.r, wlc.calib_func);
	    pg=spectro_view.add_plot(spec_data.g, wlc.calib_func);
	    pb=spectro_view.add_plot(spec_data.b, wlc.calib_func);
	    pt=spectro_view.add_plot(spec_data.t, wlc.calib_func);

	    spectro_view.xlabel="Wavelength (Å)";
	}else{
    	    pr=spectro_view.add_plot_linear(spec_data.r,0,1);
	    pg=spectro_view.add_plot_linear(spec_data.g,0,1);
	    pb=spectro_view.add_plot_linear(spec_data.b,0,1);
	    pt=spectro_view.add_plot_linear(spec_data.t,0,1);

	    spectro_view.xlabel="Wavelength (pixels)";
	}

	spectro_view.ylabel="Intensity (ADU)";
	
	pr.set_opts({ stroke : "red", stroke_width : ".5px", label : "Red"});
	pg.set_opts({ stroke : "green", stroke_width : ".5px", label : "Green"});
	pb.set_opts({ stroke : "blue", stroke_width : ".5px", label : "Blue"});
	pt.set_opts({ stroke : "purple", stroke_width : "1px", label : "(R+G+B)/3"});


	
    }	
    //vc.ui_root.style.position="relative";
    slice_arrays();
    create_plots();
    //set_box_size();    
    
    var frid=0;
    var buf_data=[];
    var seq=0;

    function process_frame(){
	//console.log("draw spectrum Canvas w,h %d %d bufferL=%d" ,canvas.width,canvas.height,buf.data.length);
	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	ctx.drawImage(video_node, 0, 0);
	
	var buf = ctx.getImageData(0,0,canvas.width,canvas.height);
	var inf=integ_nf.value*1.0;
	
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

//	draw_spectrum_box();

	var ddir=dir.ui.selectedIndex;

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
	
	spectro_view.config_range();
	
	//if(frid===0)
	frid++;
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
