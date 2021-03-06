const DUDUK = "duduk";
const BERDIRI = "berdiri";
const JEMAAT_DUDUK = "Jemaat Duduk";
const JEMAAT_BERDIRI = "Jemaat Berdiri";
const BLANK = "((blank))";

const RGB_GREEN = "rgb(0, 128, 0)";
const RGB_BLACK = "rgb(0, 0, 0)";

const defaultSlideHeaderText = defaultNotesText = "Kebaktian Minggu";
const defaultCongregationInstructionText = "";
// const defaultNotesText = "Kebaktian";

function removeDOMWithPrevOrNextBr(DOMElement) {
  const prev = DOMElement.prev()
  const next = DOMElement.next()
  if (prev.is("br")) {
    prev.remove();
  } else if (next.is("br")) {
    next.remove();
  }
  DOMElement.remove()
}

window.OpenLP = {
  loadSlide: function (event) {
    // SET DATE
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const date = new Date()
    $("#slide-date").html(date.toLocaleDateString("id-id", options));

    // SET SERVICE TITLE IN NOTES
    $.getJSON(
      "/api/service/list",
      function (data, status) {
        $("#notes").html(defaultNotesText);
        for (idx in data.results.items) {
          idx = parseInt(idx, 10);
          if (data.results.items[idx]["selected"]) {
            $("#notes").html(data.results.items[idx].notes);
            break;
          }
        }
      }
    );

    $.getJSON(
      "/api/controller/live/text",
      function (data, status) {
        const currentSlide = data.results.slides[OpenLP.currentSlide];

        // Get header
        $("#interim").html(currentSlide.html);
        let DOMSlideHeaderTexts = $("#interim").find(".slide-header-texts")
        let slideHeaderText = defaultSlideHeaderText
        if (DOMSlideHeaderTexts.length > 0) {
          slideHeaderText = DOMSlideHeaderTexts[0].innerHTML;

          removeDOMWithPrevOrNextBr(DOMSlideHeaderTexts);
        }
        slideHeaderText = slideHeaderText.trim().toUpperCase();

        // Get congregation instruction
        let DOMCongregationInstructionTexts = $("#interim").find(".congregation-instruction-texts")
        let congregationInstructionText = defaultCongregationInstructionText;
        if (DOMCongregationInstructionTexts.length > 0) {
          congregationInstructionText = DOMCongregationInstructionTexts[0].innerHTML;
          if (congregationInstructionText.includes(DUDUK)) {
            congregationInstructionText = JEMAAT_DUDUK
          } else if (congregationInstructionText.includes(BERDIRI)) {
            congregationInstructionText = JEMAAT_BERDIRI
          } else if (congregationInstructionText.startsWith("(") && congregationInstructionText.endsWith(")")) {
            congregationInstructionText = congregationInstructionText.slice(1, congregationInstructionText.length-1)
          }

          removeDOMWithPrevOrNextBr(DOMCongregationInstructionTexts);
        }
        congregationInstructionText = congregationInstructionText.trim().toUpperCase();
        if (congregationInstructionText != "") {
          congregationInstructionText = "(" + congregationInstructionText + ")";
        }

        // Get content
        let mainText = $("#interim")[0].innerHTML;
        if (mainText.length == 0) {
          mainText = slideHeaderText;
        }
        mainText = mainText.trim()
        
        // Set HTML values
        $("#congregation-instruction").html(congregationInstructionText);
        $("#slide-header-text").html(slideHeaderText);
        $("#main-text").html("");
        if (slideHeaderText != mainText) {
          $("#main-text").html(mainText);
          if (mainText == BLANK) {
            $("#main-text").html("");
          }
        }

        // ADJUSTMENTS
        // Outlines
        let spans = $("#main-text").find("span")
        spans.each(function() {
          let textColor = $(this).css("-webkit-text-fill-color")
          if (textColor == RGB_GREEN || textColor == RGB_BLACK) {
            $(this).addClass("shadow-white");
          }
        });
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
setInterval("OpenLP.pollServer();", 200);
OpenLP.pollServer();
