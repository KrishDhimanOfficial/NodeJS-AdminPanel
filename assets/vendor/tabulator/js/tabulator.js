// Tabulator 
const pdfbtn = document.getElementById("download-pdf")
const xlsxbtn = document.getElementById("download-xlsx")
const csvbtn = document.getElementById("download-csv")
const select = document.querySelector('#hide-column-select')
const dataTableAPI = document.querySelector('#dataTableAPI')

const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const filterOptions = { // Tabulator Filter Options
    search: {
        sorter: 'string',
        headerFilter: 'input',
        headerFilterPlaceholder: 'Search'
    },
    boolean: {
        sorter: "boolean",
        editorParams: { values: [{ label: "Active", value: true }, { label: "InActive", value: false }] },
        headerFilter: 'list',
        headerFilterParams: { values: { "": "All", "true": "Active", "false": "InActive" } },
        accessorDownload: (value) => value ? "Active" : "Inactive"
    },
    valueFilter: {
        sorter: 'string',
        editor: "input",
        headerFilter: "list",
        editable: false,
        headerFilterParams: { valuesLookup: true, clearable: true }
    },
    date: {
        sorter: 'date',
        headerFilter: 'input',
        headerFilterPlaceholder: 'Search'
    },
    minmax: {
        sorter: "number",
        headerFilter: minMaxFilterEditor,
        headerFilterFunc: minMaxFilterFunction,
        headerFilterLiveFilter: false
    },
    number: {
        editor: "star",
        width: 100,
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: ">="
    },
    default: {
        headerFilter: 'input',
        sorter: 'string',
        headerFilterPlaceholder: 'Search'
    }
}

const columnsOptions = { // Tabulator Column Options
    status: (cell) => {
        const { _id, status } = cell.getRow().getData();
        return `<label class="switch">
            <input type="checkbox" ${status ? 'checked' : ''} data-id="${_id}" class="status">
            </label>`;
    },
    actions: (cell) => {
        const { _id } = cell.getRow().getData()
        const { staticView, view, edit, staticEdit, del } = cell.getColumn().getDefinition()
        const buttons = document.createElement('div')
        buttons.className = 'd-flex flex-wrap gap-3';

        if (view) {
            buttons.insertAdjacentHTML('beforeend', `<a href='${window.location.pathname}/view/${_id}' class="btn btn-primary btn-sm">
                <i class="fa-solid fa-eye" ></i>
                </a>`)
        }
        if (staticView) {
            buttons.insertAdjacentHTML('beforeend', `<button class="btn btn-primary btn-sm m-0" data-id="${_id}" data-toggle="modal" data-target="#modal-danger">
                <i class="fa-solid fa-eye" data-id="${_id}"></i>
                </button>`)
        }
        if (edit) {
            buttons.insertAdjacentHTML('beforeend', `<a href='${window.location.pathname}/${_id}' class="btn btn-success btn-sm">
                <i class="fa-solid fa-edit" ></i>
                </a>`)
        }
        if (staticEdit) {
            buttons.insertAdjacentHTML('beforeend', `<button class="btn btn-success btn-sm m-0" data-id="${_id}" data-toggle="modal" data-target="#modal-danger">
                <i class="fa-solid fa-edit" data-id="${_id}"></i>
                </button>`)
        }
        if (del) {
            buttons.insertAdjacentHTML('beforeend', `<button class="btn btn-danger btn-sm m-0 danger-modal" data-id="${_id}" data-toggle="modal" data-target="#modal-danger">
                <i class="fa-solid fa-trash" data-id="${_id}"></i>
                </button>`)
        }
        return buttons;
    },
    default: (cell) => `<span style="font-size: 18px;font-weight: semi-bold; color: #333;">${cell.getValue()}</span>`,
}

