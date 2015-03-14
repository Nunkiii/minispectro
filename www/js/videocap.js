navigator.getUserMedia  = (navigator.getUserMedia ||navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia);


var videocap_templates = {
    
    videocap : {
	name : "Minispectro",
	subtitle : "A web/home experiment to discover spectroscopy",
	intro : "<p>Instructions to build the inexpensive spectrograph can not be found <a href=''>here</a> yet, sorry!</p>",
	type : "videocap",
	ui_opts : { root_classes : ["container-fluid"],  child_classes : ["row"], name_classes : [],
		    icon : "/minispectro/ico/Prism-rainbow.svg"
		  },
	
	elements : {
	    camview : {
		//name : "Video monitor",
		ui_opts : { root_classes : ["col-md-4 col-xs-12"], child_classes : []},
		elements : {

		    butts : {
			name : "Start/Stop capture :",
			ui_opts :  {
			    
			    child_classes : ["btn-group"],
			    root_classes : ["container-fluid"],
			    label : true
			},
			elements : {
			    start : {
				name : "",
				type : "action",
				ui_opts :  {fa_icon : "play",item_classes : ["btn btn-primary"],
					   }
			    },
			    stop : {
				name : "",
				type : "action",
				ui_opts :  { fa_icon : "stop",item_classes : ["btn btn-primary"],
					   }
			    }
			}
		    }


		}
	    },
	    video : {
		//name : "Control-panel",
		//intro : "Click start to start capture",
		ui_opts : { child_view_type : "tabbed", root_classes : ["col-md-8 col-xs-12"],child_classes : ["container-fluid"]},

		elements : {
		    spectrum : {
			name : "Spectrum view",
			subtitle : "One dimensional spectra (R,G,B)",
			ui_opts : { fa_icon : "line-chart", root_classes : ["col-md-12 col-xs-12"], child_classes : [], item_classes : [],
				    render_name : false
				  },
			type : "template",
			template_name : "vector",
			y_range : [0, 255]
		    },
		    
		    options : {
			name : "Setup",
			ui_opts : {child_view_type : "pills", root_classes : [], render_name : false, child_classes : ["container-fluid"],
				   fa_icon : "reorder"
				  },
			elements : {
			    controls : {
				name : "Video control",
				ui_opts :  {
				    fa_icon : "camera",root_classes : [],child_classes : ["container-fluid"], render_name : false
				},
				elements : {
				    
				    options : {
					name : "Video device options :",
					ui_opts : { root_classes : ["container"], child_classes : ["row"]},
					elements : {
					    device : {
						ui_opts : {label : true, item_classes : ["inline"], root_classes : ["col-md-6 col-sm-6 col-xs-12"],
							   fa_icon : "camera-retro"
							  },
						name : "Device",
						type : "combo"
					    },
					    resolution : {
						name : "Resolution",
						ui_opts : {label : true, item_classes : ["inline"], root_classes : ["col-md-6 col-sm-6 col-xs-12"],
							   fa_icon : "qrcode"
							  },
						type : "combo",
						options : ["VGA", "HD"]
					    }
					}
				    },
				    integrate : {
					name  : "Average frames",
					ui_opts : { label : false, root_classes : ["container"], child_classes : ["row"],
						    
						  },
					subtitle : "Sum up frames to reduce noise",
					elements : {
					    enable : {
						name : "Enable",
						ui_opts : { label : true, root_classes : ["col-md-2 col-sm-2"], type : "edit" },
						type : "bool",
						value : false
					    },
					    nframes : {
						type : "double",
						name : "Number of images",
						ui_opts : { type : "edit", label : true, root_classes : ["col-md-4 col-sm-4"] },
						step : 1,
						value : 5,
						min : 2,
						max : 100
					    }
					}
				    },
				    
				}
			    },
			    box : {
				name : "Spectrum region",

				ui_opts :  {render_name: false,root_classes : ["container"],child_classes : ["container-fluid"]},
				
				elements : {
				    dir : {
					name : "Wavelength direction",
					fa_icon : "repeat",
					type : "combo",
					options : ["Vertical", "Horizontal"],
					ui_opts : { root_classes : ["col-md-12 col-sm-12 col-xs-12"],
						    item_classes : ["inline"]
						    
						  },
					intro : "Set the wavelength direction depending on your spectro design. Default is vertical, along the Y direction."
				    },
				    region : {
					name : "Spectrum box",
					intro : "Adjust the spectrum area within image",
					ui_opts :  {root_classes : ["col-sm-12 col-xs-12"],child_classes : ["form-inline"]},
					elements : {
					    x : {
						name: "x",
						type: "double",
						value : 300,
						ui_opts : { type : "edit", label : true,
							    root_classes : ["form-group col-md-3 col-sm-3 col-xs-6"]
							    //root_classes : ["form-group"]
							  }
					    },
					    y : {
						name: "y",
						type: "double",
						value : 50,
						ui_opts : { type : "edit", label : true,
							    root_classes : ["form-group col-md-3 col-sm-3 col-xs-6"]
							    //root_classes : ["form-group"]
							  }
					    },
					    w : {
						name: "width",
						type: "double",
						value : 30,
						ui_opts : { type : "edit", label : true,
							    root_classes : ["form-group col-md-3 col-sm-3 col-xs-6"]
							    //root_classes : ["form-group"]
							  }
					    },
					    h : {
						name: "height",
						type: "double",
						value : 300,
						ui_opts : { type : "edit", label : true,
							    root_classes : ["form-group col-md-3 col-sm-3 col-xs-6"]
							    //root_classes : ["form-group"]
							  }
					    }
					}
				    }
				}
			    },
			    wlc : {
				name : "Wavelength calibration"
			    },
			    flxc : {
				name : "Flux calibration"
			    }
			}
		    }
		}
	    }
	}
    }
    
};




