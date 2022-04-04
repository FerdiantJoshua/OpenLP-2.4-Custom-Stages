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

        // Get content
        let DOMMainText = $("#main-text");
        let mainText = $("#interim")[0].innerHTML;
        mainText = mainText.trim()
        
        // Set HTML values
        if (mainText == "") {
          $("#slide-main").addClass("invisible")
        } else {
          $("#slide-main").removeClass("invisible")
        }
        $("#congregation-instruction").html(congregationInstructionText);
        $("#slide-header-text").html(slideHeaderText);
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
          DOMMainText.css("line-height", "")
        }
        // ---------- END OF ADJUSTMENTS ----------

        // const options = { year: 'numeric', month: 'long', day: '2-digit' };
        // const date = new Date()
        // $("#slide-date").html(date.toLocaleDateString("id-id", options));
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
setInterval("OpenLP.pollServer();", 500);
OpenLP.pollServer();
