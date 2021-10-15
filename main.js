var cu = window.location.href,
        re = "/ReferenceExport.aspx?id=",
        ow = /^.*oeb_entry.aspx\?(?:item|parent)=(\d+).*/;
if (ow.test(cu)) {
    var url = cu.replace(ow, re + "$1"),
            x1 = new XMLHttpRequest(),
            x2 = new XMLHttpRequest(),
            ris, n, i;
    x1.onreadystatechange = function () {
        if (x1.readyState === 4 && x1.status === 200) {
            if (x1.responseText) {
                var regexnodot = /(^TI  .*)[.]($)/gm;
                var ris = x1.responseText.replace(regexnodot, "$1$2"); // remove the dot at the end of the title
                ris = ris.replace(/(^TI)(  .*?):(.*$)/gm, "$1$2:$3\r\nST$2"); // add a shortened title (the portion of the title before the colon)
                ris = ris.replace(/(^N2)(  -.*$)/gm, "N1$2"); // replace N2, unsupported by Zotero, by N1
                ris = ris.replace(/(^DB  -.*\r\n)/gm, "");
                if (ris.indexOf("TY  - Book") >= 0 || ris.indexOf("TY  - EdBook") >= 0) {
                    n = ris.lastIndexOf("VL  -");
                    if (n >= 0) {
                        ris = ris.substring(0, n) + "M1  -" + ris.substring(n + 5);
                    }
                }
                if (ris.indexOf("TY  - Chap") >= 0) {
                    var pareg = new RegExp("x\\?parent=(.*?)\">", "gm");
                    var par = pareg.exec(document.body.innerHTML)[0];
                    url = re + par.substr(9, par.length - 11);
                    x2.onreadystatechange = function () {
                        if (x2.readyState === 4 && x2.status === 200) {
                            if (x2.responseText) {
                                var pa = x2.responseText;//.replace(regexnodot, "$1$2");
                                pareg = new RegExp("T2\\s\\s-\\s(.*?)\\r", "gm");
                                par = pareg.exec(pa);
                                if (par !== null) {
                                    var p = par[0];
                                    ris = ris.replace("\r\nER", "\r\nT3  - " + p.substr(6, p.length - 7) + " \r\nER");
                                }
                                n = pa.lastIndexOf("VL  -");
                                if (n >= 0) {
                                    i = pa.indexOf("\r\n", n + 1);
                                    ris = ris.replace("\r\nER", "\r\nSV  - " + pa.substring(n + 5, i) + " \r\nER");
                                }
                            }
                            dlris(ris);
                        }
                    };
                    x2.open("GET", url, true);
                    x2.send(null);
                } else {
                    dlris(ris);
                }
            }
        }
    };
    x1.open("GET", url, true);
    x1.send(null);
}

function dlris(ris) {
    if (window.navigator.msSaveOrOpenBlob) {
        blob = new Blob([ris], {
            type: "application/x-research-info-systems"
        });
        window.navigator.msSaveOrOpenBlob(blob, "oebexport.ris");
    } else {
        window.open("data:application/x-research-info-systems; charset=UTF-8, " + encodeURI(ris));
    }
}