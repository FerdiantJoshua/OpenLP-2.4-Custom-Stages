const defaultSlideHeaderText = "Kebaktian Minggu Adven";
// const defaultNotesText = "Kebaktian";

window.OpenLP = {
  loadSlide: function (event) {    
    $.getJSON(
      "/api/controller/live/text",
      function (data, status) {
        const currentSlide = data.results.slides[OpenLP.currentSlide];

        $("#interim").html(currentSlide.html);
        let slideHeaderTexts = $("#interim").find(".slide-header-texts")
        if (slideHeaderTexts.length > 0) {
          $("#slide-header-text").html(slideHeaderTexts[0].innerHTML);
          slideHeaderTexts.remove()
        } else {
          $("#slide-header-text").html(defaultSlideHeaderText);
        }

        let mainText = $("#interim")[0].innerHTML;
        if (mainText.startsWith("<br>")) {
          mainText = mainText.slice(4);
        }
        if (mainText.length > 0) {
          $("#main-text").html(mainText);
        } else {
          $("#main-text").html("");
        }

        if ($("#main-text").find("span").css("-webkit-text-fill-color") == "rgb(255, 255, 0)") {
          $("#main-text").removeClass("shadow-white").addClass("shadow-black");
        } else {
          $("#main-text").removeClass("shadow-black").addClass("shadow-white");
        }

        // const options = { year: 'numeric', month: 'long', day: '2-digit' };
        // const date = new Date()
        // $("#slide-date").html(date.toLocaleDateString("id-id", options));
      }
    );

    // $.getJSON(
    //   "/api/service/list",
    //   function (data, status) {
    //     OpenLP.nextSong = "";
    //     $("#notes").html(defaultNotesText);
    //     for (idx in data.results.items) {
    //       idx = parseInt(idx, 10);
    //       if (data.results.items[idx]["selected"]) {
    //         $("#notes").html(data.results.items[idx].notes);
    //         break;
    //       }
    //     }
    //   }
    // );
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