let table = null;
const initializeTabulator = async () => {
    try {
        return new Promise(async (resolve) => {
            table = new Tabulator("#tabulator", {
                layout: "fitColumns",   // fit columns to width of table
                addRowPos: "top",      // when adding a new row, add it to the top of the table
                history: true,        // allow undo and redo actions on the table
                printAsHtml: true,
                pagination: true,
                paginationSize: 10,
                paginationMode: "remote",
                dataReceiveParams: { last_page: "last_page", data: "data" },
                paginationDataSent: { page: "page", size: "size" },
                paginationSizeSelector: [5, 10, 15, 20],
                paginationCounter: "rows", //display count of paginated rows in footer
                ajaxURL: dataTableAPI?.value.trim() || '',
                ajaxResponse: function (url, params, response) {
                    if (response.data.length == 0) {
                        csvbtn.remove(), pdfbtn.remove(), xlsxbtn.remove()
                        this.destroy()
                        return []
                    }
                    response.columns.map(col => select.append(new Option(col.col.replace(/_/g, ' '), col.col)))
                    const columns = response.columns.map(column => {
                        return {
                            title: capitalizeFirstLetter(column.col).replace(/_/g, ' '),
                            field: column.col,
                            formatter: columnsOptions[column.col] || columnsOptions.default,
                            hozAlign: "left",
                            vertAlign: "middle",
                            ...column.actions,
                            ...columnsOptions[column.col],
                            ...filterOptions[column.filter],
                            ...(!column.filter && ''),
                        }
                    })
                    this.setColumns(columns) // ✅ Set columns after data arrives
                    return response
                },
                movableColumns: true,  //allow column order to be changed
                tableBuilt: () => { resolve() }
            })
        })
    } catch (error) {
        console.error(error)
    }
}
initializeTabulator()

if (select) select.addEventListener("change", function () {
    const field = this.value;
    const column = table.getColumn(field)
    const visible = column.isVisible()
    if (field) {
        visible ? column.hide() : column.show()
        this.selectedIndex = 0; // reset select after toggle
    }
})

//trigger download of data.csv file
if (csvbtn) csvbtn.addEventListener("click", function () {
    const csvName = document.querySelector('title').innerHTML.trim();
    table.download("csv", `${csvName}.csv`);
})

//trigger download of data.pdf file
if (pdfbtn) pdfbtn.addEventListener("click", function () {
    const pdfName = document.querySelector('title').innerHTML.trim();
    table.download("pdf", `${pdfName}.pdf`, {
        orientation: "portrait", //set page orientation to portrait
    })
})
// trigger download of data.xlsx file
if (xlsxbtn) xlsxbtn.addEventListener("click", () => {
    const xlsxName = document.querySelector('title').innerHTML.trim();
    table.download("xlsx", `${xlsxName}.xlsx`, { sheetName: `${xlsxName}` });
})


// Tabulator minMax Filters
function minMaxFilterEditor(cell, onRendered, success, cancel, editorParams) {
    var end;
    var container = document.createElement("span")

    //create and style inputs
    var start = document.createElement("input")
    start.setAttribute("type", "number")
    start.setAttribute("placeholder", "Min")
    start.setAttribute("min", 0);
    start.setAttribute("max", 100);
    start.style.padding = "4px";
    start.style.width = "50%";
    start.style.boxSizing = "border-box";
    start.value = cell.getValue()

    function buildValues() { success({ start: start.value, end: end.value }) }
    function keypress(e) {
        if (e.keyCode == 13) { buildValues() }
        if (e.keyCode == 27) { cancel() }
    }

    end = start.cloneNode()
    end.setAttribute("placeholder", "Max");

    start.addEventListener("change", buildValues)
    start.addEventListener("blur", buildValues)
    start.addEventListener("keydown", keypress)

    end.addEventListener("change", buildValues)
    end.addEventListener("blur", buildValues)
    end.addEventListener("keydown", keypress)

    container.appendChild(start)
    container.appendChild(end)

    return container;
}

function minMaxFilterFunction(headerValue, rowValue, rowData, filterParams) {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

    if (rowValue) {
        if (headerValue.start != "") {
            if (headerValue.end != "") {
                return rowValue >= headerValue.start && rowValue <= headerValue.end;
            } else {
                return rowValue >= headerValue.start;
            }
        } else {
            if (headerValue.end != "") rowValue <= headerValue.end;
        }
    }

    return true; //must return a boolean, true if it passes the filter.
}
// Tabulator 