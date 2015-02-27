function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
	      navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

navigator.getUserMedia  = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;


var videocap_templates = {
    
    videocap : {
	name : "Minispectro",
	subtitle : "A web/home experiment to discover spectroscopy",
	type : "videocap",
	ui_opts : { root_classes : ["container-fluid"],  child_classes : ["row"], name_classes : ["page-header"]},
	
	elements : {
	    video : {
		//name : "Spectro webcam capture",
		//intro : "Click start to start capture",
		ui_opts : { child_view_type : "tabbed", root_classes : ["col-md-5"],child_classes : ["container-fluid"]},
		elements : {
		    controls : {
			name : "Controls",
			ui_opts :  {fa_icon : "play",root_classes : ["col-md-12"],child_classes : ["btn-group"], render_name : false},
			elements : {
			    start : {
				name : "Start webcam",
				type : "action",
				ui_opts :  {fa_icon : "play",root_classes : [""]}
			    },
			    stop : {
				name : "Stop",
				type : "action",
				ui_opts :  { fa_icon : "stop",root_classes : [""] }
			    },
			}
		    },
		    options : {
			name : "options",
			ui_opts : {child_view_type : "pills", render_name : false},
			elements : {
			    integrate : {
				name  : "Average frames",
				ui_opts : { label : false, root_classes : [""] },
				intro : "Sum up frames to reduce noise",
				elements : {
				    enable : {
					name : "Enable",
					ui_opts : { label : true, root_classes : [], type : "edit" },
					type : "bool",
					value : true
				    },
				    nframes : {
					type : "double",
					name : "Number of images to accumulate",
					ui_opts : { type : "edit", label : true, root_classes : ["inline"] },
					step : 1,
					value : 5,
					min : 2,
					max : 100
				    }
				}
			    },
			    box : {
				name : "Spectrum region",
				subtitle : "Adjust the spectrum area within image",
				ui_opts :  {fa_icon : "wrench",root_classes : ["col-md-12"],child_classes : ["container"]},
				
				elements : {
				    x : {
					name: "x",
					type: "double",
					value : 300,
					ui_opts : { type : "edit", label : true, root_classes : ["inline"]}
				    },
				    y : {
					name: "y",
					type: "double",
					value : 50,
					ui_opts : { type : "edit", label : true, root_classes : ["inline"]}
				    },
				    w : {
					name: "width",
					type: "double",
					value : 30,
					ui_opts : { type : "edit", label : true, root_classes : ["inline"]}
				    },
				    h : {
					name: "height",
					type: "double",
					value : 300,
					ui_opts : { type : "edit", label : true, root_classes : ["inline"]}
				    }
				}
			    }
			}
		    },
		    
		}
	    },
	    spectrum : {
		name : "Spectrum view",
		subtitle : "One dimensional spectra (R,G,B)",
		ui_opts : { fa_icon : "line-chart", root_classes : ["col-md-7"], child_classes : ["container-fluid"], item_classes : []},
		type : "template",
		template_name : "vector",
		y_range : [0, 255]
	    }
	}
    }
    
};




