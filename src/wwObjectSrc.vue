<template>
	<div class="ww-slider slider-container">
		<div v-show="wwShowLeftNav && wwObject.content.data.arrows.show" class="slider-control left inactive" v-bind:class="{'slider-control-bg':wwObject.content.data.arrows.showBg}" v-bind:style="{color: wwObject.content.data.arrows.color}" v-on:click="wwNavigateLeft()"></div>
		<div v-show="wwShowRightNav && wwObject.content.data.arrows.show" class="slider-control right" v-bind:class="{'slider-control-bg':wwObject.content.data.arrows.showBg}" v-bind:style="{color: wwObject.content.data.arrows.color}" v-on:click="wwNavigateRight()"></div>
		<ul class="slider-pagi" v-show="wwObject.content.data.bullets.show">
			<!-- <div v-show="wwEditingSection" class="add-btn" v-on:click="wwAddSlide()">
				<i class="fa fa-plus" aria-hidden="true"></i>
			</div> -->
			<li class="slider-pagi__elem" v-bind:class="[true ? 'slider-pagi__elem-' + index : '', (wwSliderProps.curSlide == index) ? 'active': '']" v-for="(slide, index) in wwSlides" :key="slide.uniqueId" v-on:click="wwPagiClick(index)">
			</li>
		</ul>
		<div class="slider slider-h">
			<div v-for="(slide, index) in wwSlides" :key="slide.uniqueId">
				<div class="slide active" v-bind:class="'slide-' + index" v-bind:style="{'left': 100 * index + '%' }">
					<div class="slide-img-container">
						<div class="slide__bg" v-bind:style="{'left': -50 * index + '%' }" ww-object="slide.img" ww-category="background">
						</div>
					</div>
					<div class="slide__content" v-bind:class="{'editing': wwEditingSection}">
						<div class="slide__text">
							<wwObject v-bind:ww-object="slide.title" class="slide__text-heading"></wwObject>
							<wwObject v-bind:ww-object="slide.content" class="slide__text-desc"></wwObject>
						</div>
					</div>
					<!-- <div v-show="wwEditingSection" class="remove-btn" v-on:click="wwRemoveSlide(slide)">
						<i class="fa fa-times" aria-hidden="true"></i>
					</div> -->
				</div>
			</div>
		</div>
	</div>
</template>
 

