const DUDUK = "(duduk)";
const BERDIRI = "(berdiri)";
const JEMAAT_DUDUK = "Jemaat Duduk";
const JEMAAT_BERDIRI = "Jemaat Berdiri";
const BLANK = "((blank))";
const BUMPER = "((bumper))";
const NOT_ANGKA = "((not angka))";
const NOT_ANGKA_FULL = "((not angka full))";

const RGB_GREEN = "rgb(0, 128, 0)";
const RGB_DARK_GREEN = "rgb(12, 66, 1)";
const RGB_BLUE = "rgb(0, 0, 255)";
const RGB_YELLOW = "rgb(255, 255, 0)";
const RGB_PURPLE = "rgb(128, 0, 128)";
const RGB_BLACK = "rgb(37, 37, 37)";
const RGB_WHITE = "rgb(255, 255, 255)";

const defaultSlideHeaderText = "Kebaktian Umum";
const defaultCongregationInstructionText = "";
// const defaultNotesText = "Kebaktian";

const OPTION_NO_ANIMATION = "no animation";
const TRANSITION_DURATION = 300;

function removeDOMWithPrevOrNextBr(DOMElement) {
  const prev = DOMElement.prev()
  const next = DOMElement.next()
  if (prev.is("br")) {
    prev.remove();
  }
  if (next.is("br")) {
    next.remove();
  }
  DOMElement.remove()
}

