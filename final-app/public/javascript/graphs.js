/* 
 * Getting data from columns
 */
function getNumberColumn(data, columnLetter, ignore = []) {
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

// Ensures the canvas backgroudn is white
// This makes it nicer when the graoh is saved as an image
const whiteCanvasBackgroundplugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
      const {ctx} = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = options.color || '#99ffff';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
};

/* 
 * Academic Years
 */
function getAcademicYear(date) {
    let academicYear = {
        "start": new Date(),
        "end": new Date()
    };

    if (date.getMonth() < 8) {
        academicYear["start"].setDate(1);
        academicYear["start"].setMonth(7);
        academicYear["start"].setFullYear(date.getFullYear()-1);

        academicYear["end"].setDate(0);
        academicYear["end"].setMonth(6);
        academicYear["end"].setFullYear(date.getFullYear());
    } else {
        academicYear["start"].setDate(1);
        academicYear["start"].setMonth(7);
        academicYear["start"].setFullYear(date.getFullYear());

        academicYear["end"].setDate(0);
        academicYear["end"].setMonth(6);
        academicYear["end"].setFullYear(date.getFullYear()+1);
    }
    
    return academicYear;
}


function getAcademicYearLabel(academicYear) {
    let start = "0" + academicYear["start"].getDate() + "/0" + (academicYear["start"].getMonth()+1) + "/" + academicYear["start"].getFullYear();
    let end = academicYear["end"].getDate() + "/0" + (academicYear["end"].getMonth()+1) + "/" + academicYear["end"].getFullYear();

    return start;
}

// Sets up the Startups Created By Academic Year Graph
function setupStartupsCreatedGraph(data) {
    registrationDates = getStringColumn(data, 'G', ["Registration Date"]);

    // TODO: Startups should be grouped by academic year instead of just a normal year
    startupsPerYear = [];
    let startYear = 2000;
    let endYear = Number(new Date(Date.now()).getFullYear())+1;

    for (let year=startYear; year <= endYear; year++) {
        let curDate = new Date();
        curDate.setDate(1);
        curDate.setMonth(1);
        curDate.setFullYear(year);

        startupsPerYear.push({numStartups: 0, academicYear: getAcademicYear(curDate)});
    }

    console.log(startupsPerYear.length);

    // Get the number of startups per year
    registrationDates.forEach(date => {
        date = new Date(Date.parse(date));

        for (let i=0; i < startupsPerYear.length; i++) {
            if (startupsPerYear[i]["academicYear"]["start"].toDateString() === getAcademicYear(date)["start"].toDateString()) {
                console.log("Yes")
                startupsPerYear[i]["numStartups"] += 1;
            }
        }
    });

    // Remove years with no startups
    for (let i = 0; i < startupsPerYear.length; i++) {
        if (startupsPerYear[i]["numStartups"] == 0) {
            startupsPerYear.splice(i, 1);
            i -= 1;
        }
    }

    // Make the data useable by ChartsJS
    let labels = [];
    let subdata = []

    for (let i = 0; i < startupsPerYear.length; i++) {
        labels.push(getAcademicYearLabel(startupsPerYear[i]["academicYear"]));
        subdata.push(
            startupsPerYear[i]["numStartups"]
        );
    }

    const graphData = {
        labels: labels,
        datasets: [
            {
                label: "Startups Created",
                data: subdata,
                backgroundColor: [
                    'rgba(255, 99, 132, 1.0)',
                ]
            }
        ]
    };

    const ctx = $("#startupsCreatedGraph");

    // Start setting up the ChartsJS Graph
    new Chart(ctx, {
        type: 'bar',
        data: graphData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Startups Created By Academic Year'
                },
                customCanvasBackgroundColor: {
                    color: 'white',
                }
            },
            scales: {
                y: {
                    min: 0.0,
                    title: {
                        display: true,
                        text: "Num. Startups Created"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Academic Year (Starting Date)"
                    }
                }
            }
        },
        plugins: [whiteCanvasBackgroundplugin], // Sets up the plugin defined further above
      });
}

// Function that runs on page load
$(() => {
    $.getJSON("/upload/read", (data) => {
        console.log(data);
        // Setup graphs here
        setupStartupsCreatedGraph(data);
    });
});