<script>
export default {
	name: "ww-img-slider",
	props: {
		wwObject: {
			type: Object,
			default: {}
		},
		wwAttrs: {
			type: Object,
			default: {}
		}
	},
	data() {
		return {
			wwSlides: [],
			wwSliderProps: {
				sliderElement: null,
				curSlide: 0,
				animating: false,
				animTime: 500,
				autoSlideTimeout: null,
				autoSlideDelay: 6000,
				diff: 0,
				startX: 0
			},
			wwShowLeftNav: true,
			wwShowRightNav: true,
			wwEditingSection: false
		};
	},
	computed: {

	},
	watch: {
	},
	methods: {
		initSlider() {
			let wwObjData = this.wwObject.content.data;
			if (!wwObjData.slides) {
				wwObjData.slides = [];
			}
			this.wwSlides = wwObjData.slides;

			if (this.wwSlides.length == 0) {
				let newImage = wwLib.wwObject.getDefault();
				newImage.content = wwLib.wwObject.getDefaultContent("ww-image");

				let newTitle = wwLib.wwObject.getDefault();
				newTitle.content = wwLib.wwObject.getDefaultContent("ww-text");

				let newContent = wwLib.wwObject.getDefault();
				newContent.content = wwLib.wwObject.getDefaultContent("ww-text");

				this.wwSlides.push({
					img: newImage,
					title: newTitle,
					content: newContent,
					uniqueId: wwUtils.getUniqueId()
				});

				let sliderElement = this.$el.querySelector('.slider')

				sliderElement.on("mousedown touchstart", wwSliderMousedown);
			}

			this.wwSliderProps.sliderElement = this.$el.querySelector('.slider');

			this.wwAutoSlide()


			if (!this.wwObject.content.data.bullets) {
				this.wwObject.content.data.bullets = {
					show: true,
					color: ""
				}
			}

			if (!this.wwObject.content.data.arrows) {
				this.wwObject.content.data.arrows = {
					show: true,
					showBg: true,
					color: ""
				}
			}
		},
		wwSliderMousedown(e) {
			if (this.wwSliderProps.animating) return;

			clearTimeout(this.wwSliderProps.autoSlideTimeout);

			this.wwSliderProps.startX = e.pageX || e.originalEvent.touches[0].pageX

			this.wwSliderProps.diff = 0;

			document.on("mousemove touchmove", wwDocumentMousemove);
			document.on("mouseup touchend", wwSliderMouseup);

		},
		wwDocumentMousemove(e) {
			let x = e.pageX || e.originalEvent.touches[0].pageX;
			let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

			this.wwSliderProps.diff = (this.wwSliderProps.startX - x) / windowWidth * 70;
			if ((!this.wwSliderProps.curSlide && this.wwSliderProps.diff < 0) || (this.wwSliderProps.curSlide === this.wwSlides.length && this.wwSliderProps.diff > 0)) {
				this.wwSliderProps.diff /= 2;
			}
			this.wwSliderProps.sliderElement.css("transform", "translate3d(" + (-this.wwSliderProps.curSlide * 100 - this.wwSliderProps.diff) + "%,0,0)");
			this.wwSliderProps.sliderElement.find(".slide__bg").css("transform", "translate3d(" + (this.wwSliderProps.curSlide * 50 + this.wwSliderProps.diff / 2) + "%,0,0)");
		},
		wwAutoSlide() {
			let self = this;
			this.wwSliderProps.autoSlideTimeout = setTimeout(function () {
				self.wwSliderProps.curSlide++;
				if (self.wwSliderProps.curSlide > self.wwSlides.length - 1) { self.wwSliderProps.curSlide = 0; }
				self.wwChangeSlides();
			}, self.wwSliderProps.autoSlideDelay);
		},
		wwNavigateLeft() {
			if (this.wwSliderProps.animating) { return; }
			if (this.wwSliderProps.curSlide > 0) {
				this.wwSliderProps.curSlide--;
			}
			this.wwChangeSlides();
		},
		wwNavigateRight() {
			if (this.wwSliderProps.animating) { return; }
			if (this.wwSliderProps.curSlide < this.wwSlides.length - 1) {
				this.wwSliderProps.curSlide++;
			}
			this.wwChangeSlides();
		},
		wwChangeSlides(instant) {
			// show or hide controls
			this.wwShowLeftNav = true;
			this.wwShowRightNav = true;
			if (this.wwSliderProps.curSlide === 0) {
				this.wwShowLeftNav = false;
			}
			if (this.wwSliderProps.curSlide === this.wwSlides.length - 1) {
				this.wwShowRightNav = false;
			}

			if (!instant) {
				this.wwSliderProps.animating = true;
				//wwManageControls();
				this.wwSliderProps.sliderElement.classList.add('animating');
				// this.wwSliderProps.sliderElement.style.top = 0 + 'px';
				this.wwSliderProps.sliderElement.querySelector('.slide').classList.remove('active');
				this.wwSliderProps.sliderElement.querySelector('.slide-' + this.wwSliderProps.curSlide).classList.add('active');
				let self = this;
				setTimeout(function () {
					self.wwSliderProps.sliderElement.classList.remove('animating');
					self.wwSliderProps.animating = false;
				}, self.wwSliderProps.animTime);
			}
			window.clearTimeout(this.wwSliderProps.autoSlideTimeout);
			this.$el.querySelector('.slider-pagi__elem').classList.remove('active');
			this.$el.querySelector('.slider-pagi__elem-' + this.wwSliderProps.curSlide).classList.add('active');
			this.wwSliderProps.sliderElement.style.transform = 'translate3d(' + (-this.wwSliderProps.curSlide * 100) + '%,0,0)';
			this.wwSliderProps.sliderElement.querySelector('.slide__bg').transform = 'translate3d(' + this.wwSliderProps.curSlide * 50 + '%,0,0)';
			this.wwSliderProps.diff = 0;
			if (!this.wwEditingSection) { this.wwAutoSlide(); }
		}
	},
	mounted() {
		this.initSlider()

		wwLib.wwElementsStyle.applyAllStyles({
			wwObject: this.wwObject,
			lastWwObject: null,
			element: this.$el,
			noClass: false,
			noAnim: this.wwAttrs.wwNoAnim,
		});
	}
};
</script>

<style scoped>
.ww-slider {
  position: relative;
  width: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: all-scroll;
  overflow: hidden;
}

.ww-slider .slider-control {
  position: absolute;
  height: 50px;
  width: 50px;
  border-radius: 100%;
  line-height: 50px;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  z-index: 2;
  font-family: FontAwesome;
  color: white;
  cursor: pointer;
}

.ww-slider .slider-control-bg {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  background-color: rgba(255, 255, 255, 0.5);
}

.ww-slider .slider-control.right {
  right: 10px;
}

.ww-slider .slider-control.right:before {
  content: '\f054';
}

