const defaultSlideHeaderText = "Kebaktian";
const defaultNotesText = "Kebaktian";

window.OpenLP = {
  loadSlide: function (event) {    
    $.getJSON(
      "/api/controller/live/text",
      function (data, status) {
        const currentSlide = data.results.slides[OpenLP.currentSlide];

        $("#slide-header-text").html(currentSlide.html);
        let slideHeaderTexts = $("#slide-header-text").find(".slide-header-texts")
        if (slideHeaderTexts.length > 0) {
          $("#slide-header-text").html(slideHeaderTexts[0].innerHTML);
        } else {
          $("#slide-header-text").html(defaultSlideHeaderText);
        }

        const options = { year: 'numeric', month: 'long', day: '2-digit' };
        const date = new Date()
        $("#slide-date").html(date.toLocaleDateString("id-id", options));
      }
    );

    $.getJSON(
      "/api/service/list",
      function (data, status) {
        OpenLP.nextSong = "";
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
      "/main/image",
      function (data, status) {
        let img = document.getElementById("slide-image");
        img.src = data.results.slide_image;
        img.style.display = 'block';
      }
    );
  },

  pollServer: function () {
    function checkSlideImage() {
      return $.getJSON(
        "/main/poll"
      );
    }

    function checkSlideText() {
      return $.getJSON(
        "/api/poll"
      );
    }

    $.when(checkSlideImage(), checkSlideText()).done((data1, data2) => {      
      let slide_count = data1[0].results.slide_count;
      let apiPollRes = data2[0].results;

      let slideImageNeedUpdate = OpenLP.slideCount != slide_count
      let slideTextNeedUpdate = OpenLP.currentItem != apiPollRes.item || OpenLP.currentService != apiPollRes.service || OpenLP.currentSlide != apiPollRes.slide

      // console.log("OpenLP.slideCount vs slideCount", OpenLP.slideCount, slide_count)
      if (slideImageNeedUpdate) {
        OpenLP.slideCount = slide_count;
      } 

      // console.log("OpenLP.currentItem vs currentItem", OpenLP.currentItem, apiPollRes.item)
      // console.log("OpenLP.currentService vs currentService", OpenLP.currentService, apiPollRes.service)
      // console.log("OpenLP.currentSlide vs currentSlide", OpenLP.currentSlide, parseInt(apiPollRes.slide, 10))
      if (slideTextNeedUpdate) {
        OpenLP.currentItem = apiPollRes.item;
        OpenLP.currentService = apiPollRes.service;
        OpenLP.currentSlide = parseInt(apiPollRes.slide, 10);
      }

      if (slideImageNeedUpdate || slideTextNeedUpdate) {
        OpenLP.loadSlide();
      }
    });
  }
}

$.ajaxSetup({ cache: false });
setInterval("OpenLP.pollServer();", 500);
OpenLP.pollServer();
