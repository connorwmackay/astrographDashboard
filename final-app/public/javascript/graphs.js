function getNumberColumn(data, columnLetter) {
    columnData = [];
    trackerData = data["data"]["Master Tracker - Dummy Data "];
    
    for (let i=0; i < trackerData.length; i++) {
        const obj = trackerData[i];
        let columnItem = obj[columnLetter];

        if (columnItem != null) {
            if (typeof columnItem == 'number') {
                columnData.push(columnItem);
            }
        }
    }

    return columnData;
}

function getStringColumn(data, columnLetter, ignore = []) {
    columnData = [];
    trackerData = data["data"]["Master Tracker - Dummy Data "];
    
    for (let i=0; i < trackerData.length; i++) {
        const obj = trackerData[i];
        let columnItem = obj[columnLetter];
        let shouldSkip = false;

        ignore.forEach(item => {
            if (columnItem == item) {
                shouldSkip = true;
            }
        });

        if (columnItem != null && !shouldSkip) {
            if (typeof columnItem == 'string') {
                columnData.push(columnItem);
            }
        }
    }

    return columnData;
}

function getMixedColumn(data, columnLetter) {
    columnData = [];
    trackerData = data["data"]["Master Tracker - Dummy Data "];
    
    for (let i=0; i < trackerData.length; i++) {
        const obj = trackerData[i];
        let columnItem = obj[columnLetter];

        if (columnItem != null) {
            columnData.push(columnItem);
        }
    }

    return columnData;
}

$(() => {
    $.getJSON("/upload/read", (data) => {
        console.log(data);
        console.log("Registration Date: " + getStringColumn(data, 'G', ["Registration Date"]));
    });
});