.ww-slider .slider-control.left {
  left: 10px;
}

.ww-slider .slider-control.left:before {
  content: '\f053';
}

.ww-slider .slider-pagi {
  position: absolute;
  text-align: center;
  z-index: 3;
  padding: 0px;
  left: 16%;
  width: 68%;
  bottom: 0;
  font-size: 0;
  list-style-type: none;
  -webkit-transition: -webkit-transform 0.5s;
  transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  transition: transform 0.5s, -webkit-transform 0.5s;
}

.ww-slider .slider-pagi__elem {
  position: relative;
  display: inline-block;
  vertical-align: top;
  width: 2rem;
  height: 2rem;
  margin: 0 0.5rem;
  border-radius: 50%;
  border: 2px solid #fff;
  cursor: pointer;
}

.ww-slider .slider-pagi__elem:before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1.2rem;
  height: 1.2rem;
  background: #fff;
  border-radius: 50%;
  -webkit-transition: -webkit-transform 0.3s;
  transition: -webkit-transform 0.3s;
  transition: transform 0.3s;
  transition: transform 0.3s, -webkit-transform 0.3s;
  -webkit-transform: translate(-50%, -50%) scale(0);
  transform: translate(-50%, -50%) scale(0);
}

.ww-slider .slider-pagi__elem.active:before,
.ww-slider .slider-pagi__elem:hover:before {
  -webkit-transform: translate(-50%, -50%) scale(1);
  transform: translate(-50%, -50%) scale(1);
}

.ww-slider .slider-pagi .add-btn {
  position: absolute;
  right: -30px;
  height: 20px;
  width: 20px;
  line-height: 16px;
  text-align: center;
  border-radius: 100%;
  border: 3px solid white;
  color: white;
  background-color: rgba(0, 0, 0, 0);
  font-size: 10px;
  cursor: pointer;
}

.ww-slider .slider {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.ww-slider .slider.animating {
  -webkit-transition: -webkit-transform 0.5s;
  transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  transition: transform 0.5s, -webkit-transform 0.5s;
  will-change: transform;
}

.ww-slider .slider.animating .slide__bg {
  -webkit-transition: -webkit-transform 0.5s;
  transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  transition: transform 0.5s, -webkit-transform 0.5s;
  will-change: transform;
}

.ww-slider .slide {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.ww-slider .slide.active .slide__text {
  opacity: 1;
  -webkit-transform: translate(0, -50%);
  transform: translate(0, -50%);
}

.ww-slider .slide__bg {
  position: absolute;
  top: 0;
  left: -50%;
  width: 100%;
  bottom: 0;
  background-size: cover;
  will-change: transform;
}

.ww-slider .slide {
  left: 0;
}

.ww-slider .slide__content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.ww-slider .slide__content.editing {
  position: absolute;
  top: 50%;
  left: 50%;
  bottom: auto;
  right: auto;
  width: 100%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.ww-slider .slide__text {
  width: calc(100% - 140px);
  top: 50%;
  left: 70px;
  position: absolute;
  -webkit-transition: opacity 0.5s 0.8s, -webkit-transform 0.5s 0.8s;
  transition: opacity 0.5s 0.8s, -webkit-transform 0.5s 0.8s;
  transition: transform 0.5s 0.8s, opacity 0.5s 0.8s;
  transition: transform 0.5s 0.8s, opacity 0.5s 0.8s,
    -webkit-transform 0.5s 0.8s;
  will-change: transform, opacity;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  opacity: 0;
}

.ww-slider .slider-h {
  height: 100%;
}

.ww-slider .section-subtitle {
  margin-top: 10px;
  margin-bottom: 0;
}

.ww-slider .slide__bg .ww-object-edit-button {
  right: 42px;
}

.ww-slider .slide-img-container {
  width: 100%;
  height: 100%;
  position: relative;
}

@media (max-width: 991px) {
}

@media (max-width: 991px) {
  .ww-slider .slide__text-heading {
  }
}

.ww-slider .slide__text-desc {
  margin-bottom: 1.5rem;
}

@media (max-width: 991px) {
  .ww-slider .slide__text-desc {
    display: none;
  }
}

.ww-slider .slider .remove-btn {
  position: absolute;
  top: 5px;
  right: 80px;
  height: 36px;
  line-height: 36px;
  width: 36px;
  text-align: center;
  color: #e73055;
  border-radius: 100%;
  -moz-border-radius: 100%;
  -webkit-border-radius: 100%;
  background-color: white;
  box-sizing: 0 1px 1px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  pointer-events: all;
}
</style>