template_ui_builders.videocap=function(ui_opts, vc){
    console.log("Videocap constructor !");
    //var main_node=vc.ui=ce("div"); main_node.class_name="container-fluid";
    var video=vc.elements.video;
    var spectrum=vc.elements.spectrum;

    var controls=video.elements.controls;
    var spectro_view=spectrum;
    var options=video.elements.options;
    var spectro_box=options.elements.box.elements;

    var start=controls.elements.start;
    var stop=controls.elements.stop;

    var integ=options.elements.integrate.elements.enable;
    var integ_nf=options.elements.integrate.elements.nframes;
    
    var video_container=cc("div",video.ui_root);
    video_container.className="col-md-12";
    var video_node=cc("video",video_container);
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

    
    var errorCallback = function(e) {
	console.log('capture error ' + e);
    };

    video_node.addEventListener("loadeddata", function(){
	
	var iv=setInterval(function(){
	    if(video_node.videoWidth!==0){
		canvas.width= video_node.videoWidth;
		canvas.height=video_node.videoHeight;
		console.log("LOADED ! canvas w = %d video w = %d",canvas.width,video_node.videoWidth);
		clearInterval(iv);
	    }
	    
	}, 100);

    });

    var iv_cap;

    stop.disable(true);
    
    stop.listen("click",function(){
	if(iv_cap){
	    clearInterval(iv_cap);
	}
	
	if (stream) {
	    stream.stop();
	}

	start.disable(false);
	stop.disable(true);
    });

    start.listen("click",function(){
	// Not showing vendor prefixes.
	if (hasGetUserMedia()) {
	    // Good to go!
	} else {
	    alert('getUserMedia() is not supported in your browser');
	    return vc.ui;
	}
	if (navigator.getUserMedia) {
	    navigator.getUserMedia({audio: false, video: true}, function(stream_in) {
		video_node.src = window.URL.createObjectURL(stream_in);
		stream=stream_in;
		
		//console.log("cavas w = %d video w = %d",canvas.width,video_node.innerWidth);
		var iv_delay=integ.value? 100 : 100;
		if (stream) {
		    iv_cap=setInterval(function(){
			// "image/webp" works in Chrome.
			// Other browsers will fall back to image/png.
			//img_node.src = canvas.toDataURL('image/webp');
			draw_spectrum();
		    }, iv_delay );
		    
		}
		
		start.disable(true);
		stop.disable(false);
		
	    }, errorCallback);
	} else {
	    console.log("Nu getUserMedia !!!");
	    return vc.ui;
	    vc.ui.src = 'somevideo.webm'; // fallback.
	}
    });

    var buf_data=[];
    var seq=0;
    var bx,by,bw,bh;
    var spec_data={r : [], g: [], b : [], t : [] };


    
    var pr=spectro_view.add_plot_linear(spec_data.r,0,1);
    var pg=spectro_view.add_plot_linear(spec_data.g,0,1);
    var pb=spectro_view.add_plot_linear(spec_data.b,0,1);
    var pt=spectro_view.add_plot_linear(spec_data.t,0,1);
    
    pr.set_opts({ stroke : "red", label : "Red"});
    pg.set_opts({ stroke : "green", label : "Green"});
    pb.set_opts({ stroke : "blue", label : "Blue"});
    pt.set_opts({ stroke : "orange", stroke_width : "3px", label : "(R+G+B)/3"});

    
    function draw_spectrum_box(){

	bx=spectro_box.x.value;
	by=spectro_box.y.value;
	bw=spectro_box.w.value;
	bh=spectro_box.h.value;

	//console.log("Spectrum box %d %d %d %d",bx,by,bw,bh );
	
	ctx.beginPath();
	ctx.strokeStyle="red";
	ctx.rect(bx,by,bw,bh);
	ctx.stroke();
	ctx.closePath();
    }

    var frid=0;
    
    function draw_spectrum(){
	//console.log("Canvas w,h %d %d" ,canvas.width,canvas.height);
	
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
		draw_spectrum_box();
		return;
	    }
	    
	}else{
	    buf_data=buf.data;
	}

	draw_spectrum_box();

	for(var i=0;i<bh;i++){
	    spec_data.r[i]=0;
	    spec_data.g[i]=0;
	    spec_data.b[i]=0;
	    for(var j=0;j<bw;j++){
		var idx=((i+by)*canvas.width + (j+bx))*4;
		spec_data.r[i]+= buf_data[ idx ];
		spec_data.g[i]+= buf_data[ idx+1 ];
		spec_data.b[i]+= buf_data[ idx+2 ];
		// if(i===0 && j===0)
		//     console.log(buf_data[ idx ] + ", " + buf_data[ idx+1 ]+ ", " +buf_data[ idx+2 ]);
	    }
	    spec_data.r[i]/=bw*1.0;
	    spec_data.g[i]/=bw*1.0;
	    spec_data.b[i]/=bw*1.0;

	    spec_data.t[i]=(spec_data.r[i]+spec_data.g[i]+spec_data.b[i])/3.0;
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

	


