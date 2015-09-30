"use strict";

// background animation
(function() {

	var Base, Particle, canvas, colors, context, draw, drawables, i, mouseX, mouseY, mouseVX, mouseVY, rand, update, click, min, max, colors, particles;

	min = 1;
	max = 8;
	particles = 200;
	colors = ["64, 32, 0", "250, 64, 0", "64, 0, 0", "200, 200, 200"];

	rand = function(a, b) {
		return Math.random() * (b - a) + a;
	};

	Particle = (function() {
		function Particle() {
			this.reset();
		}

		Particle.prototype.reset = function() {
			this.color = colors[~~(Math.random()*colors.length)];
			this.radius = rand(min, max);
			this.x = rand(0, canvas.width);
			this.y = rand(-20, canvas.height*0.5);
			this.vx = -5 + Math.random()*10;
			this.vy = 0.7 * this.radius;
			this.valpha = rand(0.02, 0.09);
			this.opacity = 0;
			this.life = 0;
			this.onupdate = undefined;
			this.type = "dust";
		};

		Particle.prototype.update = function() {
			this.x = (this.x + this.vx/3);
			this.y = (this.y + this.vy/3);

			if(this.opacity >=1 && this.valpha > 0) this.valpha *=-1;
			this.opacity += this.valpha/3;
			this.life += this.valpha/3;

			if(this.type === "dust")
				this.opacity = Math.min(1, Math.max(0, this.opacity));
			else
				this.opacity = 1;

			if(this.onupdate) this.onupdate();
			if(this.life < 0 || this.radius <= 0 || this.y > canvas.height){
				this.onupdate = undefined;
				this.reset();
			}
		};

		Particle.prototype.draw = function(c) {
			c.strokeStyle = "rgba(" + this.color + ", " + Math.min(this.opacity, 0.85) + ")";
			c.fillStyle = "rgba(" + this.color + ", " + Math.min(this.opacity, 0.65) + ")";
			c.beginPath();
			c.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
			c.fill();
			c.stroke();
		};

		return Particle;

	})();

	mouseVX = mouseVY = mouseX = mouseY = 0;

	canvas = document.getElementById("bg");
	context = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	drawables = (function() {
		var _i, _results;
		_results = [];
		for (i = _i = 1; _i <= particles; i = ++_i) {
			_results.push(new Particle);
		}
		return _results;
	})();

	draw = function() {
		var d, _i, _len;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		context.clearRect(0, 0, canvas.width, canvas.height)

		//context.fillRect(0, 0, canvas.width, canvas.height);
		for (_i = 0, _len = drawables.length; _i < _len; _i++) {
			d = drawables[_i];
			d.draw(context);
		}
	};

	update = function() {
		var d, _i, _len, _results;
		_results = [];
		for (_i = 0, _len = drawables.length; _i < _len; _i++) {
			d = drawables[_i];
			_results.push(d.update());
		}
		return _results;
	};

	document.onmousemove = function(e) {
		mouseVX = mouseX;
		mouseVY = mouseY;
		mouseX = ~~e.pageX;
		mouseY = ~~e.pageY;
		mouseVX = ~~((mouseVX - mouseX)/2);
		mouseVY = ~~((mouseVY - mouseY)/2);

	};

	click = function(e){
		var p = new Particle;
		p.x = drawables[0].x;
		p.y = drawables[0].y;
		p.vy = -20;
		p.vx = 0;
		p.valpha = 0;
		p.type = "bullet";
		p.color = "255, 0, 0";
		p.radius = 2;
		p.onupdate = function(){
			if(this.y <= canvas.height/7*2){
				this.radius = 0;
				for(var i = 0, _len = ~~(Math.random()*100)+50; i<_len; i++){
					var b = new Particle;
					b.x = this.x;
					b.y = this.y;
					b.radius = Math.random() * 2;
					b.color = ~~(0*Math.random()+255)+", "+~~(100*Math.random()+49)+", 0 ";
					b.vx = Math.random()*3-1.5;
					b.vy = Math.random()*3-1.5-5;
					b.onupdate = function(){this.vy += 0.2; if(this.opacity <= 0) this.onupdate = undefined;}
					drawables.push(b);
				}
			}
		}
		drawables.push(p)
	}

	window.addEventListener('resize', draw, false);
	setInterval(draw, 1000 / 30);
	setInterval(update, 1000 / 60);
}).call(this);


