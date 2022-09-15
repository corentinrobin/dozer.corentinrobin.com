// Auteur : Corentin ROBIN - corentin.robin@gmail.com
// Version : 18 juin 2020
// On charge le code source d'un site, on enlève tout pour ne garder que de l'HTML basique :
// - on ne garde que le <body>
// - on enlève script, style, meta, et link
// - on enlève tous les attributs de toutes les balises
// - on enlève les images

var Dozer =
{
    title : null,
    sizeBefore : 0,
    sizeAfter : 0,
    dataRemoved : 0,
    URLField : document.querySelector("input[type='text']"),
    loadButton : document.querySelector("input[type='button']"),
    keepPictures : false,
    source : "",

    load : function()
    {
        var URL = Dozer.URLField.value;
        Dozer.keepPictures = document.querySelector("#keepPictures").checked;

        if(URL.length > 0)
        {
            document.querySelector("body > header img").classList.add("shaking");
    
            Dozer.loadButton.value = "Loading...";

            var request = new XMLHttpRequest();
            request.addEventListener("load", Dozer.rip);

            // https://medium.com/netscape/hacking-it-out-when-cors-wont-let-you-be-great-35f6206cc646
            request.open("GET", "https://cors-anywhere.herokuapp.com/" + URL); // cors-anywhere.herokuapp.com est un proxy qui permet de contourner cette connerie de CORS

            request.send();
        }
    },

    rip : function()
    {
        var source = this.responseText;

        Dozer.sizeBefore = source.length;

        Dozer.title = /<title[\s\S]*?>([\s\S]*?)<\/title>/gi.exec(source)[1];
        Dozer.title = Dozer.title.replace(/<[\s\S]*?>/gi, "")

        // on ne garde que le body
        source = source.replace(/[\s\S]*?<body[\s\S]*?>([\s\S]*?)<\/body>[\s\S]*?/gi, "$1");

        if(Dozer.keepPictures)
        {
            source = source.replace(/<img([\s\S]*?)>/gi, "{{{$1}}}");
        }

        // on enlève tous les attribus
        source = source.replace(/<([A-Za-z0-9]+)[\s\S]*?>/gi, "<$1>");

        // on enlève script, style, meta, link, img, input etc.
        source = source.replace(/<script>[\s\S]*?<\/script>/gi, "");
        source = source.replace(/<style>[\s\S]*?<\/style>/gi, "");
        source = source.replace(/<iframe>[\s\S]*?<\/iframe>/gi, "");
        source = source.replace(/<select>[\s\S]*?<\/select>/gi, "");
        source = source.replace(/<textarea>[\s\S]*?<\/textarea>/gi, "");
        source = source.replace(/<\!\-\-[\s\S]*?\-\->/gi, "");
        source = source.replace(/<meta>/gi, "");
        source = source.replace(/<link>/gi, "");
        source = source.replace(/<input>/gi, "");
        source = source.replace(/<button>/gi, "");

        if(Dozer.keepPictures)
        {
            source = source.replace(/\{\{\{([\s\S]*?)\}\}\}/gi, "<img$1>");
        }

        else
        {
            source = source.replace(/<img>/gi, "");
        }

        Dozer.sizeAfter = source.length;

        Dozer.dataRemoved = 1 - (Dozer.sizeAfter / Dozer.sizeBefore);

        Dozer.source = source;

        Dozer.push();
    },

    push : function()
    {
        document.querySelector("body > header img").classList.remove("shaking");
        Dozer.loadButton.value = "Load";

        document.querySelector("#information").innerHTML = "<b>" + Dozer.title + "</b> &ndash; " +
        "Size before : <b>" + Math.round(Dozer.sizeBefore / 1000) + " ko</b> ; " +
                                                           "size after : <b>" + Math.round(Dozer.sizeAfter / 1000) + " ko</b> ; " + 
                                                           "data removed : <b>" + Math.round(Dozer.dataRemoved * 100) + "%</b>";

        document.querySelector("main > div").innerHTML = Dozer.source;
    },

    search : function()
    {
        var source = Dozer.source,
            keyword = document.querySelector("#keyword").value;

        if(keyword.length > 2)
        {
            source = source.replace(new RegExp("(" + keyword + ")", "gi"), "<span class='highlighted'>$1</span>");
        }

        document.querySelector("main > div").innerHTML = source;
    }
};