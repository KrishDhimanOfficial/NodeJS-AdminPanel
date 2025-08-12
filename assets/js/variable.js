export const previewImageInput = document.querySelector('#previewImageInput')
export const displaySingleImge = document.querySelector('#displaySingleImge')
export const displayMultipleImge = document.querySelector('#displayMultipleImge')
export const previewImagesInput = document.querySelector('#previewImagesInput')
export const apiInput = document.querySelector('#apiInput')
export const Form = document.querySelector('#SubmitForm') || document.querySelector('#updateForm')
export const submitFormBtn = document.querySelector('#submitFormBtn')
export const datatable = document.querySelector('#tabulator')
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
    reader.onload = () => displaySingleImge.src = reader.result;
    reader.readAsDataURL(file)
}

// Function that display preview multiple images
export const displayPreviewImages = (e) => {
    const alert = document.querySelector('#imagesAlert')
    const files = e.target.files;
    const filesArray = Array.from(files)

    if (previewImg) previewImg.style.display = 'none';
    if (Formbtn.id === 'submitForm') previewMultipleImage.innerHTML = '';

    if (filesArray.length > 4) alert.style.display = 'block'
    else alert.style.display = 'none'

    filesArray.forEach(file => {
        const reader = new FileReader()
        const div = document.createElement('div')
        const ImgTag = document.createElement('img')
        const iTag = document.createElement('i')

        div.className = 'position-relative imgbox';
        iTag.className = 'bi bi-x-lg position-absolute z-2 top-50 start-50 translate-middle cross';

        div.appendChild(ImgTag)
        div.appendChild(iTag)

        reader.onload = () => {
            ImgTag.src = reader.result;
            iTag.dataset.image = file.name;
            ImgTag.classList.add('images')
        }
        reader.readAsDataURL(file)
        previewMultipleImage.appendChild(div)
    })
}

export const Notify = (data) => {
    if (data.success) notyf.success(data.success)
    if (data.warning) notyf.open({ type: 'warning', message: data.warning })
    if (data.info) notyf.open({ type: 'info', message: data.info })
    if (data.error) notyf.error(data.error)
    if (data.errors) data.errors.forEach(error => notyf.error(error))
    return;
}

export const openDangerModal = (api) => { // Handle Open Delete Modal
    modalconfirmdeleteBtn.onclick = () => handleDeleteRequest(api)
}

export const updatetableDataStatus = async (status, api) => {
    try {
        const res = await Fetch.patch(api, { status }, { 'Content-Type': 'application/json' })
        Notify(res)
    } catch (error) {
        console.error(error)
    }
}

const handleDeleteRequest = async (api) => {
    const res = await Fetch.delete(api)
    Notify(res)
    if (res.success) setTimeout(() => window.location.reload(), 1000)
}

export const setupSelect2 = (selector, url, placeholder) => {
    $(selector).select2({
        placeholder,
        ajax: {
            url,
            dataType: 'json',
            delay: 250,
            cache: true,
            data: params => ({ search: params.term }),
            processResults: data => ({
                results: data.map(item => ({
                    id: item.value,
                    text: item.label
                }))
            })
        }
    })
}

export const deleteCRUDFieldRow = (...selectors) => {
    selectors.forEach(selector => {
        const container = document.querySelector(selector)
        if (!container) return

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('deleteFieldRow')) {
                const row = e.target.closest('.field-group')
                row?.remove()
            }
        })
    })
}

export function FieldCheckBox(counter) {
    const content = `<div class="form-check">
                        <input class="form-check-input" type="checkbox" name="field[${counter}][required]" id="required_${counter}">
                        <label class="form-check-label" for="required_${counter}">Required</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="field[${counter}][unique]" id="unique_${counter}">
                        <label class="form-check-label" for="unique_${counter}">Unique</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="field[${counter}][isVisible]" id="visible_${counter}">
                        <label class="form-check-label" for="visible_${counter}">IsVisible</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" data-counter="${counter}" id="default_value_checkBox_${counter}">
                        <label class="form-check-label" for="default_value_checkBox_${counter}">Set Default Value</label>
                    </div>`;
    return content.trim()
}

export function setFieldDefaultValue(counter, defaultRow, val) {
    let input = '';

    switch (val) {
        case 'String':
            input = `<div class="col-md-3">
                    <div class="form-floating mb-3">
                        <input type="text" class="form-control" name="field[${counter}][defaultValue]" id="default_value_${counter}" placeholder="" />
                        <label for="default_value_${counter}" >Default Value</label>
                    </div>
                    </div>`
            break;
        case 'Number':
            input = `<div class="col-md-3">
                    <div class="form-floating mb-3">
                        <input type="number" class="form-control" name="field[${counter}][defaultValue]" id="default_value_${counter}" placeholder="" />
                        <label for="default_value_${counter}" >Default Value</label>
                    </div>
                    </div>`
            break;
        default: input = ''
            break;
    }
    defaultRow.innerHTML = input
}

export function FieldRow(fieldId, formTypeId, typeId, counter) {
    const schemaTypes = [
        "String", "Number", "Boolean", "Array", "ObjectId", "Map", "Date",
        "Double128", "Double", "Null", "Mixed"
    ]

    const formInputTypes = [
        "text", "select", "file", "email", "url", "tel", "search", "number", "range",
        "color", "date", "time", "datetime-local", "month", "week", "radio", "checkbox", "textarea"
    ]
    const content = `
    <div class="row mb-2">
        <div class="col-md-3">
            <label for="${fieldId}" class="form-label">Field Name</label>
            <input type="text" class="form-control" name="field[${counter}][field_name]"
                    placeholder="eg: name, email, password" id="${fieldId}">
        </div>
        <div class="col-md-4">
            <label for="${typeId}" class="form-label">Schema Type</label>
            <select name="field[${counter}][field_type]" class="select2 form-control" id="${typeId}">
                ${schemaTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-4">
            <label for="${formTypeId}" class="form-label">Form Type</label>
            <select name="field[${counter}][form_type]" data-counter="${counter}" class="select2 form-control" id="${formTypeId}">
                ${formInputTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="deleteFieldRow btn btn-danger btn-close"></button>
        </div>
    </div>`;
    return content.trim()
}