// interactions
$(function(){

	var scrollIndex = 1;

	$(window).on('hashchange', function(e){


		ga('send', 'event', 'browse', 'view', window.location.hash);

		var subsection = window.location.hash.split('/');
		var section = $(subsection[0]);

		if(!!section.length){
			if(!section.is('.expand')){
				$('main ul').not(section).removeClass('expand').addClass('contract');
				section.removeClass('contract').addClass('expand');

				$('.open').removeClass('open').animate({height: 0, marginTop: 0}, {duration:150, queue:false}).animate({opacity: 0}, {duration:150, queue:false});
				$('li', section).addClass("open").show().css({opacity:0, height: 0}).animate({opacity:1, height: 100}, {duration:150, queue:false}).first().animate({marginTop: -101}, {duration:150, queue:false});
			}
		}else{
			$('.open').removeClass('open').animate({height: 0, marginTop: 0}, {duration:150, queue:false}).animate({opacity: 0}, {duration:100, queue:false});
			$('.expand, .contract, .details, .hidden').removeClass('expand contract details hidden');
		}

		if(subsection.length>1){
			$('header').addClass('active');
			var display = $('body main section.sub');
			if(!display.length || !display.is('#'+subsection[1])){
				display.fadeOut(350, function(){$(this).remove();});
				var content = $('<section class="sub"><div class="close">x</div></section>').append($(subsection[0]+' #'+subsection[1]+' .content').html());
				$('body main').append(content.hide().fadeIn(350));
			} // else there's nothing to do
		}else{
			$('section.sub').fadeOut(150, function(){$(this).remove();});
			$('header').removeClass('active');
		}
	}).on('resize', function(e){
		$('main').css({top:Math.max(119, window.innerHeight*0.3), marginLeft:(window.innerWidth<960)?0:'-480px', left:(window.innerWidth<960)?0:'50%'});

	}).on('mousewheel DOMMouseScroll', function(e){
		var d, dir, from, to, max;

		if(e.type==="DOMMouseScroll"){
			dir = e.originalEvent.detail / Math.abs(e.originalEvent.detail);
		}else{
			dir = (e.originalEvent.wheelDelta && e.originalEvent.wheelDelta <0 ) || e.detail < 0 || e.wheelDelta > 0 ? 1 : -1;
		}
		console.log(dir);

		scrollIndex += dir;
		scrollIndex = Math.max(1, Math.min(scrollIndex, $('main .open').length-2));

		$('main .open:first').animate({marginTop: -scrollIndex*101}, {queue: false, easing: "linear", duration: 150});
		//*/
	});

	$('body').on('click', function(e){
		window.getSelection().removeAllRanges();
		if($(e.target).is('body') || $(e.target).is('canvas')){
			window.location.hash = '';
			window.getSelection().removeAllRanges();
		}
	}).on('click', 'nav a', function(e){
		e.preventDefault();
		window.location.hash = e.target.getAttribute('href');

	}).on('click', 'main ul', function(e){
		if(e.target === e.currentTarget) window.location.hash = "#"+$(this).attr('id');
	}).on('click', 'main ul > li', function(e){
		if($(this).attr('id')) window.location.hash = "#"+$(this).parents('ul').attr('id')+'/'+$(this).attr('id');
		//e.preventDefault();
		$('.details').removeClass('details');
		$(e.currentTarget).addClass('details');
	}).on('click', 'main section .close', function(e){
		$('header').removeClass('active');
		$(e.currentTarget).parents('section').fadeOut(350, function(){$(this).remove();});
	});

	$(window).trigger('hashchange').trigger('resize');
});