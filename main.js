

var showWelcomeTitlesFlag = true;
var isImageBeingProcessed = false;
var image;
$(document).ready(function () {

    /*extends click event of image-upload to add-image-button element*/
    $("#add-image-button").on("click", (e) => {
        $("#image-upload").trigger('click');
    });
    /* listens for image upload change*/
    $("#image-upload").on("change", handleImageChange);

    const loadMobilenetImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener('load', () => resolve(img));
            img.addEventListener('error', (err) => reject(err));
            img.src = src;
        })
    }

    //This function could be memoized
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var loadMobileNetModel = mobilenet.load();
    function handleImageChange(e) {

        var imgUrl = URL.createObjectURL(e.target.files[0]);
        loadMobilenetImage(imgUrl).then(async img => {
            const predictions = await (await (loadMobileNetModel)).classify(img);
            console.log(predictions);
            const wikipediaResponse = await fetch("https://en.wikipedia.org/w/rest.php/v1/search/page?" + new URLSearchParams({
                limit: 1,
                q: predictions[0].className.split(',')[0],
            }));
            const wikipediaData = (await wikipediaResponse.json()).pages[0];
            console.log(wikipediaResponse.status);
            if (wikipediaResponse.status === 200) {

                $("#app-single-result #result-image").src = imgUrl;
                $("#app-single-result .app-result-desc").html(wikipediaData.description);
                $("#app-single-result .app-result-title").html(capitalizeFirstLetter(predictions[0].className.split(',')[0]));
                $("#app-single-result .app-result-excerpt").html(wikipediaData.title + " " + (wikipediaData.excerpt.replace(/<\/?[^>]+(>|$)/g, "").split(';')[0]));
                $("#app-single-result  .app-result-conf-perc").html(parseFloat(predictions[0].probability).toFixed(2) + "%");
            }
        }).catch(err => console.error(err));

    }
});