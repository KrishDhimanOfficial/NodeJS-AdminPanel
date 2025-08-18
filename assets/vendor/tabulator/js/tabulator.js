// Tabulator 
const pdfbtn = document.getElementById("download-pdf")
const xlsxbtn = document.getElementById("download-xlsx")
const csvbtn = document.getElementById("download-csv")
const select = document.querySelector('#hide-column-select')
const tabulator = document.querySelector('#tabulator')
const dataTableAPI = document.querySelector('#dataTableAPI')

const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const filterOptions = { // Tabulator Filter Options
    search: {
        sorter: 'string',
        headerFilter: 'input',
        headerFilterPlaceholder: 'Search',
    },
    boolean: {
        sorter: "boolean",
        editorParams: { values: [{ label: "Active", value: true }, { label: "InActive", value: false }] },
        headerFilter: 'list',
        headerFilterParams: { values: { "": "All", "true": "Active", "false": "InActive" } },
        accessorDownload: (value) => value ? "Active" : "Inactive"
    },
    groupValueFilter: {
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
    No: (cell) => {
        const rowIndex = cell.getRow().getPosition()
        const page = cell.getTable().getPage()          // current page
        const pageSize = cell.getTable().getPageSize() // page size        
        return (page - 1) * pageSize + rowIndex;
    },
    image: (cell) => {
        const { image } = cell.getRow().getData()
        const setImage = image === undefined ? '/assets/images/default.png' : `/${image}`;
        return `<img src="${setImage}" alt="" loading="lazy"  width="120" height="120">`
    },
    status: (cell) => {
        const { _id, status } = cell.getRow().getData();
        return `<label class="switch">
            <input type="checkbox" ${status ? 'checked' : ''} data-id="${_id}" class="status">
            </label>`;
    },
    table_actions: (cell) => {
        const { _id, canDelete } = cell.getRow().getData()
        const { view, edit } = cell.getColumn().getDefinition()
        const buttons = document.createElement('div')
        buttons.className = 'd-flex flex-wrap gap-3';

        if (view) {
            buttons.insertAdjacentHTML('beforeend', `<a href='${window.location.pathname}/view/${_id}' class="btn btn-primary btn-sm">
                <i class="fa-solid fa-eye" ></i>
                </a>`)
        }
        if (edit) {
            buttons.insertAdjacentHTML('beforeend', `<a href='${window.location.pathname}/${_id}' class="btn btn-success btn-sm">
                <i class="fa-solid fa-edit" ></i>
                </a>`)
        }
        if (canDelete) {
            buttons.insertAdjacentHTML('beforeend', `<button class="btn btn-danger btn-sm m-0 danger-modal" data-id="${_id}" data-toggle="modal" data-target="#modal-danger">
                <i class="fa-solid fa-trash" data-id="${_id}"></i>
                </button>`)
        }
        return buttons;
    },
    actions: (cell) => {
        const { _id } = cell.getRow().getData()
        const { view, edit, del } = cell.getColumn().getDefinition()
        const buttons = document.createElement('div')
        buttons.className = 'd-flex flex-wrap gap-3';

        if (view) {
            buttons.insertAdjacentHTML('beforeend', `<a href='${window.location.pathname}/view/${_id}' class="btn btn-primary btn-sm">
                <i class="fa-solid fa-eye" ></i>
                </a>`)
        }
        if (edit) {
            buttons.insertAdjacentHTML('beforeend', `<a href='${window.location.pathname}/${_id}' class="btn btn-success btn-sm">
                <i class="fa-solid fa-edit" ></i>
                </a>`)
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
let filterColumns = [];
const initializeTabulator = async () => {
    try {
        return new Promise(async (resolve) => {
            table = new Tabulator("#tabulator", {
                layout: "fitColumns",   // fit columns to width of table
                addRowPos: "top",      // when adding a new row, add it to the top of the table
                history: true,        // allow undo and redo actions on the table
                printAsHtml: true,
                pagination: true,
                ajaxFiltering: true,
                filterMode: "remote",
                paginationMode: "remote",
                dataReceiveParams: { last_page: "last_page", data: "data" },
                paginationDataSent: { page: "page", size: "size" },
                paginationSize: 10,
                paginationSizeSelector: [10, 15, 20, 25, 50, 75, 100],
                paginationCounter: "rows", //display count of paginated rows in footer
                ajaxURL: dataTableAPI?.value.trim() || '',
                movableColumns: true,  //allow column order to be changed
                ajaxRequesting: function (url, params) {
                    if (params.filter && Array.isArray(params.filter)) {
                        params.filter = params.filter.map(f => {
                            const match = filterColumns.find(c => c.col.trim() === f.field.trim())
                            return {
                                field: f.field,
                                type: match.col === f.field && match.filter,
                                value: f.value
                            }
                        })
                    }
                    return true; // continue request
                },
                ajaxResponse: function (url, params, response) {
                    filterColumns = response.columns.filter(col => !col.actions)
                    if (response.data.length == 0) {
                        csvbtn.classList.add('d-none'), pdfbtn.classList.add('d-none'), xlsxbtn.classList.add('d-none')
                        // tabulator.innerHTML = '<div class="text-center my-5"><h2>No Data Found</h2></div>'
                        return []
                    } else {
                        csvbtn?.classList.remove('d-none'), pdfbtn?.classList.remove('d-none'), xlsxbtn?.classList.remove('d-none')
                    }
                    select && response.columns?.forEach(col => {
                        const value = col.col;
                        const label = col.col.replace(/_/g, ' ')

                        // Check if the option already exists
                        const exists = Array.from(select.options).some(option => option.value === value)
                        if (!exists) select.append(new Option(label, value))
                    })
                    // Only set columns once if they haven’t been set yet
                    if (!this.getColumnDefinitions().length) {
                        select && response.columns?.forEach(col => {
                            const value = col.col;
                            const label = col.col.replace(/_/g, ' ')
                            const exists = Array.from(select.options).some(option => option.value === value)
                            if (!exists) select.append(new Option(label, value))
                        })

                        const columns = response.columns?.map(column => ({
                            title: capitalizeFirstLetter(column.col.replace(/_/g, ' ')),
                            field: column.col,
                            formatter: columnsOptions[column.col] || columnsOptions.default,
                            downloadFormatter: columnsOptions[column.col] || columnsOptions.default,
                            hozAlign: "left",
                            vertAlign: "middle",
                            ...column.actions,
                            ...columnsOptions[column.col],
                            ...filterOptions[column.filter],
                            ...(!column.filter && ''),
                            ...column.maxWidth && { maxWidth: column.maxWidth },
                            ...(column.download !== undefined ? { download: column.download } : {}),
                        }))

                        this.setColumns(columns); // Only if not already set
                    }

                    // ✅ Debounced row-only update
                    debounceRefreshTable(response.data, this); // pass `this` as Tabulator instance
                    return response
                },
                tableBuilt: () => resolve()
            })
        })
    } catch (error) {
        console.error(error)
    }
}

initializeTabulator()

let debounceTimer;
function debounceRefreshTable(data, tableInstance) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        tableInstance.replaceData(data) // refresh rows only
    }, 300)
}

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
        if (e.keyCode == 13) buildValues()
        if (e.keyCode == 27) cancel()
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