window.OpenLP = {
  animateDOMTextTransition: function (DOMText_1, DOMText_2, useSecondDOM, differentiateAnimation = false) {
    let doms = [DOMText_1, DOMText_2];
    let [hiddenIdx, shownIdx] = useSecondDOM ? [0,1] : [1,0]
    // Don't use animation if they have same text
    let transitionDuration = DOMText_1.text() == DOMText_2.text() || !OpenLP.useAnimation ? 0 : OpenLP.transitionDuration;

    /* we need this so we can do animation without DOM movement */
    if (differentiateAnimation && doms[hiddenIdx].text().length > doms[shownIdx].text().length) {
      doms[hiddenIdx].css("position", "");
      doms[shownIdx].css("position", "absolute");
      doms[hiddenIdx].fadeOut(transitionDuration, () => {
        doms[hiddenIdx].css("position", "absolute");
      });
      doms[shownIdx].fadeIn(transitionDuration, () => {
        doms[shownIdx].css("position", "");
      });
    } else {
      doms[hiddenIdx].css("position", "absolute");
      doms[shownIdx].css("position", "");
      doms[hiddenIdx].fadeOut(transitionDuration);
      doms[shownIdx].fadeIn(transitionDuration);
    }
  },
  animateDOMImageTransition: function (DOMImage_1, DOMImage_2, useSecondDOM) {
    let doms = [DOMImage_1, DOMImage_2];
    let [hiddenIdx, shownIdx] = useSecondDOM ? [0,1] : [1,0]
    // Don't use animation if they have same image source
    let transitionDuration = DOMImage_1[0].src == DOMImage_2[0].src || !OpenLP.useAnimation ? 0 : OpenLP.transitionDuration;
    
    /* we need this so we can do animation without DOM movement */
    doms[hiddenIdx].css("position", "absolute");
    doms[shownIdx].css("position", "");
    doms[hiddenIdx].fadeOut(transitionDuration);
    if (doms[shownIdx][0].src) {
      doms[shownIdx].fadeIn(transitionDuration);
    }
  },

  loadSlide: function (event) {
    $.getJSON(
      "/api/controller/live/text",
      function (data, status) {
        const currentSlide = data.results.slides[OpenLP.currentSlide];

        // Get header
        $("#interim").html(currentSlide.html);
        let DOMSlideHeaderTexts = $("#interim").find(".slide-header-texts")
        let slideHeaderText = defaultSlideHeaderText
        if (DOMSlideHeaderTexts.length > 0) {
          slideHeaderText = Array.from(DOMSlideHeaderTexts, (el) => el.innerHTML);

          removeDOMWithPrevOrNextBr(DOMSlideHeaderTexts);
        }
        slideHeaderText = slideHeaderText.join('\n').trim();

        // Get congregation instruction
        let DOMCongregationInstructionTexts = $("#interim").find(".congregation-instruction-texts")
        let congregationInstructionText = defaultCongregationInstructionText
        if (DOMCongregationInstructionTexts.length > 0) {
          congregationInstructionText = DOMCongregationInstructionTexts[0].innerHTML;
          if (congregationInstructionText.includes(DUDUK)) {
            congregationInstructionText = JEMAAT_DUDUK
          } else if (congregationInstructionText.includes(BERDIRI)) {
            congregationInstructionText = JEMAAT_BERDIRI
          }

          removeDOMWithPrevOrNextBr(DOMCongregationInstructionTexts);
        }
        congregationInstructionText = congregationInstructionText.trim();

        // Juggle the use of 2 text-container elements for text transition animation
        const DOMSlideFullImage_1 = $("#slide-full-image-1");
        const DOMSlideFullImage_2 = $("#slide-full-image-2");
        const DOMMainText_1 = $("#main-text-1");
        const DOMMainText_2 = $("#main-text-2");
        const DOMMainImage_1 = $("#main-image-1");
        const DOMMainImage_2 = $("#main-image-2");
        const DOMCongInstText_1 = $("#congregation-instruction-text-1");
        const DOMCongInstText_2 = $("#congregation-instruction-text-2");
        const DOMSlideHeaderText_1 = $("#slide-header-text-1");
        const DOMSlideHeaderText_2 = $("#slide-header-text-2");
        let isUsingSecondDOMGroup = DOMMainText_2.css("display") == "none";
        
        let DOMSlideFullImage = DOMSlideFullImage_1;
        let DOMMainText = DOMMainText_1;
        let DOMMainImage = DOMMainImage_1;
        let DOMCongInstText = DOMCongInstText_1;
        let DOMSlideHeaderText = DOMSlideHeaderText_1;
        if (isUsingSecondDOMGroup) {
          DOMSlideFullImage = DOMSlideFullImage_2;
          DOMMainText = DOMMainText_2;
          DOMMainImage = DOMMainImage_2;
          DOMCongInstText = DOMCongInstText_2;
          DOMSlideHeaderText = DOMSlideHeaderText_2;
        }

        // Get content
        let mainText = $("#interim")[0].innerHTML;
        mainText = mainText.trim()
        
        // Hide and show main-text's lower third
        let lowerThirdFadeInDuration = OpenLP.useAnimation ? OpenLP.transitionDuration / 2: 0;
        let lowerThirdFadeOutDuration = OpenLP.useAnimation ? OpenLP.transitionDuration / 12 : 0;
        if (mainText == "" || mainText.startsWith(BUMPER) || mainText.startsWith(NOT_ANGKA_FULL)) {
          $("#slide-main").fadeOut(lowerThirdFadeInDuration)
        } else {
          $("#slide-main").fadeIn(lowerThirdFadeOutDuration)
        }

        // ---------- HANDLE BUMPERS AND "NOT_ANGKA"S ----------
        const DOMVideo = $("#slide-video");
        const DOMBlackScreen = $("#slide-black");
        const DOMWhiteScreen = $("#slide-white");
        // Video play/stop, black & white screen management
        if (mainText.startsWith(BUMPER)) {
          DOMBlackScreen.fadeIn(TRANSITION_DURATION);
          DOMVideo.fadeIn(TRANSITION_DURATION/2);
          DOMVideo[0].setAttribute("src", "/stage/videos/" + mainText.slice(BUMPER.length+1));
          DOMVideo[0].load();
          DOMVideo[0].play();
        } else if (mainText.startsWith(NOT_ANGKA_FULL)) {
          DOMWhiteScreen.fadeIn(TRANSITION_DURATION);
        } else {
          DOMBlackScreen.fadeOut(0);
          DOMWhiteScreen.fadeOut(0);
          DOMVideo.fadeOut(TRANSITION_DURATION);
          DOMVideo[0].pause();
          DOMVideo[0].removeAttribute("src");
        }
        
        // Set image src for "Not_Angka"
        if (mainText.startsWith(NOT_ANGKA)) {
          DOMMainImage[0].src = "/stage/images/" + mainText.slice(NOT_ANGKA.length+1);
        } else {
          DOMMainImage[0].removeAttribute("src");
        }
        
        if (mainText.startsWith(NOT_ANGKA_FULL)) {
          DOMSlideFullImage[0].src = "/stage/images/" + mainText.slice(NOT_ANGKA_FULL.length+1);
        } else {
          DOMSlideFullImage[0].removeAttribute("src");
        }
        // ---------- END OF HANDLE BUMPERS AND "NOT_ANGKA"S ----------


        // Set HTML values
        DOMCongInstText.html(congregationInstructionText);
        DOMSlideHeaderText.html(slideHeaderText);
        if (mainText.startsWith(BLANK) || mainText.startsWith(BUMPER) || mainText.startsWith(NOT_ANGKA) || mainText.startsWith(NOT_ANGKA_FULL)) {
          DOMMainText.html("");
        } else {
          DOMMainText.html(mainText);

          // Wrap all elements with <p> (for background-color) & remove <br/>
          let shouldWrapWithP = true;
          let wrapper;
          let i = 0;
          for (node of DOMMainText.contents()) {
            if (node.nodeName == "BR") {
              node.remove();
              shouldWrapWithP = true;
              continue;
            }
            if (shouldWrapWithP) {
              wrapper = document.createElement("p");
              node.after(wrapper);
              wrapper.appendChild(node);
              shouldWrapWithP = false;
            } else {
              wrapper.appendChild(node);
            }
          }
        }
        

        // ---------- ADJUSTMENTS ----------
        // Outlines
        let spans = DOMMainText.find("span");
        spans.each(function() {
          let textColor = $(this).css("-webkit-text-fill-color")
          switch(textColor) {
            // case RGB_GREEN:
            // case RGB_DARK_GREEN:
            // case RGB_PURPLE:
            // case RGB_BLACK:
            //   $(this).addClass("shadow-white");
            //   break;
            case RGB_YELLOW:
            case RGB_WHITE:
              $(this).addClass("shadow-black");
              break;
            case RGB_BLUE:
              $(this).css("-webkit-text-fill-color", "rgb(0, 68, 255)")
              break;
          }
        });

        // Line-height on small styles (small texts should have narrower line-height)
        
        // TODO: remove the BR from naming as the BRs' are already removed anyway while setting DOMMainText.html(mainText);
        let nonBrElements = 0;
        let nonBrSmallElements = 0;
        for (element of DOMMainText.contents()) {
          if (element.tagName != "BR") {
            nonBrElements += 1
            // if (element.className == "small") {
            if (element.firstChild.className == "small") {
              nonBrSmallElements += 1
            }
          }
        }
        if (nonBrElements != 0 && nonBrElements == nonBrSmallElements) {
          DOMMainText.css("line-height", "75%")
        } else {
          DOMMainText.css("line-height", "100%")
        }
        // ---------- END OF ADJUSTMENTS ----------

        // Switch the text-container elements visibility for transition animation
        OpenLP.animateDOMTextTransition(DOMMainText_1, DOMMainText_2, isUsingSecondDOMGroup);
        OpenLP.animateDOMTextTransition(DOMCongInstText_1, DOMCongInstText_2, isUsingSecondDOMGroup);
        OpenLP.animateDOMTextTransition(DOMSlideHeaderText_1, DOMSlideHeaderText_2, isUsingSecondDOMGroup, true);
        OpenLP.animateDOMImageTransition(DOMSlideFullImage_1, DOMSlideFullImage_2, isUsingSecondDOMGroup);
        OpenLP.animateDOMImageTransition(DOMMainImage_1, DOMMainImage_2, isUsingSecondDOMGroup);



        // const options = { year: 'numeric', month: 'long', day: '2-digit' };
        // const date = new Date()
        // $("#slide-date").html(date.toLocaleDateString("id-id", options));
      }
    );

    $.getJSON(
      "/api/service/list",
      function (data, status) {
        for (idx in data.results.items) {
          idx = parseInt(idx, 10);
          if (data.results.items[idx]["selected"]) {
            let notesText = data.results.items[idx].notes;
            if (isNaN(notesText)) {
              window.OpenLP.useAnimation = !notesText.includes(OPTION_NO_ANIMATION);
            } else {
              let parsedInt = Number(notesText);
              OpenLP.transitionDuration = parsedInt != 0 ? parsedInt : TRANSITION_DURATION;
            }
            break;
          }
        }
      }
    );
  },

  pollServer: function () {
    $.getJSON(
      "/api/poll",
      function (data, status) {
        if (OpenLP.currentItem != data.results.item || OpenLP.currentService != data.results.service || OpenLP.currentSlide != data.results.slide) {
          OpenLP.currentItem = data.results.item;
          OpenLP.currentService = data.results.service;
          OpenLP.currentSlide = parseInt(data.results.slide, 10);
          OpenLP.loadSlide();
        }
      }
    );

  }
}

$.ajaxSetup({ cache: false });
OpenLP.useAnimation = true;
setInterval("OpenLP.pollServer();", 200);
OpenLP.pollServer();
