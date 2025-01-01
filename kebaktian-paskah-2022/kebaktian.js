const DUDUK = "(duduk)";
const BERDIRI = "(berdiri)";
const JEMAAT_DUDUK = "Jemaat Duduk";
const JEMAAT_BERDIRI = "Jemaat Berdiri";
const BLANK = "((blank))";

const RGB_GREEN = "rgb(0, 128, 0)";
const RGB_BLUE = "rgb(0, 0, 255)";
const RGB_YELLOW = "rgb(255, 255, 0)";
const RGB_BLACK = "rgb(0, 0, 0)";
const RGB_WHITE = "rgb(255, 255, 255)";

const defaultSlideHeaderText = "Kebaktian Minggu Adven";
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
  animateDOMTextTransition: function (DOMText_1, DOMText_2, useSecondDOM) {
    // Don't use animation if they have same text
    let transitionDuration = DOMText_1.text() == DOMText_2.text() || !OpenLP.useAnimation ? 0 : OpenLP.transitionDuration;
    if (useSecondDOM) {
      DOMText_1.fadeOut(transitionDuration);
      DOMText_2.fadeIn(transitionDuration);
    } else {
      DOMText_1.fadeIn(transitionDuration);
      DOMText_2.fadeOut(transitionDuration);
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
        let tempSlideHeaderText = [defaultSlideHeaderText];
        if (DOMSlideHeaderTexts.length > 0) {
          tempSlideHeaderText = Array.from(DOMSlideHeaderTexts, (el) => el.innerHTML);

          removeDOMWithPrevOrNextBr(DOMSlideHeaderTexts);
        }
        let slideHeaderText = tempSlideHeaderText.join('\n').trim();

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
        const DOMMainText_1 = $("#main-text-1");
        const DOMMainText_2 = $("#main-text-2");
        const DOMCongInstText_1 = $("#congregation-instruction-text-1");
        const DOMCongInstText_2 = $("#congregation-instruction-text-2");
        const DOMSlideHeaderText_1 = $("#slide-header-text-1");
        const DOMSlideHeaderText_2 = $("#slide-header-text-2");
        let useSecondDOMGroup = DOMMainText_2.css("display") == "none";
        
        let DOMMainText = DOMMainText_1;
        let DOMCongInstText = DOMCongInstText_1;
        let DOMSlideHeaderText = DOMSlideHeaderText_1;
        if (useSecondDOMGroup) {
          DOMMainText = DOMMainText_2;
          DOMCongInstText = DOMCongInstText_2;
          DOMSlideHeaderText = DOMSlideHeaderText_2;
        }

        // Get content
        let mainText = $("#interim")[0].innerHTML;
        mainText = mainText.trim()
        
        // Hide and show main-text's lower third
        let lowerThirdFadeInDuration = OpenLP.useAnimation ? OpenLP.transitionDuration / 2: 0;
        let lowerThirdFadeOutDuration = OpenLP.useAnimation ? OpenLP.transitionDuration / 12 : 0;
        if (mainText == "") {
          $("#slide-main").fadeOut(lowerThirdFadeInDuration)
        } else {
          $("#slide-main").fadeIn(lowerThirdFadeOutDuration)
        }

        // Set HTML values
        DOMCongInstText.html(congregationInstructionText);
        DOMSlideHeaderText.html(slideHeaderText);
        if (mainText != BLANK) {
          DOMMainText.html(mainText);
        } else {
          DOMMainText.html("");
        }
        

        // ---------- ADJUSTMENTS ----------
        // Outlines
        let spans = DOMMainText.find("span");
        spans.each(function() {
          let textColor = $(this).css("-webkit-text-fill-color")
          if (textColor == RGB_GREEN || textColor == RGB_BLACK) {
            $(this).addClass("shadow-white");
          } else if (textColor == RGB_YELLOW || textColor == RGB_WHITE) {
            $(this).addClass("shadow-black");
          } else if (textColor == RGB_BLUE) {
            $(this).css("-webkit-text-fill-color", "rgb(0, 68, 255)")
          }
        });

        // Line-height on small styles (small texts should have narrower line-height)
        let nonBrElements = 0;
        let nonBrSmallElements = 0;
        for (element of DOMMainText.contents()) {
          if (element.tagName != "BR") {
            nonBrElements += 1
            if (element.className == "small") {
              nonBrSmallElements += 1
            }
          }
        }
        if (nonBrElements != 0 && nonBrElements == nonBrSmallElements) {
          DOMMainText.css("line-height", "90%")
        } else {
          DOMMainText.css("line-height", "125%")
        }
        // ---------- END OF ADJUSTMENTS ----------

        // Switch the text-container elements visibility for transition animation
        OpenLP.animateDOMTextTransition(DOMMainText_1, DOMMainText_2, useSecondDOMGroup);
        OpenLP.animateDOMTextTransition(DOMCongInstText_1, DOMCongInstText_2, useSecondDOMGroup);
        OpenLP.animateDOMTextTransition(DOMSlideHeaderText_1, DOMSlideHeaderText_2, useSecondDOMGroup);

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
