window.onload = function () {
    var input = document.getElementById("input");
    var analyzeBtn = document.getElementById("analyzeBtn");
    var output = document.getElementById("output");
    var btnGroup = document.getElementById("btnGroup");
    var fileSelector = document.getElementById("fileSelector");
    var imageDisplay = document.getElementById("imageDisplay");
    var imageName = document.getElementById("imageName");
    var nextBtn = document.getElementById("nextBtn");
    var saveAsBtn = document.getElementById("saveAsBtn");
    var copyBtn = document.getElementById("copyBtn");
    var ruminateBtn = document.getElementById("ruminateBtn");
    var lastClickedButton = null; // 记录最后点击的按钮
    var imageFilePaths = []; // 图片文件路径数组
    var txtFilePaths = [];//文本文件路径数组
    var currentImageFilePathIndex = 0; // 当前图片文件路径在数组中的索引
    var currentTextFilePathIndex = 0; // 当前文本文件路径在数组中的索引


    analyzeBtn.addEventListener("click", analyzeText);
    fileSelector.addEventListener("change", handleFileSelection);
    nextBtn.addEventListener("click", showNextImage);
    copyBtn.addEventListener("click", copyOutput);
    ruminateBtn.addEventListener("click", ruminateOutput);
    saveAsBtn.addEventListener("click", saveAsTextFile);

    function analyzeText() {
        var inputText = input.value.trim().toLowerCase();
        inputText = inputText.replace(/,+/g, ',');
        inputText = inputText.replace(/,(\s{1,2}),/g, ',');

        // 将输入的文本按逗号分隔并去除重复元素，将下划线替换为空格
        var elements = inputText.split(",").map(function (item) {
            return item.trim().replace(/_/g, " ");
        });
        elements = Array.from(new Set(elements));

        // 更新输出文本框的初始值
        output.value = elements.join(", ");

        // 更新右侧文本框高度
        updateTextareaHeight();

        // 生成与元素数量相同的按钮
        btnGroup.innerHTML = "";
        elements.forEach(function (element) {
            var button = document.createElement("button");
            button.innerText = element;
            button.dataset.text = element; // 设置自定义属性存储元素的文本
            button.addEventListener("click", toggleButton);
            button.classList.add("active");
            btnGroup.appendChild(button);
        });

        updateOutput();
    }

    function toggleButton() {
        this.classList.toggle("active");
        this.classList.toggle("inactive");
        lastClickedButton = this; // 记录最后点击的按钮
        updateOutput();
    }

    function updateOutput() {
        var activeButtons = document.querySelectorAll(".active");
        var buttonText = Array.from(activeButtons).map(function (button) {
            return button.dataset.text; // 使用自定义属性获取元素的文本
        }).join(", ");
        output.value = buttonText;

        // 检查最后点击的按钮状态
        if (lastClickedButton && lastClickedButton.classList.contains("active")) {
            var selectedText = lastClickedButton.dataset.text;
            var startIndex = output.value.indexOf(selectedText);
            if (startIndex !== -1) {
                output.focus(); // 设置输出文本框为焦点
                output.setSelectionRange(startIndex, startIndex + selectedText.length);
            }
        }

        // 更新右侧文本框高度
        updateTextareaHeight();
    }

    // 更新右侧文本框高度
    function updateTextareaHeight() {
        output.style.height = "";
        input.style.height = "";

        var maxHeight = Math.max(input.scrollHeight, output.scrollHeight);
        input.style.height = maxHeight + "px";
        output.style.height = maxHeight + "px";
    }


    function handleFileSelection(evt) {
        var files = evt.target.files;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var tempFilePath = URL.createObjectURL(file);
                if (file.name.endsWith(".txt")) {
                    txtFilePaths.push({
                        path: tempFilePath,
                        name: file.name
                    });
                } else if (file.name.endsWith(".jpg") || file.name.endsWith(".png") || file.name.endsWith(".gif")) {
                    imageFilePaths.push({
                        path: tempFilePath,
                        name: file.name
                    });
                }
            }
            updateImageAndText();
        }
    }
    

    

    function displayImage(imagePath) {
        // 模拟异步操作，读取并显示图片
        setTimeout(function () {
            // 替换为实际的图片加载逻辑
            imageDisplay.setAttribute("src", imagePath);
        }, 500);
    }

    function displayTextFile(textFilePath) {
        // 模拟异步操作，读取并显示文本文件内容
        setTimeout(function () {
            // 创建XMLHttpRequest对象
            var xhr = new XMLHttpRequest();

            // 定义响应处理函数
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // 将文件内容赋值给textarea
                    input.value = xhr.responseText;
                }
            };
            // 打开并发送GET请求以获取文本文件
            xhr.open('GET', textFilePath, true);
            xhr.send();

        }, 500);


    }


    function updateImageAndText() {
        var tempCurrentImage = imageFilePaths[currentImageFilePathIndex];
        displayImage(tempCurrentImage.path);
    
        // 更新当前图片文件名的显示
        var imageNameLabel = document.querySelector(".image-name");
        imageNameLabel.textContent = "当前图片文件名：" + getFileName(tempCurrentImage.name) +" ["+(currentImageFilePathIndex+1)+"/" +imageFilePaths.length    +"]";

        // 更新输入文本框的内容
        displayTextFile(txtFilePaths[currentTextFilePathIndex].path);
    }



    function showNextImage() {
        if (currentImageFilePathIndex < imageFilePaths.length - 1 && currentTextFilePathIndex < txtFilePaths.length - 1) {
            currentImageFilePathIndex++;
            currentTextFilePathIndex++;
        } else {
            // 已经是最后一张图片，弹出提示对话框
            alert("已经是最后一张图片了");
            return;
        }
        updateImageAndText();
    }

    function getFileName(path) {
        return path.split("/").pop();
    }


    function copyOutput() {
        output.select();
        document.execCommand("copy");
        alert("已复制到剪贴板");
    }


    function ruminateOutput() {
        input.value = output.value;    
        //alert("已将输出文本反刍至输入文本框");
    }

    

    function saveAsTextFile() {
        var textFileName =txtFilePaths[currentTextFilePathIndex].name;
        // 创建新的 Blob 对象
        var blob = new Blob([output.value], { type: 'text/plain' });
      
        // 创建隐藏的 <a> 元素用于下载
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = getFileName(textFileName);

        a.style.display = 'none';
      
        // 将 <a> 元素添加到 DOM 中并模拟点击
        document.body.appendChild(a);
        a.click();
      
        // 清理并移除 <a> 元素
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }
      
    

};