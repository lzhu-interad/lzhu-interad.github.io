async function updateSize() {
    $("#download").attr("disabled", true);
    $("#download").prop("onclick", null).off("click");

    let nBytes = 0,
        oFiles = this.files,
        nFiles = oFiles.length;
    for (let nFileId = 0; nFileId < nFiles; nFileId++) {
        nBytes += oFiles[nFileId].size;
    }
    let sOutput = nBytes + " bytes";
    // optional code for multiples approximation
    const aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    for (nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
        sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
    }
    // end of optional code
    document.getElementById("fileNum").innerHTML = nFiles;
    document.getElementById("fileSize").innerHTML = sOutput;

    try {
        const newZip = new JSZip();
        const f = await newZip.loadAsync(oFiles[0]);
        const file = Object.values(f.files)[0];
        const str = await file.async("string");
        const data = Papa.parse(str).data;
        const columnCount = data[0].length;
        if (data[0][columnCount - 1] === "Client Type") {
            $("#info").text("This file is already patched.");
        } else {
            data[0].push("Client Type");
            for (let i = 1; i < data.length; i++) {
                if (data[i].length < columnCount) {
                    data.splice(i);
                    break;
                } else {
                    data[i].push("Personal");
                }
            }
            $("#info").text("File is patched, ready to download.");
            $("#download").attr("disabled", false);
        }
        const newStr = Papa.unparse(data);
        $("#download").on("click", function () {
            var zip = new JSZip();
            zip.file("Client_Info_For_Heroku_Refactor.txt", newStr);
            zip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
                downloadBlob(blob, "Client_Info_For_Heroku_Refactor.zip");
            }, function (err) {
                $("#info").text(err);
            });
        });
    } catch (error) {
        $("#info").text(error);
    }
}

function downloadBlob(blob, name) {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);
  
    // Create a link element
    const link = document.createElement("a");
  
    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;
  
    // Append link to the body
    document.body.appendChild(link);
  
    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true, 
        view: window 
      })
    );
  
    // Remove link from body
    document.body.removeChild(link);
  }

document.getElementById("uploadInput").addEventListener("change", updateSize, false);