
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
	ui_opts : { child_classes : ["row"]},
	
	elements : {
	    video : {
		//name : "Spectro webcam capture",
		//intro : "Click start to start capture",
		ui_opts : { root_classes : ["col-md-6"]},
		elements : {
		    controls : {
			elements : {
			    start : {
				name : "start",
				type : "action",
				ui_opts :  {fa_icon : "play"}
			    },
			    stop : {
				name : "stop",
				type : "action",
				ui_opts :  { fa_icon : "stop" }
			    },
		
			    integrate : {
				name  : "Accumulate pixels",
				ui_opts : { label : true, root_classes : ["inline"], type : "edit" },
				type : "bool",
				tip : "Accumulate frames to reduce noise",
				elements : {
				    nframes : {
					type : "double",
					name : "Number of frames to accumulate",
					ui_opts : { type : "edit", label : true, root_classes : ["inline"] },
					step : 1,
					min : 2,
					max : 200
				    }
				}
			    }
			    
			}
		    },
		    box : {
			//name : "Spectrum region",
			//intro : "Adjust the spectrum area within image",
			ui_opts : { child_classes : ["row"]},
			elements : {
			    x : {
				name: "x",
				type: "double",
				value : 300,
				ui_opts : { type : "edit", label : true, root_classes : ["col-md-3"]}
			    },
			    y : {
				name: "y",
				type: "double",
				value : 50,
				ui_opts : { type : "edit", label : true, root_classes : ["col-md-3"]}
			    },
			    w : {
				name: "width",
				type: "double",
				value : 30,
				ui_opts : { type : "edit", label : true, root_classes : ["col-md-3"]}
			    },
			    h : {
				name: "height",
				type: "double",
				value : 300,
				ui_opts : { type : "edit", label : true, root_classes : ["col-md-3"]}
			    }
			}
			
		    }

		}
	    },
	    spectrum : {
		name : "Spectrum view",
		ui_opts : { root_classes : ["col-md-6"], child_classes : ["container-fluid"], item_classes : []},
		type : "template",
		template_name : "vector"
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
    var spectro_box=video.elements.box.elements;

    var start=controls.elements.start;
    var stop=controls.elements.stop;
    
    var video_node=cc("video",controls.ui_root);
    video_node.setAttribute("autoplay",true);
    video_node.style.display="none";
    //var img_node=cc("img",video.ui_root);
    var canvas=cc("canvas",video.ui_root);
    //canvas.style.display="none";
    //video_node.style.width=640;
    //video_node.style.height=640;
    
    var stream = null;

    var ctx = canvas.getContext('2d');

    //	<canvas style="display:none;"></canvas>
	
    
    var errorCallback = function(e) {
	console.log('capture error ' + e);
    };

    video_node.addEventListener("loadeddata", function(){
	//console.log("LOADED ! canvas w = %d video w = %d",canvas.width,video_node.videoWidth);
		
	canvas.width=video_node.videoWidth;
	canvas.height=video_node.videoHeight;

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
		
		console.log("cavas w = %d video w = %d",canvas.width,video_node.innerWidth);

		iv_cap=setInterval(function(){
		    if (stream) {
			ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
			ctx.drawImage(video_node, 0, 0);
			// "image/webp" works in Chrome.
			// Other browsers will fall back to image/png.
			//img_node.src = canvas.toDataURL('image/webp');
			draw_spectrum();
			
		    }
		    
		    //snap.trigger("click");
		}, 1000 );
		
		start.disable(true);
		stop.disable(false);
		
	    }, errorCallback);
	} else {
	    console.log("Nu getUserMedia !!!");
	    return vc.ui;
	    vc.ui.src = 'somevideo.webm'; // fallback.
	}
    });

    
    function draw_spectrum(){

	var buf = ctx.getImageData(0,0,canvas.width,canvas.height);
	var x=spectro_box.x.value;
	var y=spectro_box.y.value;
	var w=spectro_box.w.value;
	var h=spectro_box.h.value;

	console.log("Spectrum box %d %d %d %d",x,y,w,h );

	ctx.beginPath();
	ctx.strokeStyle="red";
	ctx.rect(x,y,w,h);
	ctx.stroke();
	ctx.closePath();
	
	var spec_data={r : [], g: [], b : [] };
	
	for(var i=0;i<h;i++){
	    //spec_data[i]=0;
	    for(var j=0;j<w;j++){
		var idx=(i+y)*canvas.width*4 + (j+x)*4;
		spec_data.r[i]= buf.data[ idx ];
		spec_data.g[i]= buf.data[ idx+1 ];
		spec_data.b[i]= buf.data[ idx+2 ];
	    }
	}
	
	//var step=spectro_view.step=1.0;
	//var start=spectro_view.start=0;

	spectro_view.set_value(spec_data.r);
	spectro_view.redraw();

	// var line=d3.svg.line()
	//     .x(function(d,i) { return x(tpl_item.start + i*tpl_item.step); })
	//     .y1(function(d) { return y(d); });
	//     .interpolate("linear");

	var pathsvg=spectro_view.context.append("path")
	    .datum(spec_data.g)
	    .attr("class", "line_green")
	    .attr("d", spectro_view.line);

	var pathsvg=spectro_view.context.append("path")
	    .datum(spec_data.b)
	    .attr("class", "line_blue")
	    .attr("d", spectro_view.line);
	
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

	


