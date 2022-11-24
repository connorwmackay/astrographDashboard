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

function getNumberColumnFrom(data, columnLetter, startIndex = 0) {
    columnData = [];
    trackerData = data["data"]["Master Tracker - Dummy Data "];

    for (let i=startIndex; i < trackerData.length; i++) {
        const obj = trackerData[i];
        let columnItem = obj[columnLetter];
        console.log(columnItem);
        let shouldSkip = false;

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
        labels.push("0" + (startupsPerYear[i]["academicYear"]["start"].getMonth()+1) + "/" + startupsPerYear[i]["academicYear"]["start"].getFullYear());
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

function setupFullTimeJobsCreatedGraph(data) {
    const registrationDates = getStringColumn(data, 'G', ["Registration Date"]);
    const fullTimeJobsCreated = getNumberColumnFrom(data, 'AJ', 5);
    console.log(fullTimeJobsCreated);

    let ftJobsPerYear = [];

    for (let i=0; i < fullTimeJobsCreated.length; i++) {
        let hasAddedJobs = false;

        const numFtJobs = fullTimeJobsCreated[i];
        const registrationDate = registrationDates[i];

        for (let j=0; j < ftJobsPerYear.length; j++) {
            if (getAcademicYear(new Date(registrationDate))["start"].toDateString() == ftJobsPerYear[j]["academicYear"]["start"].toDateString()) {
                ftJobsPerYear[j]["fullTimeJobs"] += numFtJobs
                hasAddedJobs = true;
            }
        }

        if (!hasAddedJobs) {
            ftJobsPerYear.push({fullTimeJobs: numFtJobs, academicYear: getAcademicYear(new Date(registrationDate))});
        }
    }

    // Remove years with no startups
    for (let i = 0; i < ftJobsPerYear.length; i++) {
        if (ftJobsPerYear[i]["fullTimeJobs"] == 0) {
            ftJobsPerYear.splice(i, 1);
            i -= 1;
        }
    }

    // Make the data useable by ChartsJS
    let labels = [];
    let subdata = []

    for (let i = 0; i < ftJobsPerYear.length; i++) {
        labels.push("0" + (ftJobsPerYear[i]["academicYear"]["start"].getMonth()+1) + "/" + ftJobsPerYear[i]["academicYear"]["start"].getFullYear());
        subdata.push(
            ftJobsPerYear[i]["fullTimeJobs"]
        );
    }

    const graphData = {
        labels: labels,
        datasets: [
            {
                label: "Full Time Jobs Created",
                data: subdata,
                backgroundColor: [
                    'rgba(144, 3, 252, 1.0)',
                ]
            }
        ]
    };

    console.log(ftJobsPerYear);

    const ctx = $("#fullTimeJobsGraph");

    // Start setting up the ChartsJS Graph
    new Chart(ctx, {
        type: 'bar',
        data: graphData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Full Time Jobs Created by Academic Year'
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
                        text: "Num. Full Time Jobs Created"
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

function setupFullTimeEquivelentJobsCreatedGraph(data) {
    const registrationDates = getStringColumn(data, 'G', ["Registration Date"]);
    const fteJobsCreated = getNumberColumnFrom(data, 'AN', 5);
    console.log(fteJobsCreated);

    let fteJobsPerYear = [];

    for (let i=0; i < fteJobsCreated.length; i++) {
        let hasAddedJobs = false;

        const numFtJobs = fteJobsCreated[i];
        const registrationDate = registrationDates[i];

        for (let j=0; j < fteJobsPerYear.length; j++) {
            if (getAcademicYear(new Date(registrationDate))["start"].toDateString() == fteJobsPerYear[j]["academicYear"]["start"].toDateString()) {
                fteJobsPerYear[j]["fullTimeJobs"] += numFtJobs
                hasAddedJobs = true;
            }
        }

        if (!hasAddedJobs) {
            fteJobsPerYear.push({fullTimeJobs: numFtJobs, academicYear: getAcademicYear(new Date(registrationDate))});
        }
    }

    // Remove years with no startups
    for (let i = 0; i < fteJobsPerYear.length; i++) {
        if (fteJobsPerYear[i]["fullTimeJobs"] == 0) {
            fteJobsPerYear.splice(i, 1);
            i -= 1;
        }
    }

    // Make the data useable by ChartsJS
    let labels = [];
    let subdata = []

    for (let i = 0; i < fteJobsPerYear.length; i++) {
        labels.push("0" + (fteJobsPerYear[i]["academicYear"]["start"].getMonth()+1) + "/" + fteJobsPerYear[i]["academicYear"]["start"].getFullYear());
        subdata.push(
            fteJobsPerYear[i]["fullTimeJobs"]
        );
    }

    const graphData = {
        labels: labels,
        datasets: [
            {
                label: "Full Time Equivalent Jobs Created",
                data: subdata,
                backgroundColor: [
                    'rgba(66, 179, 245, 1.0)',
                ]
            }
        ]
    };

    console.log(fteJobsPerYear);

    const ctx = $("#fullTimeEquivJobsGraph");

    // Start setting up the ChartsJS Graph
    new Chart(ctx, {
        type: 'bar',
        data: graphData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Full Time Equivalent Jobs Created by Academic Year'
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
                        text: "Num. Full Equivalent Time Jobs Created"
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




function setupPartTimeJobsCreatedGraph(data) {
    const registrationDates = getStringColumn(data, 'G', ["Registration Date"]);
    const partTimeJobsCreated = getNumberColumnFrom(data, 'AL', 5);
    console.log("Num PT Jobs: " + partTimeJobsCreated.length);
    console.log(partTimeJobsCreated);

    let ptJobsPerYear = [];

    for (let i=0; i < partTimeJobsCreated.length; i++) {
        let hasAddedJobs = false;

        const numPtJobs = partTimeJobsCreated[i];
        const registrationDate = registrationDates[i];

        for (let j=0; j < ptJobsPerYear.length; j++) {
            if (getAcademicYear(new Date(registrationDate))["start"].toDateString() == ptJobsPerYear[j]["academicYear"]["start"].toDateString()){
                ptJobsPerYear[j]["partTimeJobs"] += numPtJobs
                hasAddedJobs = true;
            }
        }

        if (!hasAddedJobs) {
            ptJobsPerYear.push({partTimeJobs: numPtJobs, academicYear: getAcademicYear(new Date(registrationDate))});
        }
    }

    // Remove the years no startups
    for (let i = 0; i < ptJobsPerYear.length; i++) {
        if (ptJobsPerYear[i]["partTimeJobs"] == 0) {
            ptJobsPerYear.splice(i, 1);
            i -= 1;
        }
    }

    // Make the data useable ChartJS
    let labels = [];
    let subdata = []

    console.log("Num Pt Jobs: " + ptJobsPerYear.length)
    for (let i = 0; i < ptJobsPerYear.length; i++) {
        labels.push("0" + (ptJobsPerYear[i]["academicYear"]["start"].getMonth()+1 + "/" + ptJobsPerYear[i]["academicYear"]["start"].getFullYear()));
        subdata.push(
            ptJobsPerYear[i]["partTimeJobs"]
        );
    }

    const graphData = {
        labels: labels, 
        datasets: [
            {
                label: "Part Time Jobs Created",
                data: subdata, 
                backgroundColor: [
                    'rgba(144, 3, 252, 1.0)',
                ]
            }
        ]
    };

    console.log(ptJobsPerYear);

    const ctx = $("#partTimeJobsGraph");

    // Start setting up the ChartJS Graph
    new Chart(ctx, {
        type: 'bar', 
        data: graphData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true, 
                    text: 'Part Time Jobs Created By Academic Year'
                },
                customCanvasBackgroundColor : {
                    color: 'white',

                }
            },
            scales: {
                y: {
                    min: 0.0,
                    title: {
                        display: true,
                        text: "Num. Part Time Jobs Created"
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

/*
*   
*   StartUp Co-Founders
*
*/

function setupNumberCoFoundersGraph(data) {
    const registrationDates = getStringColumn(data, 'G', ["Registration Date"]);
    const noCoFounders = getNumberColumnFrom(data, 'U', 5);
    console.log(noCoFounders);

    let CFPerYear = [];

    for (let i=0; i < noCoFounders.length; i++) {
        let hasAddedJobs = false;

        const numCF = noCoFounders[i];
        const registrationDate = registrationDates[i];

        for (let j=0; j < CFPerYear.length; j++) {
            if (getAcademicYear(new Date(registrationDate))["start"].toDateString() == CFPerYear[j]["academicYear"]["start"].toDateString()){
                CFPerYear[j]["CoFounders"] += numCF
                hasAddedJobs = true;
            }
        }

        if (!hasAddedJobs) {
            CFPerYear.push({CoFounders: numCF, academicYear: getAcademicYear(new Date(registrationDate))});
        }
    }

    // Remove the years no startups
    for (let i = 0; i < CFPerYear.length; i++) {
        if (CFPerYear[i]["CoFounders"] == 0) {
            CFPerYear.splice(i, 1);
            i -= 1;
        }
    }

    // Make the data useable ChartJS
    let labels = [];
    let subdata = []

    for (let i = 0; i < CFPerYear.length; i++) {
        labels.push("0" + (CFPerYear[i]["academicYear"]["start"].getMonth()+1 + "/" + CFPerYear[i]["academicYear"]["start"].getFullYear()));
        subdata.push(
            CFPerYear[i]["CoFounders"]
        );
    }

    const graphData = {
        labels: labels, 
        datasets: [
            {
                label: "Co-founders",
                data: subdata, 
                backgroundColor: [
                    'rgba(144, 3, 252, 1.0)',
                ]
            }
        ]
    };

    console.log(CFPerYear);

    const ctx = $("#numOfCoFounders");

    // Start setting up the ChartJS Graph
    new Chart(ctx, {
        type: 'bar', 
        data: graphData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true, 
                    text: 'Co-Founders By Academic Year'
                },
                customCanvasBackgroundColor : {
                    color: 'white',

                }
            },
            scales: {
                y: {
                    min: 0.0,
                    title: {
                        display: true,
                        text: "Num. Co-Founders"
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


/*
*   
*   Founders Investment
*
*/

function setupTotalFounderInvestment(data) {
    const registrationDates = getStringColumn(data, 'G', ["Registration Date"]);
    const TotalFounderInvestment = getNumberColumnFrom(data, 'U', 5);
    console.log(TotalFounderInvestment);

    let TFIperYear = [];

    for (let i=0; i < TotalFounderInvestment.length; i++) {
        let hasAddedJobs = false;

        const numTFI = TotalFounderInvestment[i];
        const registrationDate = registrationDates[i];

        for (let j=0; j < TFIperYear.length; j++) {
            if (getAcademicYear(new Date(registrationDate))["start"].toDateString() == TFIperYear[j]["academicYear"]["start"].toDateString()){
                TFIperYear[j]["TotalInvestment"] += numTFI
                hasAddedJobs = true;
            }
        }

        if (!hasAddedJobs) {
            TFIperYear.push({TotalInvestment: numTFI, academicYear: getAcademicYear(new Date(registrationDate))});
        }
    }

    // Remove the years no startups
    for (let i = 0; i < TFIperYear.length; i++) {
        if (TFIperYear[i]["TotalInvestment"] == 0) {
            TFIperYear.splice(i, 1);
            i -= 1;
        }
    }

    // Make the data useable ChartJS
    let labels = [];
    let subdata = []

    for (let i = 0; i < TFIperYear.length; i++) {
        labels.push("0" + (TFIperYear[i]["academicYear"]["start"].getMonth()+1 + "/" + TFIperYear[i]["academicYear"]["start"].getFullYear()));
        subdata.push(
            TFIperYear[i]["TotalFounderInvestment"]
        );
    }

    const graphData = {
        labels: labels, 
        Datasets: [
            {
                label: "Founder Investment",
                data: subdata, 
                backgroundColor: [
                    'rgba(144, 3, 252, 1.0)',
                ]
            }
        ]
    };

    console.log(TFIperYear);

    const ctx = $("#numTotalFounderInvestment");

    // Start setting up the ChartJS Graph
    new Chart(ctx, {
        type: 'bar', 
        data: graphData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true, 
                    text: 'Founder Investment By Academic Year'
                },
                customCanvasBackgroundColor : {
                    color: 'white',

                }
            },
            scales: {
                y: {
                    min: 0.0,
                    title: {
                        display: true,
                        text: "Num. founder Investment"
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
        setupStartupsCreatedGraph(data); // 1st Graph
        setupNumberCoFoundersGraph(data); // 2nd Graph
        setupFullTimeJobsCreatedGraph(data); // 3rd Graph
        setupPartTimeJobsCreatedGraph(data); // 4th Graph
        setupFullTimeEquivelentJobsCreatedGraph(data); // 5th Graph
        setupTotalFounderInvestment(data); // 6th Graph
    });
});