template_ui_builders.videocap=function(ui_opts, vc){
    console.log("Videocap constructor !");
    //var main_node=vc.ui=ce("div"); main_node.class_name="container-fluid";
    var video=vc.elements.video;

    var camview=vc.elements.camview;

    var spectrum=video.elements.spectrum;


    var spectro_view=spectrum;
    var options=video.elements.options;

    var spectro_opts=options.elements.box.elements;
    var controls=options.elements.controls;
    var spectro_box=spectro_opts.region.elements;

    var dir=spectro_opts.dir;
    var butts=camview.elements.butts.elements;
    var start=butts.start;
    var stop=butts.stop;

    var integ=controls.elements.integrate.elements.enable;
    var integ_nf=controls.elements.integrate.elements.nframes;

    var video_options=controls.elements.options;
    var device=video_options.elements.device;
    var resolution=video_options.elements.resolution;
    
    //var btns=cc("div",video.ui_root); btns.className="btn-group btn-group-lg";    

    var video_container=cc("div",camview.ui_root);

    //camview.hide(true);
    
    video_container.style.position="relative";
    video_container.style.marginTop="1em";
    
    video_container.className="panel panel-default";
    //var phead=cc("div",video_container); //phead.className="panel-heading"; phead.innerHTML="";
   // var pcontent=cc("div",video_container);// pcontent.className="panel-content";
    var video_node=cc("video",camview.ui_root);
    //video_node.style.position="relative";

    //btns.appendChild(start.ui);
    //btns.appendChild(stop.ui);

    //vc.cnt.appendChild(spectrum.ui_root);

    video.className="center-block";
    video_node.style.width=200;
    video_node.setAttribute("autoplay",true);
    video_node.style.display="none";
    //var img_node=cc("img",video.ui_root);
    var canvas=cc("canvas",video_container);
    //canvas.style.display="none";
    //video_node.style.width=640;
    //video_node.style.height=640;
    
    var stream = null;

    var ctx = canvas.getContext('2d');

    var per=null;
    function video_error(title,msg){
	if(!per) per=ce("p");controls.ui_root.appendChild(per);
	per.innerHTML='<p class="alert alert-danger"> <strong>'+title+'</strong>'+msg+'</p>';
	
    }
    
    
    var errorCallback = function(e) {
	video_error('Capture error ', e);
    };

    video_node.addEventListener("loadeddata", function(){
	
	var iv=setInterval(function(){
	    if(video_node.videoWidth!==0){
		canvas.width= video_node.videoWidth;
		canvas.height=video_node.videoHeight;
		//console.log("LOADED ! canvas w = %d video w = %d",canvas.width,video_node.videoWidth);
		clearInterval(iv);
	    }
	    
	}, 100);

    });

    var iv_cap;
    var videoSource = null;
    
    stop.disable(true);
    start.disable(true);
    
    stop.listen("click",function(){
	
	if(iv_cap){
	    clearInterval(iv_cap);
	}
	
	if (stream) {
	    stream.stop();
	}
	//camview.hide(true);
	video_options.disable(false);

	start.disable(false);
	stop.disable(true);
    });

    
    if (!navigator.getUserMedia) {
	video_error("Oh No!", "It seems your browser doesn't support HTML5 getUserMedia.");
    }else{

	if (typeof MediaStreamTrack === 'undefined' ||
	    typeof MediaStreamTrack.getSources === 'undefined') {
	    video_error("Oh No!", "This browser does not support MediaStreamTrack. Try Chrome.");
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
		    videoSource=device.value.value;
		    
		});
		
	    });
	}
    }
    
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
	    var iv_delay=100; //integ.value? 100 : 100;
	    if (stream) {
		iv_cap=setInterval(function(){
			// "image/webp" works in Chrome.
		    // Other browsers will fall back to image/png.
		    //img_node.src = canvas.toDataURL('image/webp');
			
		    draw_spectrum();
		}, iv_delay );
		
	    }
	    video_options.disable(true);
	    start.disable(true);
	    stop.disable(false);
		
	}, errorCallback);
    });
    
    var buf_data=[];
    var seq=0;
    var bx,by,bw,bh;

    function slice_arrays(){
	bx=spectro_box.x.value;
	by=spectro_box.y.value;
	bw=spectro_box.w.value;
	bh=spectro_box.h.value;

	var ddir=dir.ui.selectedIndex;
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

	w.widget_div.style.left=scale[0]*bx+"px";
	w.widget_div.style.top=scale[1]*by+"px";
	w.widget_div.style.width=scale[0]*bw+"px";
	w.widget_div.style.height=scale[1]*bh+"px";

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
    w=new widget({ x: 2*c5, y: 5, w : c5, h : canvas.height-5});
    w.widget_div.style.position="absolute";
    video_container.appendChild(w.widget_div);
    set_box_size();
    
    dir.listen("change",function(){slice_arrays();});
    
    w.listen("resize", function(sz){
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
	spectro_view.plots=[];
	pr=spectro_view.add_plot_linear(spec_data.r,0,1);
	pg=spectro_view.add_plot_linear(spec_data.g,0,1);
	pb=spectro_view.add_plot_linear(spec_data.b,0,1);
	pt=spectro_view.add_plot_linear(spec_data.t,0,1);
	
	pr.set_opts({ stroke : "red", stroke_width : ".5px", label : "Red"});
	pg.set_opts({ stroke : "green", stroke_width : ".5px", label : "Green"});
	pb.set_opts({ stroke : "blue", stroke_width : ".5px", label : "Blue"});
	pt.set_opts({ stroke : "purple", stroke_width : "1px", label : "(R+G+B)/3"});
    }	
    //vc.ui_root.style.position="relative";
    slice_arrays();
    create_plots();
    //set_box_size();    
    var w;
    
    
    var frid=0;
    
    function draw_spectrum(){
	//console.log("draw spectrum Canvas w,h %d %d" ,canvas.width,canvas.height);
	
	var buf = ctx.getImageData(0,0,canvas.width,canvas.height);

	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	ctx.drawImage(video_node, 0, 0);

	var inf=integ_nf.value*1.0;
	
	if(integ.value){

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

	//draw_spectrum_box();

	if(!w.moving)
	    set_box_size();
	
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
	//if(frid===0)
	spectro_view.config_range();
	frid++;
	
	//spectro_view.redraw();
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

	


