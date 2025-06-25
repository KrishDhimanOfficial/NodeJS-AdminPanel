export const previewImageInput = document.querySelector('#photo')
export const apiInput = document.querySelector('#apiInput')
export const Form = document.querySelector('#SubmitForm') || document.querySelector('#updateForm')
export const submitFormBtn = document.querySelector('#submitFormBtn')
export const datatable = document.querySelector('#tabulator')
const pdfbtn = document.getElementById("download-pdf")
const xlsxbtn = document.getElementById("download-xlsx")
const csvbtn = document.getElementById("download-csv")
const select = document.querySelector('#hide-column-select')
const dataTableAPI = document.querySelector('#dataTableAPI')
import Fetch from "./fetch.js"

const notyf = new Notyf({
    duration: 1000,
    position: { x: 'right', y: 'bottom' },
    types: [
        { type: 'warning', background: 'orange', duration: 2000 },
        { type: 'info', background: 'lightblue', duration: 2000 }
    ]
}) // Set Notifications For Server Response

export const displayPreviewImage = async (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = () => previewImage.src = reader.result;
    reader.readAsDataURL(file)
}

export const Notify = (data) => {
    if (data.success) notyf.success(data.success)
    if (data.warning) notyf.open({ type: 'warning', message: data.warning })
    if (data.info) notyf.open({ type: 'info', message: data.info })
    if (data.error) notyf.error(data.error)
    if (data.errors) data.errors.forEach(error => notyf.error(error))
    return;
}

const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const openDangerModal = (api) => { // Handle Open Delete Modal
    modalconfirmdeleteBtn.onclick = () => handleDeleteRequest(api)
}

const handleDeleteRequest = async (api) => {
    const res = await Fetch.delete(api)
    Notify(res)
    if (res.success) setTimeout(() => window.location.reload(), 1000)
}

// Tabulator 
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
    dob: {
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
    linksActions: (cell) => {
        const { _id } = cell.getRow().getData();
        return `
        <div class="d-flex gap-3 justify-content-center">
            <a href='${window.location.pathname}/${_id}' class="btn btn-success btn-lg">
                <i class="fa-solid fa-pen-to-square" ></i>
            </a>
            <button class="btn btn-danger btn-lg m-0 danger-modal" data-id="${_id}" data-toggle="modal" data-target="#modal-danger">
                <i class="fa-solid fa-trash" data-id="${_id}"></i>
            </button>
        </div>`;
    },
    actions: (cell) => {
        const { _id } = cell.getRow().getData();
        return `
        <div class="d-flex gap-3 justify-content-center">
            <button class="btn btn-success btn-lg edit" data-id="${_id}" data-toggle="modal" data-target="#openModal">
                <i class="fa-solid fa-pen-to-square" data-id="${_id}"></i>
            </button>
            <button class="btn btn-danger btn-lg m-0 danger-modal" data-id="${_id}" data-toggle="modal" data-target="#modal-danger">
                <i class="fa-solid fa-trash" data-id="${_id}"></i>
            </button>
        </div>`;
    },
    default: (cell) => `<span style="font-size: 18px;font-weight: semi-bold; color: #333;">${cell.getValue()}</span>`,
}

let table = null;
export const initializeTabulator = async () => {
    try {
        return new Promise(async (resolve) => {
            table = new Tabulator("#tabulator", {
                layout: "fitColumns",         // fit columns to width of table
                responsiveLayout: "hide",    // hide columns that don't fit on the table
                addRowPos: "top",           // when adding a new row, add it to the top of the table
                history: true,             // allow undo and redo actions on the table
                paginationSize: 10,
                pagination: "local",
                printAsHtml: true,
                ajaxURL: dataTableAPI?.value.trim() || '',
                ajaxResponse: function (url, params, response) {
                    response.columns.map(col => select.append(new Option(col.col.replace(/_/g, ' '), col.col)))
                    const columns = response.columns.map(column => {
                        return {
                            title: capitalizeFirstLetter(column.col),
                            field: column.col.replace(/_/g, ' '),
                            formatter: columnsOptions[column.col] || columnsOptions.default,
                            hozAlign: "left",
                            vertAlign: "middle",
                            ...columnsOptions[column.col],
                            ...filterOptions[column.filter],
                            ...(!column.filter && ''),
                        }
                    })
                    this.setColumns(columns); // ✅ Set columns after data arrives
                    return response.data
                },
                paginationSizeSelector: [5, 10, 15, 20],
                paginationCounter: "rows", //display count of paginated rows in footer
                movableColumns: true,      //allow column order to be changed
                tableBuilt: () => { resolve() }
            })
        })
    } catch (error) {
        console.error(error)
    }
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