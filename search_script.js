const tables = document.getElementsByClassName("TallyGreen");
const content = document.querySelector(".entry-content");
const firstTable = tables[0];
const searchContainer = document.createElement("DIV");
searchContainer.id = "searchContainer";
searchContainer.className = "searchContainer";
searchContainer.style.width = "969px";
const searchInput = document.createElement("INPUT");
searchInput.id = "searchInput";
searchInput.type = "text";
searchInput.setAttribute("placeholder", "Search for message");
const heightAdjust = document.createElement("div");
heightAdjust.style.height = "0px";

const tableTitle = firstTable.previousElementSibling;
searchContainer.appendChild(searchInput);
content.insertBefore(heightAdjust, tableTitle)
content.insertBefore(searchContainer, heightAdjust)


// const searchInput = document.getElementById("searchInput");
// const searchContainer = document.getElementById("searchContainer");
const searchRect = searchInput.getBoundingClientRect();
searchInput.addEventListener("keyup", searchShortcut);
const brTag = "<" + "br" + ">";
const distanceToTop = tables[0].offsetTop;



document.addEventListener('scroll', scrollFunction);
window.addEventListener("resize", scrollFunction);

//function to make the searchbox stick to the top when scrolled
function scrollFunction() {
    // const heightAdjust = document.getElementById("heightAdjust");
    let tableWidth = 0;
    //loopthrough all the tables and find out which is the widest to set the width of the search box
    for (const table of tables) {
        if (table.clientWidth > tableWidth) tableWidth = table.clientWidth;
    }
    //if all the table width is 0 that means no table is visible or else set the width to the visible one.
    if (tableWidth > 0) tableWidth = tableWidth + 'px';
    else if (tableWidth == 0) tableWidth = '100%';
    const topAdjust = distanceToTop - 350;
        //detect for the change in the header class which occurs after the scroll and apply the changes
    if (document.getElementsByClassName("after-scroll-wrap").length > 0) {
        // if (document.documentElement.scrollTop > 150) {
        searchContainer.className = 'searchContainerScroll';
        searchContainer.style.width = tableWidth;
        heightAdjust.style.height = topAdjust + "px";
    } else {
        searchContainer.className = 'searchContainer';
        searchContainer.style.width = tableWidth;
        heightAdjust.style.height = "0px";
    }
}

function searchShortcut(e) {
    const inputTag = e.target;
    const filter = inputTag.value.toUpperCase();
    const canvas = inputTag.parentElement.parentElement;
    const tables = canvas.getElementsByTagName("tbody");
    const rightNav = document.getElementsByClassName("ez-toc-list ez-toc-list-level-1")[0];
    let resultsCount = 0;
    // Loop through all the tables
    for (const table of tables) {
        const tableRows = table.getElementsByTagName("tr");
        const tParent = table.parentElement;
        let matchFoundInTable = false;
        // set the table height to auto and capture the height attribute to set it back later
        if (filter.length > 0) {
            if (tParent.style.height != "auto") tParent.setAttribute("height-data", tParent.style.height);
            tParent.style.height = "auto";
        } else {
            tParent.style.height = tParent.getAttribute("height-data");
        }
        // Loop through the Rows of each Table
        for (const tableRow of tableRows) {
            let matchFound = false;
            let notHeader;
            // get the value of each cells in the table
            const tableCells = tableRow.getElementsByTagName("td");
            let content = "";
            // put the entire content of the row into one string to check if the row has any match
            for (const tableCell of tableCells) {
                content = content + " " + (tableCell.innerText || tableCell.textContent);
            }
            //check for any matches in the entire row using "AND" logic to make sure the row has all the words
            let matchFoundInRow = (checkForMatches(filter, content).And) ? true : false;
            if (content.split(' ').length > 1) {
                // find out if it is not a header row
                notHeader = (content.split(' ')[1].slice(0, 6) != "Action") ? true : false;
                // make sure there is a match and it is not a header
                if (matchFoundInRow && notHeader) {
                    // if it is a single cell description in a row then hide it else make it visible
                    if (tableCells.length == 1 && filter.length > 0) {
                        tableRow.style.display = "none";
                    } else if (tableCells.length > 1) {
                        tableRow.style.display = "";
                    }
                    // loop through each cell in a row
                    for (const tableCell of tableCells) {
                        const cellValue = tableCell.innerText || tableCell.textContent;
                        const cellIndex = cellValue.toUpperCase().indexOf(filter);
                        // find out if the cell has matching value with the input and it is not a single cell description
                        if (matchFoundInRow && tableCells.length > 1) {
                            // if (tableCells.length > 1) {
                            // check if the cell has more sub elements
                            checkForChildren(tableCell, filter);
                            // use the below variables later below, which determine whether there is a match in the row
                            matchFoundInTable = true;
                            matchFound = true;
                        } else {
                            // run the below function anyways. check the function for more details
                            if (tableCells.length > 1) checkForChildren(tableCell, filter)
                        }
                    }
                }
            }
            // if a match is found inside one of the cells then make the row visible
            if (matchFound && tableCells.length > 1) {
                tableRow.style.display = "";
                // count the number of times a match is found to display at the top
                resultsCount++;
                // else hide the row unless its not a header
            } else if (notHeader) {
                tableRow.style.display = "none";
            }
            if (filter.length == 0 && tableCells.length == 1) tableRow.style.display = "";
        }
        // if no results are found in the entire table then hide the table
        if (!matchFoundInTable) {
            tParent.style.display = "none";
            tParent.previousElementSibling.style.display = "none";
            // rightNav.style.display = "none";
        } else {
            tParent.style.display = "";
            tParent.previousElementSibling.style.display = "";
            // rightNav.style.display = "";
        }
    }
    // check if there is an element exists which displays the number of results
    let checkNoOfResults = document.getElementById("noOfResults");
    if (!checkNoOfResults) {
        // if it doesn't exist then create one
        const noOfResults = document.createElement("p");
        noOfResults.id = "noOfResults";
        noOfResults.style = "font-size: 14px; font-weight: 400";
        checkNoOfResults = noOfResults;
    }
    // show the number of results found
    if (resultsCount > 1) checkNoOfResults.innerText = resultsCount + " results found.";
    else if (resultsCount == 1) checkNoOfResults.innerText = resultsCount + " result found.";
    else if (resultsCount == 0) checkNoOfResults.innerText = "No results found.";
    // checkNoOfResults.innerText = (resultsCount > 1) ? resultsCount + " results found." : resultsCount + " result found.";
    inputTag.parentElement.insertBefore(checkNoOfResults, inputTag.nextElementSibling);
    // if everything from the input is deleted then remove the no of results
    if (filter.length == 0) checkNoOfResults.remove();
    scrollFunction();
}

