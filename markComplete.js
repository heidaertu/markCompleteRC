function modifyDOM() {
    const getCommentCompleteStatus = function (commentButtonId, callback) {
        chrome.storage.sync.get(commentButtonId, function (items) {
            callback(chrome.runtime.lastError ? false : items[commentButtonId]);
        });
    };

    const codeReviewIdxStart = document.URL.search("CR-");
    if (codeReviewIdxStart < 0) {
        return;
    }
    const codeReviewIdx = document.URL.substr(codeReviewIdxStart);
    const completeButtons = document.querySelectorAll('[id^="markCompleteButton"]');
    if (completeButtons.length > 0) {
        return;
    }

    const comments = document.querySelectorAll('[id^="inlinecommentContent"]');
    for (var i = 0; i < comments.length; ++i) {
        const commentActions = comments[i].getElementsByClassName('comment-actions-inner');
        var li = document.createElement("li");
        const completeButton = document.createElement("img");
        completeButton.style.width = "25px";
        completeButton.style.height = "25px";
        completeButton.style.verticalAlign = "middle";

        const buttonText = document.createTextNode("Complete");
        completeButton.appendChild(buttonText);
        completeButton.className = "markCompleteButton";
        completeButton.id = "markCompleteButton" + codeReviewIdx + "#" + comments[i].id;
        completeButton.addEventListener('click', function () {
            getCommentCompleteStatus(completeButton.id, function(completeStatus) {
                var items = {};
                console.log("completeStatus: " + completeStatus);
                items[completeButton.id] = !completeStatus;
                chrome.storage.sync.set(items);
                if (items[completeButton.id]) {
                    completeButton.setAttribute('src', chrome.extension.getURL('icon.png'));
                } else {
                    completeButton.setAttribute('src', chrome.extension.getURL('incompleteIcon.jpg'));
                }

            })
        });

        getCommentCompleteStatus(completeButton.id, function (completeStatus) {
                if (completeStatus) {
                    completeButton.setAttribute('src', chrome.extension.getURL('icon.png'));
                } else {
                    completeButton.setAttribute('src', chrome.extension.getURL('incompleteIcon.jpg'));
                }
            }
        );

        li.appendChild(completeButton);
        commentActions[0].appendChild(li);
    }

    return document.body.innerHTML;
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.executeScript({
        code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
    }, function (results) {
    });
});