import '../vendor/jquery/jquery.min.js'
import '../vendor/bootstrap/js/bootstrap.bundle.min.js'
import '../vendor/select2/js/select2.full.min.js'
import '../vendor/pace-progress/pace.min.js'
import '../vendor/summernote/summernote.min.js'
import '../vendor/adminlte/adminlte.min.js'
import Fetch from "./fetch.js"
import {
    datatable, displayPreviewImage, apiInput, updatetableDataStatus,
    Form, Notify, previewImageInput, openDangerModal, setupSelect2, deleteCRUDFieldRow
} from "./variable.js";
const selector = document.querySelector;

datatable && initializeTabulator()
$('.summernote').length && $('.summernote').summernote({ height: 300 })
$('.select2').length && $('.select2').select2()
previewImageInput && (
    previewImageInput.onchange = (e) => displayPreviewImage(e) // display image preview
)

Form && (
    Form.onsubmit = async (e) => {
        try {
            e.preventDefault()
            let res;
            submitFormBtn.disabled = true;
            submitFormBtn.innerHTML = 'Submitting...';

            const formdata = new FormData(e.target)

            Form.id === 'SubmitForm' // Handle Data Submission To Server
                ? res = await Fetch.post(apiInput.value.trim(), formdata)
                : res = await Fetch.put(`${apiInput.value.trim()}/${e.target.dataset?.id}`, formdata)

            Notify(res) // Notify Server Message
            if (res.success && res.redirect) setTimeout(() => { window.location.href = res.redirect }, 800)
        } catch (error) {
            console.error(error)
        } finally {
            submitFormBtn.disabled = false;
            submitFormBtn.innerHTML = 'Submit';
        }
    }
)

datatable && (
    datatable.onclick = (e) => { // Handle Datatable Actions
        const endApi = `${apiInput.value.trim()}/${e.target.dataset.id}`;

        if (e.target.closest('.danger-modal')) openDangerModal(endApi)
        if (e.target.closest('.status')) updatetableDataStatus(e.target.checked, endApi)
        if (e.target.closest('.edit')) getTableRowData(endApi)
    }
)

// setupSelect2('#select', '/admin/resources/select/api/admin', 'Search Admin')
let counter = 0;
const addFieldBtn = document.querySelector('#addFieldBtn')
let collections = null;
(async () => collections = await Fetch.get('/admin/collections'))()
deleteCRUDFieldRow('#addField')

addFieldBtn && (addFieldBtn.onclick = () => {
    const fieldId = `field_${counter}`;
    const typeId = `type_${counter}`;
    const formTypeId = `form_type_${counter}`;
    const collectionId = `relation_collection_${counter}`;

    const fieldTemplate = `
    <div class="field-group">
        ${FieldRow(fieldId, formTypeId, typeId, counter)}
        <div class="row mb-2">
            <div class="col-md-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="field[${counter}][required]" id="required_${counter}">
                        <label class="form-check-label" for="required_${counter}">Required</label>
                    </div>
                       <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="field[${counter}][unique]" id="unique_${counter}">
                        <label class="form-check-label" for="unique_${counter}">Unique</label>
                    </div>
            </div>
            <div class="col-md-3">
                    <label for="default_${counter}">Default Value</label>
                    <select name="field[${counter}][default_value_type]" class="select2 form-control" id="default_${counter}">
                        ${['string', 'number', 'boolean', 'date'].map(type => `<option value="${type}">${type}</option>`).join('')}
                    </select>
            </div>
        </div>
        <div class="row mb-3">
               <div class="col-md-4">
                <label for="${collectionId}" class="form-label">Field Relation</label>
                <select name="field[${counter}][relation]" class="select2 form-control" id="${collectionId}">
                    ${collections.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
        </div>
    </div>
    `;

    document.querySelector('#addField').insertAdjacentHTML('afterbegin', fieldTemplate)
    counter++;
    $('.select2').select2()
})

function FieldRow(fieldId, formTypeId, typeId, counter) {
    const schemaTypes = [
        "String", "Number", "Boolean", "Code", "Integer", "Array",
        "ObjectId", "Object", "Date", "Int32", "Int64", "Double128",
        "Double", "BSONRegExp", "Null", "Binary Data"
    ]

    const formInputTypes = [
        "text", "select", "file", "email", "url", "tel", "search", "number", "range",
        "color", "date", "time", "datetime-local", "month", "week", "radio", "checkbox", "textarea"
    ]
    const content = `
    <div class="row mb-2">
        <div class="col-md-3">
            <label for="${fieldId}" class="form-label">Field</label>
            <input type="text" class="form-control" name="field[${counter}][field_name]"
                    placeholder="eg: name, email, password" id="${fieldId}">
        </div>
        <div class="col-md-4">
            <label for="${typeId}" class="form-label">Type</label>
            <select name="field[${counter}][field_type]" class="select2 form-control" id="${typeId}">
                ${schemaTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-4">
            <label for="${formTypeId}" class="form-label">Edit in place</label>
            <select name="field[${counter}][form_type]" class="select2 form-control" id="${formTypeId}">
                ${formInputTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="deleteFieldRow btn btn-danger btn-close"></button>
        </div>
      </div>`;
    return content.trim()
}