// function to check for sub-elements if there are any (this is to handle the cells which has bullet points and multiple lines with br tag)
function checkForChildren(element, filter) {
    const count = element.childElementCount;
    let brExists = false,
        bulletList = false,
        multiplePTag = false,
        hyperlink = false
        //check for specific tags to determine the how to handle the content
    let i = 0;
    for (const child of element.children) {
        if (child.nodeName == "BR") brExists = true;
        if (child.nodeName == "UL" || child.nodeName == "OL") bulletList = true;
        if (child.nodeName == "P") {
            // if (i == 2) console.log(child)
            for (const el of child.children) {
                if (el.nodeName == "A") hyperlink = true;
            }
            multiplePTag = true;
        }
        i++;
    }
    if (brExists) highlightAndRetain(element, filter, brTag, hyperlink)
        //if there is bullet list then loop through each list item and highlight the text
    if (bulletList) {
        for (const child of element.children) {
            if (child.nodeName == "P") highlightText(child, filter, hyperlink)
            if (child.nodeName == "UL" || child.nodeName == "OL") {
                for (const item of child.children) {
                    highlightText(item, filter, hyperlink)
                }
            }
        }
    } else if (multiplePTag) {
        for (const child of element.children) {
            highlightText(child, filter, hyperlink)
        }
    } else highlightText(element, filter, hyperlink)
}

function highlightAndRetain(element, filter, type, hyperlink) {
    // split the HTML with br tags
    const highlightable = element.innerHTML.split(type);
    let cellParts = [];
    for (child of highlightable) {
        const dummyTag = document.createElement("span");
        dummyTag.innerHTML = child;
        // highlight the elements seperatly and put them together into an array
        cellParts.push(highlightText(dummyTag, filter, hyperlink));
    }
    // combine the array by adding a br tag back and then put that inside the elements HTML
    element.innerHTML = cellParts.join(type);
}

