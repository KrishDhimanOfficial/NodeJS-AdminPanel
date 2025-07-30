import '../vendor/jquery/jquery.min.js'
import '../vendor/bootstrap/js/bootstrap.bundle.min.js'
import '../vendor/select2/js/select2.full.min.js'
import '../vendor/pace-progress/pace.min.js'
import '../vendor/summernote/summernote.min.js'
import '../vendor/adminlte/adminlte.min.js'
import '../vendor/iconpicker/fontawesome-iconpicker.min.js'
import Fetch from "./fetch.js"
import {
    datatable, displayPreviewImage, apiInput, updatetableDataStatus,
    Form, Notify, previewImageInput, openDangerModal, setupSelect2, deleteCRUDFieldRow
} from "./variable.js";

datatable && initializeTabulator()
$('.iconpicker').length && $('.iconpicker').iconpicker({
    fullClassFormatter: function (val) {
        return 'fa ' + val;
    }
})
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
let collections = null;
const addFieldBtn = document.querySelector('#addFieldBtn');
const fieldsContainer = document.querySelector('#addField');
(async () => collections = await Fetch.get('/admin/collections'))()
deleteCRUDFieldRow('#addField')

addFieldBtn && (addFieldBtn.onclick = () => {
    const filters = ['search', 'boolean', 'groupValueFilter', 'date', 'minmax', 'number']
    const fieldId = `field_${counter}`;
    const typeId = `type_${counter}`;
    const formTypeId = `form_type_${counter}`;
    const collectionId = `relation_collection_${counter}`;
    const searchFilterId = `search_filter_${counter}`

    const fieldTemplate = `
    <div class="field-group">
    <h3>Field ${counter + 1}</h3>
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
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="field[${counter}][isVisible]" id="visible_${counter}">
                        <label class="form-check-label" for="visible_${counter}">IsVisible</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" data-counter="${counter}" id="default_value_${counter}">
                        <label class="form-check-label" for="default_value_${counter}">Set Default Value</label>
                    </div>
            </div>
            <div class="col-md-4">
                <label for="${searchFilterId}" class="form-label">Search Filter</label>
                <select name="field[${counter}][searchFilter]" class="select2 form-control" id="${searchFilterId}">
                 <option disabled selected>Select Search Filter</option>
                    ${filters.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-4">
                <label for="${collectionId}" class="form-label">Field Relation</label>
                <select name="field[${counter}][relation]" class="select2 form-control" id="${collectionId}">
                    <option selected>No Relation</option>
                    ${collections.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
        </div>
        <hr style="border-top:1px solid rgba(0,0,0,0.4);">
    </div>`;

    fieldsContainer.insertAdjacentHTML('beforeend', fieldTemplate)
    counter++;
    $('.select2').select2()
})

fieldsContainer.onclick = (e) => {
    console.log(e.target);

    console.log(e.target.dataset.counter);

}

function FieldRow(fieldId, formTypeId, typeId, counter) {
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

const subMenuCheck = document.querySelector('#isSubMenu')
subMenuCheck && (subMenuCheck.onchange = () => {
    document.querySelector('#subMenusettings').classList.toggle('d-none')
    document.querySelector('#mainIcon').classList.toggle('d-none')
})