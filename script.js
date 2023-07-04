window.onload = function () {
    var fileSelectorLabel = document.getElementById("fileSelectorLabel");
    var input = document.getElementById("input");
    var analyzeBtn = document.getElementById("analyzeBtn");
    var output = document.getElementById("output");
    var btnGroup = document.getElementById("btnGroup");
    var fileSelector = document.getElementById("fileSelector");
    var imageDisplay = document.getElementById("imageDisplay");
    var nextBtn = document.getElementById("nextBtn");
    var next10Btn = document.getElementById("next10Btn");
    var previousBtn = document.getElementById("previousBtn");
    var previous10Btn = document.getElementById("previous10Btn");
    var saveAsBtn = document.getElementById("saveAsBtn");
    var copyBtn = document.getElementById("copyBtn");
    var ruminateBtn = document.getElementById("ruminateBtn");
    var translateBtn = document.getElementById("translateBtn");
    var enableTranslate = document.getElementById("enableTranslate");


    var lastClickedButton = null; // 记录最后点击的按钮
    var imageFilePaths = []; // 图片文件路径数组
    var txtFilePaths = [];//文本文件路径数组
    var currentImageFilePathIndex = 0; // 当前图片文件路径在数组中的索引
    var currentTextFilePathIndex = 0; // 当前文本文件路径在数组中的索引


    analyzeBtn.addEventListener("click", analyzeText);
    fileSelector.addEventListener("change", handleFileSelection);
    nextBtn.addEventListener("click", function () { showNextImage(1) });
    next10Btn.addEventListener("click", function () { showNextImage(10) });
    previousBtn.addEventListener("click", function () { showPreviousImage(1) });
    previous10Btn.addEventListener("click", function () { showPreviousImage(10) });

    copyBtn.addEventListener("click", copyOutput);
    ruminateBtn.addEventListener("click", ruminateOutput);
    saveAsBtn.addEventListener("click", saveAsTextFile);
    input.addEventListener("input", updateTextareaHeight);

    translateBtn.addEventListener("click", handleTranslation);
    enableTranslate.addEventListener("click", handleCheckBoxEvent);


    var removalTrackerDict = {};//统计常删除提示词的词典

    function handleCheckBoxEvent() {
        if (enableTranslate.checked) {
            analyzeBtn.innerText = "分析并翻译";
        }
        else {
            analyzeBtn.innerText = "分析";
        }
    }


    function handleTranslation() {
        var inputText = input.value.trim().toLowerCase();
        inputText = inputText.replace(/,+/g, ',');
        inputText = inputText.replace(/,(\s{1,2}),/g, ',');

        translateText(inputText, function (translation) {
            translation = translation.replace(/，+|、+/g, ','); // 将中文逗号和中文顿号替换为英文逗号
            translation = translation.replace(/,+/g, ','); // 将连续多个英文逗号替换为单个英文逗号
            translation = translation.replace(/,(\s{1,2}),/g, ','); // 将英文逗号前后的空格减少为一个空格
            output.value = translation;
        });
    }


    function analyzeText() {
        // 获取输入的文本，并进行基本的清理和转换
        var inputText = input.value.trim().toLowerCase();
        inputText = inputText.replace(/_/g, " ");
        inputText = inputText.replace(/,+/g, ',');
        inputText = inputText.replace(/,(\s{1,2}),/g, ',');

        // 将输入的文本按逗号分隔并去除重复元素，将下划线替换为空格
        var elements = inputText.split(",").map(function (item) {
            return item.trim();
        });
        elements = Array.from(new Set(elements));

        // 更新输出文本框的初始值，将元素拼接为一个字符串
        var formatText = elements.join(", ");
        output.value = formatText;

        // 已经为元素文本数组赋值过了,接下来为中文元素词数组做处理准备,用中文顿号分割方便翻译.
        formatText = formatText.replace(/,+/g, '、');


        if (enableTranslate.checked) {
            // 翻译文本，并返回一个Promise对象
            translateText(formatText)
                .then(function (chineseText) {

                    chineseText = chineseText.replace(/，+|、+/g, ','); // 将中文逗号和中文顿号替换为英文逗号
                    chineseText = chineseText.replace(/,+/g, ','); // 将连续多个英文逗号替换为单个英文逗号
                    chineseText = chineseText.replace(/,(\s{1,2}),/g, ','); // 将英文逗号前后的空格减少为一个空格


                    // 将中文拆分为数组
                    var chineseElements = chineseText.split(",").map(function (item) {
                        return item.trim();
                    });


                    if (elements.length !== chineseElements.length)
                        alert("翻译结果有误,提示词数量不一致!请调整原文中的提示词顺序以避免该情况发生.");

                    // 更新右侧文本框高度
                    updateTextareaHeight();

                    // 生成与元素数量相同的按钮
                    // 清空按钮组的内容
                    btnGroup.innerHTML = "";

                    // 遍历元素数组，为每个元素创建按钮并添加到按钮组
                    for (var i = 0; i < elements.length; i++) {
                        // 获取当前元素
                        var element = elements[i];
                        var chineseElement = chineseElements[i];

                        // 创建一个按钮元素
                        var button = document.createElement("button");

                        // 设置按钮的显示文本为元素的值
                        button.innerText = chineseElement;

                        // 设置自定义属性存储元素的文本，方便后续处理
                        button.dataset.text = element;

                        // 设置自定义属性存储元素文本的中文翻译
                        button.dataset.chineseText = chineseElement;

                        // 绑定按钮的点击事件处理函数
                        button.addEventListener("click", toggleButton);

                        // 添加按钮的样式类，这里添加了 "active" 类，可以根据需要修改
                        button.classList.add("myactive");

                        if (matchTextButton(button.dataset.text)) {
                            button.style.borderColor="#FFAA00";
                        }

                        // 将按钮添加到按钮组中
                        btnGroup.appendChild(button);
                    }
                    updateOutput();
                })
                .catch(function (error) {
                    //处理翻译错误 
                    alert("翻译时出现错误");
                });
        }
        else {
            // 更新右侧文本框高度
            updateTextareaHeight();

            // 生成与元素数量相同的按钮
            // 清空按钮组的内容
            btnGroup.innerHTML = "";

            // 遍历元素数组，为每个元素创建按钮并添加到按钮组
            for (var i = 0; i < elements.length; i++) {
                // 获取当前元素
                var element = elements[i];

                // 创建一个按钮元素
                var button = document.createElement("button");

                // 设置按钮的显示文本为元素的值
                button.innerText = element;

                // 设置自定义属性存储元素的文本，方便后续处理
                button.dataset.text = element;

                // 绑定按钮的点击事件处理函数
                button.addEventListener("click", toggleButton);


                // 添加按钮的样式类，这里添加了 "active" 类，可以根据需要修改
                button.classList.add("myactive");

                if (matchTextButton(button.dataset.text)) {
                    button.style.borderColor="#FFAA00";
                }

                // 将按钮添加到按钮组中
                btnGroup.appendChild(button);
            }

            updateOutput();
        }
    }


    function matchTextButton(text) {
        var over3 = [];
        for (let key in removalTrackerDict) {
          if (removalTrackerDict[key] >= 3) { // 如果计数器的值大于等于3，则添加到over3数组中
            over3.push(key);
          }
        }
        return over3.includes(text);
    }


    // 异步翻译函数
    function translateText(text) {
        return new Promise(function (resolve, reject) {
            // 执行翻译逻辑，并在完成时调用resolve方法返回结果，或在发生错误时调用reject方法传递错误信息
            performTranslation(text, function (translation) {
                analyzeBtn.innerText = "分析并翻译";
                analyzeBtn.disabled = false;
                resolve(translation);
            });
        });
    }

    // 示例翻译函数，仅作为占位符，需要根据实际情况替换为实际的翻译逻辑
    function performTranslation(text, callback) {
        analyzeBtn.innerText = "翻译中...";
        analyzeBtn.disabled = true;
        // 模拟异步操作，比如使用API进行翻译
        setTimeout(function () {
            translateNetWork(text, callback);
        }, 2000);
    }


    function toggleButton() {
        this.classList.toggle("myactive");
        this.classList.toggle("inactive");
        lastClickedButton = this; // 记录最后点击的按钮

        var buttonText = this.dataset.text;
        if (this.classList.contains("myactive")) {
            removalTrackerDict[buttonText] = (removalTrackerDict[buttonText] || 0) - 1;
        }
        else if (this.classList.contains("inactive")) {
            removalTrackerDict[buttonText] = (removalTrackerDict[buttonText] || 0) + 1;
        }
        // console.log(buttonText + "  " + removalTrackerDict[buttonText]);
        updateOutput();
    }

    function updateOutput() {
        var activeButtons = document.querySelectorAll(".myactive");
        var buttonText = Array.from(activeButtons).map(function (button) {
            return button.dataset.text; // 使用自定义属性获取元素的文本
        }).join(", ");
        output.value = buttonText;

        // 检查最后点击的按钮状态
        if (lastClickedButton && lastClickedButton.classList.contains("myactive")) {
            var selectedText = lastClickedButton.dataset.text;
            // var regex = new RegExp(`^(\s|,|$).*?${selectedText}.*?(\\s|,|\\.|\\?|$)`, "i");
            var regex = new RegExp(`(?<![a-zA-Z])\\s${selectedText}(?![a-zA-Z\\s])|(?<![a-zA-Z\\s])${selectedText}(?![a-zA-Z\\s])`, "i");
            if (regex.test(output.value)) {
                output.focus(); // 设置输出文本框为焦点
                var match = output.value.match(regex);
                output.setSelectionRange(match.index, match.index + match[0].length);
            }
        }

        // // 更新右侧文本框高度
        // updateTextareaHeight();
    }

    // 当文本内容过多后出现滚动条时,增加文本框高度,从而使滚动条避免出现
    function updateTextareaHeight() {
        if (input.scrollHeight > input.clientHeight) {
            input.style.height = "auto";
            input.style.height = input.scrollHeight + "px";
            output.style.height = "auto";
            output.style.height = output.scrollHeight + "px";
        }
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

            fileSelectorLabel.textContent = "点击此处可重新选择文件夹  |  当前文件夹中文件数量为:" + (txtFilePaths.length + imageFilePaths.length);

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
        imageNameLabel.textContent = "当前图片文件名：" + getFileName(tempCurrentImage.name) + " [" + (currentImageFilePathIndex + 1) + "/" + imageFilePaths.length + "]";

        // 更新输入文本框的内容
        displayTextFile(txtFilePaths[currentTextFilePathIndex].path);
    }


    //显示后N张图片,自动处理越界
    function showNextImage(count) {

        if (count !== 1 && count !== 10) {
            alert("参数count必须为1或10");
            return;
        }
        // 清空按钮组的内容
        btnGroup.innerHTML = "";
        output.value = "";

        if (currentImageFilePathIndex < imageFilePaths.length - 1 && currentTextFilePathIndex < txtFilePaths.length - 1) {
            var go = imageFilePaths.length - 1 - currentImageFilePathIndex;
            go = Math.min(go, count);
            currentImageFilePathIndex += go;
            currentTextFilePathIndex += go;
        } else {
            // 已经是最后一张图片，弹出提示对话框
            alert("已经是最后一张图片了");
            return;
        }
        updateImageAndText();
    }

    function showPreviousImage(count) {
        if (count !== 1 && count !== 10) {
            alert("参数count必须为1或10");
            return;
        }
        // 清空按钮组的内容
        btnGroup.innerHTML = "";
        output.value = "";

        if (currentImageFilePathIndex > 0 && currentTextFilePathIndex > 0) {
            var go = currentImageFilePathIndex;
            go = Math.min(go, count);
            currentImageFilePathIndex -= go;
            currentTextFilePathIndex -= go;
        } else {

            alert("已经是第一张图片了");
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
        analyzeText();
    }



    function saveAsTextFile() {
        var textFileName = txtFilePaths[currentTextFilePathIndex].name;
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