function highlightText(tableCell, filter, hyperlink) {
    const cellValue = tableCell.innerText || tableCell.textContent;
    const cellIndex = cellValue.toUpperCase().indexOf(filter);
    const splitStrings = filter.split(' ');
    // remove if there is any duplication of words to avoid errors
    const filterStrings = splitStrings.filter((c, index) => {
        return splitStrings.indexOf(c) === index;
    });
    let returnHTML;
    // check for matches in the cell with the "OR" logic since we have already filtered the row with "AND" logic.
    const matchFound = (checkForMatches(filter, cellValue).Or) ? true : false;
    let breakPoints = {};
    let newPoints = [];
    if (matchFound) {
        breakPoints = {};
        let stringCount = 0;
        // check for breakpoints wherever every match for every word starts and ends
        for (const filterString of filterStrings) {
            if (filterString.length > 0) {
                breakPoints[filterString] = findAllMatches(cellValue, filterString);
                stringCount++;
            }
        }
        // use the breakpoints to ignore any repeatition of highlight action to avoid errors
        for (let i = stringCount - 1; i >= 1; i--) {
            const validateStrings = breakPoints[filterStrings[i]];
            for (let k = 0; k < validateStrings.length; k++) {
                for (let j = stringCount - 2; j >= 0; j--) {
                    const interruptStrings = breakPoints[filterStrings[j]];
                    for (const interruptString of interruptStrings) {
                        try {
                            // capture the places wherever there is an overlap of matches
                            if (validateStrings[k].firstIndex >= interruptString.firstIndex &&
                                validateStrings[k].firstIndex <= interruptString.firstIndex + interruptString.secondIndex) {
                                newPoints.push(breakPoints[filterStrings[i]][k].stringID);
                            }
                        } catch (error) {}
                    }
                }
            }
        }
        let pointsArray = [];
        // use the captured points of overlaps to ignore them and create a new list of breakpoints
        for (const points in breakPoints) {
            for (const point of breakPoints[points]) {
                let matchFound = false;
                for (const newPoint of newPoints) {
                    if (newPoint == point.stringID) matchFound = true;
                }
                if (!matchFound) pointsArray.push(point);
            }
        }
        // arrange the breakpoints in the right order
        pointsArray.sort((x, y) => {
            return y.firstIndex - x.firstIndex;
        });
        returnHTML = divideAndHighlight(tableCell, pointsArray);
        tableCell.innerHTML = returnHTML;
    } else {
        // if there is no match found then get the plain text and put it inside as HTML (this will remove any existing highlight from it)
        if (hyperlink && checkForLinks(tableCell)) {
            returnHTML = tableCell.innerHTML;
        } else {
            returnHTML = cellValue;
            tableCell.innerHTML = cellValue;
        }
    }
    // return the html (this is used in highlightAndRetain function)
    return returnHTML;
}

function findAllMatches(content, filter) {
    const index = content.toUpperCase().indexOf(filter);
    let breakPoints = [];
    if (index > -1) {
        let firstIndex = index;
        let secondIndex = index + filter.length;
        let secondMatch;
        let count = 0;
        do {
            breakPoints.push({
                'firstIndex': firstIndex,
                'secondIndex': filter.length,
                'stringID': Math.random().toString(36).replace(/[^a-z]+/g, '').substring(2, 10)
            });
            const secondPart = content.slice(secondIndex, content.length);
            secondMatch = secondPart.toUpperCase().indexOf(filter);
            count++;
            if (secondMatch > -1) {
                secondMatch = secondMatch + secondIndex;
                firstIndex = secondMatch;
                secondIndex = secondMatch + filter.length;
            }
        } while (secondMatch > -1);
    }
    return breakPoints;
}

function checkForMatches(filterString, content) {
    let matchCount = 0;
    let filterIndexArray = [];
    const filterArray = filterString.split(' ');
    let matchFound = {
        'And': false,
        'Or': false
    }
    for (const filterString of filterArray) {
        const index = content.toUpperCase().indexOf(filterString);
        filterIndexArray.push(index);
        if (index > -1) {
            matchCount++;
        }
    }
    if (filterArray.length == matchCount) matchFound.And = true;
    if (matchCount > 0) matchFound.Or = true;
    return matchFound;
}

function divideAndHighlight(tableCell, breakPoints) {
    const textContent = tableCell.innerText || tableCell.textContent;
    let htmlContent = textContent;
    let i = 0;
    for (const breakPoint of breakPoints) {
        const first = breakPoint.firstIndex,
            second = breakPoint.secondIndex,
            index = breakPoint.stringCount;
        const part1 = htmlContent.slice(0, first);
        const part2 = htmlContent.slice(first, first + second);
        const part3 = htmlContent.slice(first + second, htmlContent.length);
        const highlightTag = (part2.length > 0) ? "<span class='highlight'>" + part2 + "</span>" : "";
        htmlContent = part1 + highlightTag + part3;
        i++;
    }
    if (checkForLinks(tableCell)) {
        htmlContent = tableCell.innerHTML;
    }
    // console.log(tableCell.innerHTML);
    return htmlContent;
}

function checkForLinks(element) {
    let status = false;
    for (const child of element.children) {
        if (child.nodeName == "A") {
            status = true;
        }
    }
    return status;
}