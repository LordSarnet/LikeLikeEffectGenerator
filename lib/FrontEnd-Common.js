function confirmImageSize() {
    var kSVGNS = 'http://www.w3.org/2000/svg';

    var size = parseInt(document.getElementById('generateSize').value);
    if (size.isNaN) {
        alert("サイズは半角数字のみで入力して下さい。");
        return false;
    }

    var svgBlock = document.createElementNS(kSVGNS, 'svg');
    svgBlock.setAttribute('width', size);
    svgBlock.setAttribute('height', size);
    svgBlock.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svgBlock.setAttribute('xmlns', kSVGNS);
    svgBlock.setAttribute('version', '1.1');

    var rectBlock = document.createElementNS(kSVGNS, 'rect');
    rectBlock.setAttribute('x', '0');
    rectBlock.setAttribute('y', '0');
    rectBlock.setAttribute('width', size.toString());
    rectBlock.setAttribute('height', size.toString());
    rectBlock.setAttribute('stroke', '#CCC');
    rectBlock.setAttribute('stroke-width', '4');
    rectBlock.setAttribute('fill', 'none');
    svgBlock.appendChild(rectBlock);

    var textBlock = document.createElementNS(kSVGNS, 'text');
    textBlock.setAttribute('x', (size / 2).toString());
    textBlock.setAttribute('y', (size / 2).toString());
    textBlock.setAttribute('text-anchor', 'middle');
    textBlock.setAttribute('font-family', 'sans-serif');
    textBlock.setAttribute('font-size', '20');
    textBlock.setAttribute('fill', '#CCC');
    textBlock.innerHTML = size.toString() + ' x ' + size.toString();
    svgBlock.appendChild(textBlock);

    var tempBlock = document.createElement('span');
    tempBlock.appendChild(svgBlock);
    var canvasBlock = generateCanvasFromSVG(tempBlock.innerHTML, size);

    var targetImgBlock = document.getElementById('targetImg');
    targetImgBlock.src = canvasBlock.toDataURL();
    targetImgBlock.setAttribute("style", "display: block;");
}

function loadImg() {

    var imgFile = document.getElementById('localImgFile').files[0];
    if (!imgFile.type.match(/^image\/(png|jpeg|gif)$/)) {
        alert("png,jpg,gif以外の画像ファイルは扱えません。");
        return;
    }

    var image = document.createElement('img');
    image.crossOrigin = "anonymous";
    image.setAttribute('style', 'width: auto; height: 200px');
    image.setAttribute('id', 'iconImg');
    var fileReader = new FileReader();

    fileReader.onload = function(evt) {
        image.src = evt.target.result;
        document.getElementById('generateButton1').removeAttribute("disabled");
        document.getElementById('generateButton1').setAttribute("class", "blue");
        document.getElementById('generateButton2').removeAttribute("disabled");
        document.getElementById('generateButton2').setAttribute("class", "blue");
    };

    fileReader.readAsDataURL(imgFile);

    var confirmBlock = document.getElementById('confirmLocalImg');
    confirmBlock.innerHTML = "";
    confirmBlock.appendChild(image);
    var confirmTextBlock = document.createElement('p');
    confirmTextBlock.innerHTML = "準備が完了すると上に読み込んだ画像が表示されます。";
    confirmBlock.appendChild(confirmTextBlock);
}
